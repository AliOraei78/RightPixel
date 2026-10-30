namespace RightPixel.Domain;

public sealed class JudgeEvaluator
{
    public bool Evaluate(CompilerJudgePayload payload, int answer) => answer == payload.CorrectVerdictIndex;
}
