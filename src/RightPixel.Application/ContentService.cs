using System.Text.Json;
using RightPixel.Domain;
namespace RightPixel.Application;
public class ContentService(IGameWorkspace db)
{
    public static void Validate(PackRequest pack)
    {
        try { PackValidator.Validate(pack); }
        catch (Exception e) when(e is ArgumentException or JsonException or NullReferenceException) { throw new AppProblem(ErrorKind.Validation,"ساختار دوره معتبر نیست: "+e.Message); }
    }
    public async Task Append(PackRequest pack)
    {
        Validate(pack);await using var tx=await db.BeginWrite();
        if(db.AllWorlds.Any(w=>w.Id==pack.World.Id))return;
        var w=pack.World;db.AllWorlds.Add(new World {Id=w.Id,Title=w.Title,Icon=w.Icon,Color=w.Color,SortOrder=w.SortOrder});
        foreach(var s in pack.Stages){
            db.AllStages.Add(new Stage {Id=s.Id,WorldId=s.WorldId,Title=s.Title,StageNumber=s.StageNumber,BossName=s.BossName});
            foreach(var n in s.Nodes)db.AllNodes.Add(new Node {Id=n.Id,StageId=n.StageId,SortOrder=n.SortOrder,Type=n.Type,Title=n.Title,NpcName=n.NpcName,NpcSprite=n.NpcSprite,XpReward=n.XpReward,TimeLimitSec=n.TimeLimitSec,Hint=n.Hint,Explanation=n.Explanation,PayloadJson=n.Payload.GetRawText()});
        }
        await db.SaveChangesAsync();await tx.CommitAsync();
    }
}
