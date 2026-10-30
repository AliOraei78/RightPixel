using RightPixel.Application;
using RightPixel.Domain;
using RightPixel.Infrastructure;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
namespace RightPixel.Api.Endpoints;

public static class PlayEndpoints
{
    public static void MapPlayApi(this WebApplication app)
    {
        app.MapGet("/api/nodes/{id}/checkpoint", async (string id, ICurrentPlayer current, GameDbContext db) =>
        {
            var value = await db.Set<PlayerCheckpoint>().FindAsync(current.Id, id);
            return Results.Ok(new { revision = value?.Revision ?? 0, state = JsonSerializer.Deserialize<JsonElement>(value?.StateJson ?? "{}") });
        });
        app.MapPatch("/api/nodes/{id}/checkpoint", async (string id, CheckpointRequest request, ICurrentPlayer current, GameDbContext db) =>
        {
            if (request.State.ValueKind != JsonValueKind.Object || request.State.GetRawText().Length > 65536) return Results.BadRequest();
            await using var tx = await db.Database.BeginTransactionAsync();
            await db.Database.ExecuteSqlInterpolatedAsync($"SELECT 1 FROM \"PlayerProfiles\" WHERE \"Id\" = {current.Id} FOR UPDATE");
            if (!await db.GameAttempts.AnyAsync(a => a.PlayerId == current.Id && a.NodeId == id && a.Id == request.AttemptId && !a.Resolved)) return Results.NotFound();
            var value = await db.Set<PlayerCheckpoint>().FindAsync(current.Id, id);
            if ((value?.Revision ?? 0) != request.Revision) return Results.Conflict(new { title = "ذخیره در پنجرهٔ دیگری تغییر کرده است؛ اتاق را دوباره باز کن." });
            if (value is null) { value = new PlayerCheckpoint { PlayerId = current.Id, NodeId = id }; db.Add(value); }
            value.StateJson = request.State.GetRawText(); value.Revision++;
            await db.SaveChangesAsync(); await tx.CommitAsync();
            return Results.Ok(new { revision = value.Revision, savedAt = DateTime.UtcNow });
        });
        app.MapGet("/api/nodes/{id}", (string id, PlayService service, HttpContext c) => HttpResults.Run(() => service.Node(id), c));
        app.MapPost("/api/nodes/{id}/start", (string id, PlayService service, HttpContext c) => HttpResults.Run(() => service.Start(id), c));
        app.MapPost("/api/nodes/{id}/answer", (string id, AnswerRequest request, PlayService service, HttpContext c) => HttpResults.Run(() => service.Answer(id, request), c));
        app.MapPost("/api/shop/{kind}", (string kind, string? nodeId, PlayService service, HttpContext c) => HttpResults.Run(() => service.Purchase(kind, nodeId, c.Request.Headers["Idempotency-Key"].FirstOrDefault()), c));
    }
}

public record CheckpointRequest(Guid AttemptId, long Revision, JsonElement State);
