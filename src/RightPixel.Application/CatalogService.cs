using System.Text.Json;
using RightPixel.Domain;
namespace RightPixel.Application;

public class CatalogService(IGameWorkspace db, PlayerService player, TimeProvider clock, ICurrentPlayer current)
{
    public async Task<OperationResult> Profile(UpdateProfileRequest request)
    {
        await using var tx = await db.BeginWrite();
        var name = request.PlayerName?.Trim();
        if (string.IsNullOrEmpty(name) || name.Length > 50)
            return OperationResult.ValidationProblem(new() { { "playerName", ["نام باید بین ۱ تا ۵۰ نویسه باشد."] } });
        var p = db.PlayerProfiles.Single(p => p.Id == current.Id);
        if (request.AvatarId is not null) { if (!System.Text.RegularExpressions.Regex.IsMatch(request.AvatarId, @"^avatar-(0[1-9]|[1-3][0-9]|4[0-8])$")) return OperationResult.Problem(ErrorKind.Validation, "شخصیت معتبر نیست."); p.AvatarId = request.AvatarId; }
        p.PlayerName = name;
        p.UpdatedAt = clock.GetUtcNow().UtcDateTime;
        await db.SaveChangesAsync();
        await tx.CommitAsync();
        return OperationResult.Ok(await player.Read());
    }
    public async Task<List<WorldDto>> Worlds()
    {
        await using var tx = await db.BeginRead();
        return db.Worlds.OrderBy(w => w.SortOrder).Select(w => new WorldDto(w.Id, w.Title, w.Icon, w.Color, w.SortOrder)).ToList();
    }
    public async Task<OperationResult> Stages(string id)
    {
        await using var tx = await db.BeginRead();
        if (!db.Worlds.Any(w => w.Id == id))
            return OperationResult.Problem(ErrorKind.NotFound, "World not found");
        return OperationResult.Ok(db.Stages.Where(s => s.WorldId == id).OrderBy(s => s.StageNumber).Select(s => new StageDto(s.Id, s.WorldId, s.Title, s.StageNumber, s.BossName)).ToList());
    }
    public async Task<OperationResult> Nodes(string id)
    {
        await using var tx = await db.BeginRead();
        if (!db.Stages.Any(s => s.Id == id))
            return OperationResult.Problem(ErrorKind.NotFound, "Stage not found");
        return OperationResult.Ok(db.Nodes.Where(n => n.StageId == id).OrderBy(n => n.SortOrder).Select(n => new { n.Id, n.StageId, n.SortOrder, n.Type, n.Title, n.NpcName, n.NpcSprite, n.XpReward, n.TimeLimitSec, isLocked = !AccessPolicy.CanPlay(db, current.Id, n) }).ToList());
    }
}
