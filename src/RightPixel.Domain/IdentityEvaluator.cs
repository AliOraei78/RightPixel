namespace RightPixel.Domain;

public sealed class IdentityEvaluator
{
    public bool Evaluate(WhoAmIPayload payload, string? answer) => answer == payload.CorrectAnswer;
}
