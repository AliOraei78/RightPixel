using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using RightPixel.Application;
using RightPixel.Domain;
namespace RightPixel.Infrastructure;

public static class Bootstrap
{
    public static IServiceCollection AddGameInfrastructure(this IServiceCollection services, string? connection)
    {
        services.AddDbContext<GameDbContext>((sp,o) => o.UseNpgsql(connection ?? sp.GetRequiredService<IConfiguration>().GetConnectionString("Game") ?? throw new InvalidOperationException("ConnectionStrings:Game is required.")));
        services.AddScoped<IGameWorkspace, PostgresGameWorkspace>();
        services.AddSingleton<ICourseCatalog, ResourceCourseCatalog>();
        services.AddSingleton(TimeProvider.System);
        services.AddScoped<IEmailSender, SmtpEmailSender>();
        services.AddScoped<PlayerService>();
        services.AddScoped<ContentService>();
        services.AddScoped<PlayService>();
        services.AddScoped<CatalogService>();
        services.AddScoped<IHealthCheck, PostgresHealthCheck>();
        return services;
    }
    public static async Task InitializeGame(this IServiceProvider services, bool course, ILogger logger)
    {
        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<GameDbContext>();
        await db.Database.MigrateAsync();
        if (course)
            await BundledCourse.Install(services, logger);
    }
}
public class PostgresHealthCheck(GameDbContext db) : IHealthCheck
{
    public async Task<bool> Ready()
    {
        try
        {
            return await db.Database.CanConnectAsync();
        }
        catch (System.Data.Common.DbException) { return false; }
    }
}
