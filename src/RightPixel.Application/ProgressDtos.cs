using RightPixel.Domain;
namespace RightPixel.Application;

public record ProgressDto(Guid PlayerId, string NodeId, int Attempts, DateTime? CompletedAt, int XpEarned);
public record UnlockDto(Guid PlayerId, string NodeId, int CluesRevealed, bool HintPurchased);
public static class DtoMapper
{
    public static ProgressDto Progress(PlayerNodeProgress p) => new(p.PlayerId, p.NodeId, p.Attempts, p.CompletedAt, p.XpEarned);
    public static UnlockDto Unlock(PlayerNodeUnlock p) => new(p.PlayerId, p.NodeId, p.CluesRevealed, p.HintPurchased);
}
