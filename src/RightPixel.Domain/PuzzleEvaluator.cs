namespace RightPixel.Domain;

public sealed class PuzzleEvaluator
{
    public bool Evaluate(CodePuzzlePayload payload, int[] answer) => answer.SequenceEqual(payload.CorrectOrderIndices);
}
