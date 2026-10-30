using RightPixel.Domain;
namespace RightPixel.Application;

public interface IContentStore
{
    List<World> AllWorlds
    {
        get;
    }
    List<Stage> AllStages
    {
        get;
    }
    List<Node> AllNodes
    {
        get;
    }
    IEnumerable<World> Worlds
    {
        get;
    }
    IEnumerable<Stage> Stages
    {
        get;
    }
    IEnumerable<Node> Nodes
    {
        get;
    }
}
public interface IPlayerStore
{
    List<PlayerCheckpoint> PlayerCheckpoints { get; }
    List<PlayerProfile> PlayerProfiles
    {
        get;
    }
    List<PlayerNodeProgress> PlayerNodeProgress
    {
        get;
    }
List<PlayerNodeUnlock> PlayerNodeUnlocks
    {
        get;
    }
}
public interface IAttemptStore
{
    List<GameAttempt> GameAttempts
    {
        get;
    }
}
public interface IReceiptStore
{
    List<ShopReceipt> ShopReceipts
    {
        get;
    }
}
public interface IGameWorkspace : IContentStore, IPlayerStore, IAttemptStore, IReceiptStore
{
    bool InTransaction
    {
        get;
    }
    Task<IWorkspaceTransaction> BeginWrite(); Task<IWorkspaceTransaction> BeginRead(); Task SaveChangesAsync();
}
public interface IWorkspaceTransaction : IAsyncDisposable
{
    Task CommitAsync();
}
public interface ICourseCatalog
{
    PackRequest Read(); byte[]? Workshop(string session);
}

public interface IHealthCheck
{
    Task<bool> Ready();
}

public interface ICurrentPlayer { Guid Id { get; } }

public interface IEmailSender { Task SendCode(string email, string code); }
