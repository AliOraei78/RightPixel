namespace RightPixel.Domain;

public sealed class BombEvaluator
{
    public bool Evaluate(BombDefusalPayload payload, string[] answer) => answer.SequenceEqual(payload.Blanks);
}
