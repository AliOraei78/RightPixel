namespace RightPixel.Domain;

public sealed class BugEvaluator
{
    public bool Evaluate(BugSniperPayload payload, (int Line, int Fix) answer) => answer.Line == payload.BuggyLineIndex && answer.Fix == payload.CorrectFixIndex;
}
