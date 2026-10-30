using System.Text.Json;
using RightPixel.Domain;
namespace RightPixel.Application;

public static class PackValidator
{
    static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    static void Require([System.Diagnostics.CodeAnalysis.DoesNotReturnIf(false)] bool value, string message)
    {
        if (!value)
            throw new ArgumentException(message);
    }
    static void Strings(string[]? a) => Require(a is { Length: > 0 } && a.All(x => !string.IsNullOrWhiteSpace(x)), "فهرست متنی خالی یا نامعتبر است.");
    static void Index(int index, string[] a) => Require(index >= 0 && index < a.Length, "اندیس پاسخ خارج از محدوده است.");
    public static void Validate(PackRequest p)
    {
        Require(p.Version == 1 && p.World is not null && p.Stages is { Count: > 0 }, "نسخه یا ساختار بسته معتبر نیست.");
        Require(!string.IsNullOrWhiteSpace(p.World!.Id) && !string.IsNullOrWhiteSpace(p.World.Title), "قلمرو باید شناسه و عنوان داشته باشد.");
        Require(p.World.Icon is not null && p.World.Color is not null, "مشخصات قلمرو ناقص است.");
        var stages = new HashSet<string>();
        var nodes = new HashSet<string>();
        var numbers = new HashSet<int>();
        foreach (var s in p.Stages!)
        {
            Require(s is not null && !string.IsNullOrWhiteSpace(s.Id) && !string.IsNullOrWhiteSpace(s.Title) && stages.Add(s.Id) && numbers.Add(s.StageNumber) && s.WorldId == p.World.Id && s.Nodes is { Count: > 0 } && s.StageNumber > 0, "مرحله نامعتبر یا تکراری است.");
            Require(s.BossName is not null, "نام باس نباید null باشد.");
            var orders = new HashSet<int>();
            foreach (var n in s.Nodes)
            {
                Require(n is not null && !string.IsNullOrWhiteSpace(n.Id) && !string.IsNullOrWhiteSpace(n.Title) && nodes.Add(n.Id) && orders.Add(n.SortOrder) && n.StageId == s.Id && n.SortOrder >= 0 && n.NpcName is not null && n.NpcSprite is not null && n.XpReward > 0 && n.XpReward <= 1000 && Enum.IsDefined(n.Type), "اتاق نامعتبر یا تکراری است.");
                Require(n.Payload.ValueKind == JsonValueKind.Object, "payload باید شیء باشد.");
                Require(n.TimeLimitSec is null or > 0 and <= 3600, "زمان اتاق معتبر نیست.");
                switch (n.Type)
                {
                    case NodeType.runtime_forge:
                    case NodeType.memory_mirror:
                    case NodeType.branch_gates:
                        Require(n.Payload.TryGetProperty("prompt", out _), "شرح بازی لازم است.");
                        break;
                    case NodeType.boss_fight:
                        Require(n.Payload.GetProperty("rounds").GetArrayLength() == 3, "باس سه دور دارد.");
                        break;
                    case NodeType.dialogue_lore:
                        var d = n.Payload.Deserialize<DialogueLorePayload>(Json)!;
                        Strings(d.Dialogues);
                        Require(!string.IsNullOrWhiteSpace(d.KeyTakeaway), "نکتهٔ کلیدی لازم است.");
                        break;
                    case NodeType.who_am_i:
                        var w = n.Payload.Deserialize<WhoAmIPayload>(Json)!;
                        Strings(w.Clues);
                        Strings(w.Options);
                        Require(w.Options.Contains(w.CorrectAnswer), "پاسخ در گزینه‌ها نیست.");
                        break;
                    case NodeType.bug_sniper:
                        var b = n.Payload.Deserialize<BugSniperPayload>(Json)!;
                        Strings(b.CodeLines);
                        Strings(b.FixOptions);
                        Index(b.BuggyLineIndex, b.CodeLines);
                        Index(b.CorrectFixIndex, b.FixOptions);
                        break;
                    case NodeType.bomb_defusal:
                        var t = n.Payload.Deserialize<BombDefusalPayload>(Json)!;
                        Strings(t.Blanks);
                        Strings(t.TokenBank);
                        Require(n.TimeLimitSec is > 0 and <= 3600 && t.CodeTemplate is not null && t.Blanks.Select((x, i) => t.TokenBank.Contains(x) && t.CodeTemplate.Contains($"__{i + 1}__")).All(x => x), "توکن‌ها، جای خالی یا زمان نامعتبر است.");
                        Require(System.Text.RegularExpressions.Regex.Matches(t.CodeTemplate!, @"__(\d+)__").Select(m => int.TryParse(m.Groups[1].Value, out var number) ? number : 0).Distinct().Order().SequenceEqual(Enumerable.Range(1, t.Blanks.Length)), "شماره‌های جای خالی با پاسخ‌ها همخوانی ندارند.");
                        break;
                    case NodeType.compiler_judge:
                        var j = n.Payload.Deserialize<CompilerJudgePayload>(Json)!;
                        Strings(j.VerdictOptions);
                        Index(j.CorrectVerdictIndex, j.VerdictOptions);
                        Require(!string.IsNullOrWhiteSpace(j.CodeSnippet), "کد لازم است.");
                        break;
                    case NodeType.code_puzzle:
                        var c = n.Payload.Deserialize<CodePuzzlePayload>(Json)!;
                        Strings(c.ScrambledLines);
                        Require(c.CorrectOrderIndices is { Length: > 0 } && c.CorrectOrderIndices.Distinct().Count() == c.CorrectOrderIndices.Length, "ترتیب پاسخ معتبر نیست.");
                        foreach (var i in c.CorrectOrderIndices)
                            Index(i, c.ScrambledLines);
                        if (c.Workshop is { } workshop)
                        {
                            Require(!string.IsNullOrWhiteSpace(workshop.SessionId) && !string.IsNullOrWhiteSpace(workshop.Task) && !string.IsNullOrWhiteSpace(workshop.StarterCode) && !string.IsNullOrWhiteSpace(workshop.SolutionCode) && workshop.ExpectedOutput is not null, "کارگاه ناقص است.");
                            Strings(workshop.Rubric);
                            Strings(workshop.Sources);
                            Require(workshop.Sources.All(s => Uri.TryCreate(s, UriKind.Absolute, out var uri) && uri.Scheme == "https"), "منبع کارگاه باید HTTPS باشد.");
                        }
                        break;
                }
            }
        }
    }
}
