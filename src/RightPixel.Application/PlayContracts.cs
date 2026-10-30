using System.Text.Json;
namespace RightPixel.Application;

public record AnswerRequest(Guid AttemptId, JsonElement Answer);
public record AnswerOutcome(bool Correct, string? FailureReason, string? NextNodeId, int EarnedXp, int EarnedCoins, string? Explanation, bool NodeCompleted = true);
