using System.Text.Json;
using RightPixel.Domain;
namespace RightPixel.Application;

public class PlayService(IGameWorkspace db, PlayerService player, TimeProvider clock, ICurrentPlayer current)
{
    static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    static OperationResult Bad(string message) => OperationResult.Problem(kind: ErrorKind.Validation, title: message);
    public async Task<OperationResult> Node(string id)
    {
        await using var snapshot = await db.BeginRead();
        var n = db.Nodes.SingleOrDefault(x => x.Id == id);
        return n is null ? OperationResult.NotFound() : !AccessPolicy.CanPlay(db, current.Id, n) ? OperationResult.Problem(ErrorKind.Conflict, "ابتدا اتاق قبلی را کامل کن.") : OperationResult.Ok(AccessPolicy.PublicNode(db, current.Id, n));
    }
    public async Task<OperationResult> Start(string id)
    {
        await using var tx = await db.BeginWrite();
        var n = db.Nodes.SingleOrDefault(x => x.Id == id);
        if (n is null)
            return OperationResult.NotFound();
        if (!AccessPolicy.CanPlay(db, current.Id, n)) return OperationResult.Problem(ErrorKind.Conflict, "ابتدا اتاق قبلی را کامل کن.");
        var p = db.PlayerProfiles.SingleOrDefault(x => x.Id == current.Id);
        p!.ActiveNodeId = id;
        p.UpdatedAt = clock.GetUtcNow().UtcDateTime;
        var a = db.GameAttempts.FirstOrDefault(x => x.PlayerId == current.Id && x.NodeId == id && !x.Resolved);
        if (a is null)
        {
            a = new GameAttempt { RoundIndex = db.PlayerCheckpoints.SingleOrDefault(x => x.PlayerId == current.Id && x.NodeId == id)?.BossRound ?? 0, Id = Guid.NewGuid(), PlayerId = current.Id, NodeId = id, StartedAt = clock.GetUtcNow().UtcDateTime };
            db.GameAttempts.Add(a);
        }
        await db.SaveChangesAsync();
        var state = await player.Read();
        await tx.CommitAsync();
        return OperationResult.Ok(new
        {
            roundIndex = a.RoundIndex,
            attemptId = a.Id,
            deadline = n.TimeLimitSec.HasValue ? a.StartedAt.AddSeconds(n.TimeLimitSec.Value) : (DateTime?)null,
            state
        });
    }
    public async Task<OperationResult> Answer(string id, AnswerRequest request)
    {
        if (request.AttemptId == Guid.Empty || request.Answer.ValueKind == JsonValueKind.Undefined)
            return Bad("ساختار پاسخ معتبر نیست.");
        await using var tx = await db.BeginWrite();
        var n = db.Nodes.SingleOrDefault(x => x.Id == id);
        var a = db.GameAttempts.SingleOrDefault(x => x.PlayerId == current.Id && x.Id == request.AttemptId);
        if (n is null || a is null || a.NodeId != id)
            return OperationResult.NotFound();
        if (!AccessPolicy.CanPlay(db, current.Id, n)) return OperationResult.Problem(ErrorKind.Conflict, "ابتدا اتاق قبلی را کامل کن.");
        var answerHash = DataJson.Hash(request.Answer);
        if (a.Resolved)
        {
            if (a.OutcomeJson is null || a.AnswerHash != answerHash)
                return OperationResult.Problem(kind: ErrorKind.Conflict, title: "این تلاش بسته شده یا پاسخ دیگری برای آن ثبت شده است؛ دوباره وارد اتاق شوید.");
            var saved = JsonSerializer.Deserialize<AnswerOutcome>(a.OutcomeJson, Json)!;
            return OperationResult.Ok(new
            {
                nodeCompleted = saved.Correct && saved.NodeCompleted,
                saved.Correct,
                saved.FailureReason,
                saved.NextNodeId,
                saved.EarnedXp,
                saved.EarnedCoins,
                saved.Explanation,
                state = await player.Read(),
                replayed = true
            });
        }
        var timedOut = RewardPolicy.Expired(clock.GetUtcNow().UtcDateTime, a.StartedAt, n.TimeLimitSec);
        if (!timedOut && request.Answer.ValueKind == JsonValueKind.Null)
            return Bad("ساختار پاسخ معتبر نیست.");
        bool correct;
        try
        {
            var evaluated = n;
            if (n.Type == NodeType.boss_fight) {
                var round = JsonDocument.Parse(n.PayloadJson).RootElement.GetProperty("rounds")[a.RoundIndex];
                evaluated = new Node { Type = Enum.Parse<NodeType>(round.GetProperty("type").GetString()!), PayloadJson = round.GetProperty("payload").GetRawText() };
            }
            correct = !timedOut && ChallengeRegistry.Evaluate(evaluated, request.Answer);
        }
        catch (Exception e) when (e is JsonException or InvalidOperationException or KeyNotFoundException or FormatException or NullReferenceException or ArgumentException) { return Bad("ساختار پاسخ معتبر نیست."); }
        string? failureReason = null;
        if (!correct)
        {
            failureReason = timedOut ? "timeout" : "incorrect_answer";
            if (!timedOut && n.Type == NodeType.bug_sniper)
            {
                var payload = JsonSerializer.Deserialize<BugSniperPayload>(n.PayloadJson, Json)!;
                failureReason = request.Answer.GetProperty("line").GetInt32() != payload.BuggyLineIndex ? "wrong_line" : "wrong_fix";
            }
        }
        a.Resolved = true;
        var p = (db.PlayerProfiles.SingleOrDefault(x => x.Id == current.Id))!;
        if (correct && n.Type == NodeType.boss_fight && a.RoundIndex < 2)
        {
            var checkpoint = db.PlayerCheckpoints.SingleOrDefault(x => x.PlayerId == current.Id && x.NodeId == id);
            if (checkpoint is null) { checkpoint = new PlayerCheckpoint { PlayerId = current.Id, NodeId = id }; db.PlayerCheckpoints.Add(checkpoint); }
            checkpoint.BossRound = a.RoundIndex + 1;
            checkpoint.StateJson = "{}"; checkpoint.Revision++;
            a.AnswerHash = answerHash;
            a.OutcomeJson = JsonSerializer.Serialize(new AnswerOutcome(true,null,null,0,0,"ضربه موفق؛ دور بعد را شروع کن.",false), Json);
            await db.SaveChangesAsync(); var partialState = await player.Read(); await tx.CommitAsync();
            return OperationResult.Ok(new { correct = true, nodeCompleted = false, earnedXp = 0, earnedCoins = 0, state = partialState, explanation = "ضربه موفق؛ دور بعد را شروع کن.", replayed = false });
        }
        var progress = db.PlayerNodeProgress.SingleOrDefault(x => x.PlayerId == p.Id && x.NodeId == id);
        if (progress is null)
        {
            progress = new PlayerNodeProgress { PlayerId = p.Id, NodeId = id };
            db.PlayerNodeProgress.Add(progress);
        }
        progress.Attempts++;
        int earnedXp = 0, earnedCoins = 0;
        if (correct)
        {
            if (n.Type == NodeType.boss_fight)
            {
                var checkpoint = db.PlayerCheckpoints.SingleOrDefault(x => x.PlayerId == p.Id && x.NodeId == id);
                if (checkpoint is not null)
                {
                    checkpoint.BossRound = 0;
                    checkpoint.StateJson = "{}";
                    checkpoint.Revision++;
                }
            }
            if (!progress.CompletedAt.HasValue) p.Streak++;
            p.BestStreak = Math.Max(p.BestStreak, p.Streak);
            var unlock = db.PlayerNodeUnlocks.SingleOrDefault(x => x.PlayerId == p.Id && x.NodeId == id);
            var multiplier = n.Type == NodeType.who_am_i && (unlock?.CluesRevealed ?? 1) <= 1 ? 2 : 1;
            (earnedXp, earnedCoins) = RewardPolicy.Calculate(n.XpReward, p.Streak, progress.CompletedAt.HasValue, multiplier == 2);
            p.Xp += earnedXp;
            p.Coins += earnedCoins;
            progress.CompletedAt ??= clock.GetUtcNow().UtcDateTime;
            progress.XpEarned += earnedXp;
        }
        else
        {
            p.Streak = 0;
            p.Hp = RewardPolicy.LoseLife(p.Hp);

        }
        string? nextNodeId = null;
        if (correct)
        {
            var stage = db.Stages.Single(s => s.Id == n.StageId);
            nextNodeId = (from node in db.Nodes
                          join nextStage in db.Stages on node.StageId equals nextStage.Id
                          where nextStage.WorldId == stage.WorldId && (nextStage.StageNumber > stage.StageNumber || (nextStage.Id == stage.Id && node.SortOrder > n.SortOrder))
                          orderby nextStage.StageNumber, node.SortOrder
                          select node.Id).FirstOrDefault();
        }
        a.AnswerHash = answerHash;
        a.OutcomeJson = JsonSerializer.Serialize(new AnswerOutcome(correct, failureReason, nextNodeId, earnedXp, earnedCoins, n.Explanation, correct), Json);
        p.UpdatedAt = clock.GetUtcNow().UtcDateTime;
        await db.SaveChangesAsync();
        var state = await player.Read();
        await tx.CommitAsync();
        return OperationResult.Ok(new
        {
            nodeCompleted = correct,
            correct,
            failureReason,
            nextNodeId,
            earnedXp,
            earnedCoins,
            explanation = n.Explanation,
            state,
            replayed = false
        });
    }
    public async Task<OperationResult> Purchase(string kind, string? nodeId, string? header)
    {
        await using var tx = await db.BeginWrite();
        var p = (db.PlayerProfiles.SingleOrDefault(x => x.Id == current.Id))!;
        Guid? key = null;
        var operation = kind + ":" + nodeId;
        if (header is not null)
        {
            if (!Guid.TryParse(header, out var parsed))
                return Bad("شناسهٔ درخواست معتبر نیست.");
            key = parsed;
            var receipt = db.ShopReceipts.SingleOrDefault(x => x.PlayerId == current.Id && x.Id == parsed);
            if (receipt is not null)
                return receipt.Operation == operation ? OperationResult.Ok(await player.Read()) : OperationResult.Problem(kind: ErrorKind.Conflict, title: "شناسهٔ درخواست برای خرید دیگری استفاده شده است.");
        }
        if (kind == "potion")
        {
            if (p.Hp >= p.MaxHp || p.Coins < 30)
                return Bad("جان کامل است یا سکه کافی نیست.");
            p.Hp++;
            p.Coins -= 30;
        }
        else
        {
            var n = db.Nodes.SingleOrDefault(x => x.Id == nodeId);
            if (n is null)
                return OperationResult.NotFound();
            if (!AccessPolicy.CanPlay(db, current.Id, n)) return OperationResult.Problem(ErrorKind.Conflict, "ابتدا اتاق قبلی را کامل کن.");
            var u = db.PlayerNodeUnlocks.SingleOrDefault(x => x.PlayerId == p.Id && x.NodeId == n.Id);
            if (u is null)
            {
                u = new PlayerNodeUnlock { PlayerId = p.Id, NodeId = n.Id, CluesRevealed = 1 };
                db.PlayerNodeUnlocks.Add(u);
            }
            if (kind == "hint")
            {
                if (string.IsNullOrWhiteSpace(n.Hint) || u.HintPurchased || p.Coins < 20)
                    return Bad("خرید راهنما ممکن نیست.");
                u.HintPurchased = true;
                p.Coins -= 20;
            }
            else if (kind == "clue" && n.Type == NodeType.who_am_i)
            {
                var count = JsonSerializer.Deserialize<WhoAmIPayload>(n.PayloadJson, Json)!.Clues.Length;
                if (u.CluesRevealed >= count)
                    return Bad("همهٔ سرنخ‌ها باز هستند.");
                u.CluesRevealed++;
            }
            else
                return Bad("درخواست نامعتبر است.");
        }
        if (key.HasValue)
            db.ShopReceipts.Add(new ShopReceipt { Id = key.Value, PlayerId = current.Id, Operation = operation, CreatedAt = clock.GetUtcNow().UtcDateTime });
        p.UpdatedAt = clock.GetUtcNow().UtcDateTime;
        await db.SaveChangesAsync();
        var state = await player.Read();
        await tx.CommitAsync();
        return OperationResult.Ok(state);
    }
}
