using RightPixel.Application;
using RightPixel.Infrastructure;
using Microsoft.EntityFrameworkCore;
using System.IO.Compression;
namespace RightPixel.Api.Endpoints;

public static class ApiEndpoints
{
    public static void MapGameApi(this WebApplication app)
    {
        app.MapGet("/api/curriculum/csharp/workshops/{session}", async (string session, GameDbContext db, ICurrentPlayer current, ICourseCatalog course) =>
        {
            if(!System.Text.RegularExpressions.Regex.IsMatch(session,@"^S(0[1-9]|[1-3][0-9]|4[0-4])$"))return Results.NotFound();
            var nodeId="cs_"+session.ToLowerInvariant()+"_n6";
            var stage=await db.Nodes.Where(n=>n.Id==nodeId).Select(n=>n.StageId).SingleOrDefaultAsync();if(stage is null)return Results.NotFound();
            var node=await db.Nodes.SingleAsync(n=>n.Id==nodeId);var stageNumber=await db.Stages.Where(s=>s.Id==stage).Select(s=>s.StageNumber).SingleAsync();
            var prior=await db.Nodes.Join(db.Stages,n=>n.StageId,s=>s.Id,(n,s)=>new{n.Id,n.SortOrder,s.StageNumber,s.WorldId}).Where(x=>x.WorldId=="csharp_core"&&(x.StageNumber<stageNumber||x.StageNumber==stageNumber&&x.SortOrder<node.SortOrder)).Select(x=>x.Id).ToListAsync();
            var completed=await db.PlayerNodeProgress.Where(p=>p.PlayerId==current.Id&&p.CompletedAt!=null).Select(p=>p.NodeId).ToListAsync();if(prior.Any(id=>!completed.Contains(id)))return Results.StatusCode(403);
            var bytes=course.Workshop(session);if(bytes is null)return Results.NotFound();
            using var input=new MemoryStream(bytes);using var original=new ZipArchive(input,ZipArchiveMode.Read);using var output=new MemoryStream();
            using(var zip=new ZipArchive(output,ZipArchiveMode.Create,true))foreach(var entry in original.Entries){if(entry.Name=="Reference.cs.txt"&&!completed.Contains(nodeId))continue;var target=zip.CreateEntry(entry.FullName);using var source=entry.Open();using var destination=target.Open();await source.CopyToAsync(destination);}
            return Results.File(output.ToArray(),"application/zip",$"rightpixel-{session}.zip");
        });
        app.MapGet("/api/health", async (IHealthCheck health) => await health.Ready() ? Results.Ok(new { status = "ready" }) : Results.Problem(statusCode: 503, title: "Database unavailable"));
        app.MapGet("/api/player", (PlayerService player) => player.Read());
        app.MapPatch("/api/player/profile", (UpdateProfileRequest request, CatalogService service, HttpContext c) => HttpResults.Run(() => service.Profile(request), c));
        app.MapGet("/api/worlds", (CatalogService service) => service.Worlds());
        app.MapGet("/api/worlds/{worldId}/stages", (string worldId, CatalogService service, HttpContext c) => HttpResults.Run(() => service.Stages(worldId), c));
        app.MapGet("/api/stages/{stageId}/nodes", (string stageId, CatalogService service, HttpContext c) => HttpResults.Run(() => service.Nodes(stageId), c));
    }
}