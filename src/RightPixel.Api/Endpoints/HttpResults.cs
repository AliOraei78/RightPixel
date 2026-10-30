using RightPixel.Application;
namespace RightPixel.Api.Endpoints;

public static class HttpResults
{
    public static int Status(ErrorKind kind) => kind switch { ErrorKind.Validation => 400, ErrorKind.NotFound => 404, ErrorKind.Conflict => 409, ErrorKind.Unavailable => 503, _ => 500 };
    public static IResult ToHttp(this OperationResult r) => r.Errors is not null ? Results.ValidationProblem(r.Errors) : r.Kind is null ? Results.Ok(r.Value) : r.Title is not null ? Results.Problem(statusCode: Status(r.Kind!.Value), title: r.Title) : Results.StatusCode(Status(r.Kind!.Value));
    public static async Task<IResult> Run(Func<Task<OperationResult>> action, HttpContext context)
    {
        try
        {
            return (await action()).ToHttp();
        }
        catch (AppProblem e) { if (Status(e.Kind) == 503) context.Response.Headers.RetryAfter = "1"; return Results.Problem(statusCode: Status(e.Kind), title: e.Message); }
    }
}
