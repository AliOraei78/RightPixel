using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
namespace RightPixel.Infrastructure;
public sealed class GameDbContextFactory : IDesignTimeDbContextFactory<GameDbContext>
{
    public GameDbContext CreateDbContext(string[] args) => new(new DbContextOptionsBuilder<GameDbContext>().UseNpgsql(Environment.GetEnvironmentVariable("ConnectionStrings__Game") ?? "Host=localhost;Database=rightpixel;Username=rightpixel").Options);
}
