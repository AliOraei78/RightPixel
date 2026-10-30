namespace RightPixel.Application;

public record OperationResult(object? Value, ErrorKind? Kind = null, string? Title = null, Dictionary<string, string[]>? Errors = null)
{
    public static OperationResult Ok(object? value) => new(value);
    public static OperationResult NotFound() => new(null, ErrorKind.NotFound);
    public static OperationResult Problem(ErrorKind kind, string title) => new(null, kind, title);
    public static OperationResult ValidationProblem(Dictionary<string, string[]> errors) => new(null, ErrorKind.Validation, null, errors);
}
