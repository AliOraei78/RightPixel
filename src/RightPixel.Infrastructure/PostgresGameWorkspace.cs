using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using RightPixel.Domain;
using RightPixel.Application;
namespace RightPixel.Infrastructure;

// Content is shared; tracked player state is restricted to the authenticated account.
public sealed class PostgresGameWorkspace(GameDbContext db, ICurrentPlayer current) : IGameWorkspace
{
    private readonly GameDbContext db = db;
    private Lease? active;
    public bool InTransaction => active is not null;
    public List<PlayerCheckpoint> PlayerCheckpoints { get; private set; } = [];
    public List<PlayerProfile> PlayerProfiles { get; private set; } = [];
    public List<World> AllWorlds { get; private set; } = [];
    public List<Stage> AllStages { get; private set; } = [];
    public List<Node> AllNodes { get; private set; } = [];
    public List<PlayerNodeProgress> PlayerNodeProgress { get; private set; } = [];
    public List<PlayerNodeUnlock> PlayerNodeUnlocks { get; private set; } = [];
    public List<GameAttempt> GameAttempts { get; private set; } = [];
    public List<ShopReceipt> ShopReceipts { get; private set; } = [];
    public IEnumerable<World> Worlds => AllWorlds.Where(w => !w.IsArchived);
    public IEnumerable<Stage> Stages => AllStages.Where(s => !s.IsArchived && Worlds.Any(w => w.Id == s.WorldId));
    public IEnumerable<Node> Nodes => AllNodes.Where(n => !n.IsArchived && Stages.Any(s => s.Id == n.StageId));
    public Task<IWorkspaceTransaction> BeginWrite() => Begin(true);
    public Task<IWorkspaceTransaction> BeginRead() => Begin(false);
    private async Task<IWorkspaceTransaction> Begin(bool write)
    {
        if (active is not null)
            return new JoinedLease();
        try
        {
            await db.Database.OpenConnectionAsync();
            var transaction = await db.Database.BeginTransactionAsync(write ? System.Data.IsolationLevel.ReadCommitted : System.Data.IsolationLevel.RepeatableRead);
            active = new Lease(this, transaction);
            if (write && current.Id != Guid.Empty)
                await db.Database.ExecuteSqlInterpolatedAsync($"SELECT 1 FROM \"PlayerProfiles\" WHERE \"Id\" = {current.Id} FOR UPDATE");
            db.ChangeTracker.Clear();
            PlayerCheckpoints = await db.Set<PlayerCheckpoint>().Where(x => x.PlayerId == current.Id).ToListAsync();
            PlayerProfiles = await db.Set<PlayerProfile>().Where(x => x.Id == current.Id).ToListAsync();
            AllWorlds = await db.Set<World>().IgnoreQueryFilters().ToListAsync();
            AllStages = await db.Set<Stage>().IgnoreQueryFilters().ToListAsync();
            AllNodes = await db.Set<Node>().IgnoreQueryFilters().ToListAsync();
            PlayerNodeProgress = await db.Set<PlayerNodeProgress>().Where(x => x.PlayerId == current.Id).ToListAsync();
            PlayerNodeUnlocks = await db.Set<PlayerNodeUnlock>().Where(x => x.PlayerId == current.Id).ToListAsync();
            GameAttempts = await db.Set<GameAttempt>().Where(x => x.PlayerId == current.Id).ToListAsync();
            ShopReceipts = await db.Set<ShopReceipt>().Where(x => x.PlayerId == current.Id).ToListAsync();
            return active;
        }
        catch (Exception e) { if (active is not null) { await active.DisposeAsync(); } else { await db.Database.CloseConnectionAsync(); } throw Translate(e); }
    }
    private static Exception Translate(Exception e) => e;
    public async Task SaveChangesAsync()
    {
        try
        {
            Reconcile(PlayerCheckpoints);
            Reconcile(PlayerProfiles);
            Reconcile(AllWorlds);
            Reconcile(AllStages);
            Reconcile(AllNodes);
            Reconcile(PlayerNodeProgress);
            Reconcile(PlayerNodeUnlocks);
            Reconcile(GameAttempts);
            Reconcile(ShopReceipts);
            await db.SaveChangesAsync();
        }
        catch (Exception e) { throw Translate(e); }
    }
    private void Reconcile<T>(List<T> values) where T : class
    {
        foreach (var entry in db.ChangeTracker.Entries<T>().ToList())
        if (!values.Contains(entry.Entity))
            entry.State = EntityState.Deleted;
        foreach (var value in values)
        if (db.Entry(value).State == EntityState.Detached)
            db.Add(value);
    }
    private sealed class JoinedLease : IWorkspaceTransaction
    {
        public Task CommitAsync() => Task.CompletedTask; public ValueTask DisposeAsync() => ValueTask.CompletedTask;
    }
    private sealed class Lease(PostgresGameWorkspace owner, IDbContextTransaction transaction) : IWorkspaceTransaction
    {
        public Task CommitAsync() => transaction.CommitAsync();
        public async ValueTask DisposeAsync()
        {
            try
            {
                await transaction.DisposeAsync();
                await owner.db.Database.CloseConnectionAsync();
            }
            finally { owner.active = null; }
        }
    }
}