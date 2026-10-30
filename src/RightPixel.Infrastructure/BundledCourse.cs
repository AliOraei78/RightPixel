using System.IO.Compression;
using System.Reflection;
using RightPixel.Application;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using RightPixel.Infrastructure;

namespace RightPixel.Infrastructure;

public static class BundledCourse
{
    public const string WorldId = "csharp_core";
    public static PackRequest Read()
    {
        using var stream = Resource("csharp-mastery.json");
        return JsonSerializer.Deserialize<PackRequest>(stream, DataJson.Options)!;
    }

    static Stream Resource(string name) => Assembly.GetExecutingAssembly()
        .GetManifestResourceStream("RightPixel.Infrastructure.Content." + name)
        ?? throw new InvalidOperationException("Bundled course resource missing: " + name);

    public static byte[]? Workshop(string session)
    {
        if (!System.Text.RegularExpressions.Regex.IsMatch(session, @"^S(0[1-9]|[1-3][0-9]|4[0-4])$"))
            return null;
        using var stream = Resource("Workshops." + session + ".zip");
        using var output = new MemoryStream();
        stream.CopyTo(output);
        return output.ToArray();
    }

    public static async Task Install(IServiceProvider services, ILogger logger)
    {
        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<GameDbContext>();
        var pack = Read();
        ContentService.Validate(pack);
        // Installation is additive. An existing world may have been edited or archived
        // by its owner; never overwrite it or touch player progression during startup.
        if (await db.Worlds.IgnoreQueryFilters().AnyAsync(w => w.Id == WorldId))
        {
            logger.LogInformation("Bundled C# world already exists; preserving local content and progress.");
            return;
        }
        var stageIds = pack.Stages.Select(s => s.Id).ToArray();
        var nodeIds = pack.Stages.SelectMany(s => s.Nodes).Select(n => n.Id).ToArray();
        if (await db.Stages.IgnoreQueryFilters().AnyAsync(s => stageIds.Contains(s.Id)) ||
            await db.Nodes.IgnoreQueryFilters().AnyAsync(n => nodeIds.Contains(n.Id)))
        {
            logger.LogWarning("Bundled C# installation skipped because another world uses its content IDs. Export the bundled pack and resolve IDs in Studio.");
            return;
        }
        await scope.ServiceProvider.GetRequiredService<ContentService>().Append(pack);
        logger.LogInformation("Installed C# curriculum: 44 stages and 308 rooms.");
    }

}
