using Microsoft.EntityFrameworkCore;
using RightPixel.Domain;
namespace RightPixel.Infrastructure;

public class GameDbContext(DbContextOptions<GameDbContext> options) : DbContext(options)
{
    public DbSet<GameAttempt> GameAttempts => Set<GameAttempt>();
    public DbSet<ShopReceipt> ShopReceipts => Set<ShopReceipt>();
    public DbSet<PlayerProfile> PlayerProfiles => Set<PlayerProfile>();
    public DbSet<World> Worlds => Set<World>(); public DbSet<Stage> Stages => Set<Stage>(); public DbSet<Node> Nodes => Set<Node>();
    public DbSet<PlayerNodeProgress> PlayerNodeProgress => Set<PlayerNodeProgress>(); public DbSet<PlayerNodeUnlock> PlayerNodeUnlocks => Set<PlayerNodeUnlock>();
    protected override void ConfigureConventions(ModelConfigurationBuilder builder)
    {
        builder.Properties<DateTime>().HaveConversion<UtcDateTimeConverter>();
    }
    protected override void OnModelCreating(ModelBuilder m)
    {
        m.Entity<PasswordGrant>().HasOne<PlayerProfile>().WithMany().HasForeignKey(x => x.PlayerId);
        m.Entity<LoginFailure>().HasIndex(x => new { x.EmailHash, x.At });
        m.Entity<LoginFailure>().HasIndex(x => new { x.IpHash, x.At });
        m.Entity<EmailChallenge>().HasKey(x => x.Email);
        m.Entity<EmailDelivery>().HasIndex(x => new { x.Email, x.SentAt });
        m.Entity<EmailDelivery>().HasIndex(x => new { x.IpHash, x.SentAt });
        m.Entity<PlayerSession>().HasOne<PlayerProfile>().WithMany().HasForeignKey(x => x.PlayerId);
        m.Entity<PlayerProfile>().HasIndex(x => x.NormalizedEmail).IsUnique();
        m.Entity<GameAttempt>().HasOne<PlayerProfile>().WithMany().HasForeignKey(x => x.PlayerId);
        m.Entity<ShopReceipt>().HasKey(x => new { x.PlayerId, x.Id });
        m.Entity<ShopReceipt>().HasOne<PlayerProfile>().WithMany().HasForeignKey(x => x.PlayerId);
        m.Entity<World>().HasQueryFilter(w => !w.IsArchived);
        m.Entity<Stage>().HasQueryFilter(s => !s.IsArchived && Worlds.Any(w => w.Id == s.WorldId));
        m.Entity<Node>().HasQueryFilter(n => !n.IsArchived && Stages.Any(s => s.Id == n.StageId));
        m.Entity<GameAttempt>().HasOne<Node>().WithMany().HasForeignKey(x => x.NodeId);
        m.Entity<GameAttempt>().HasIndex(x => new { x.PlayerId, x.NodeId }).IsUnique().HasFilter("\"Resolved\" = false");
        m.Entity<PlayerProfile>().Property(x => x.PlayerName).HasMaxLength(50);
        m.Entity<PlayerProfile>().HasOne<Node>().WithMany().HasForeignKey(x => x.ActiveNodeId).OnDelete(DeleteBehavior.SetNull);
        m.Entity<Stage>().HasOne<World>().WithMany().HasForeignKey(x => x.WorldId);
        m.Entity<Stage>().HasIndex(x => new { x.WorldId, x.StageNumber }).IsUnique();
        m.Entity<Node>().HasOne<Stage>().WithMany().HasForeignKey(x => x.StageId);
        m.Entity<Node>().HasIndex(x => new { x.StageId, x.SortOrder }).IsUnique();
        m.Entity<Node>().Property(x => x.Type).HasConversion<string>();
        m.Entity<Node>().ToTable(t => t.HasCheckConstraint("CK_Node_Payload", "\"PayloadJson\"::jsonb IS NOT NULL"));
        Link<PlayerCheckpoint>(m);
        Link<PlayerNodeProgress>(m);
        Link<PlayerNodeUnlock>(m);
    }
    static void Link<T>(ModelBuilder m) where T : class
    {
        m.Entity<T>().HasKey("PlayerId", "NodeId");
        m.Entity<T>().HasOne<PlayerProfile>().WithMany().HasForeignKey("PlayerId");
        m.Entity<T>().HasOne<Node>().WithMany().HasForeignKey("NodeId");
    }
}

public class UtcDateTimeConverter() : Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateTime, DateTime>(value => value.ToUniversalTime(), value => DateTime.SpecifyKind(value, DateTimeKind.Utc));
