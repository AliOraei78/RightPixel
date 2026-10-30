using Microsoft.AspNetCore.Diagnostics;
using RightPixel.Application;
namespace RightPixel.Api.Endpoints;

public sealed class ApplicationExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken token)
    {
        if (exception is not AppProblem error)
            return false;
        var status = HttpResults.Status(error.Kind);
        if (status == 503)
            context.Response.Headers.RetryAfter = "1";
        await Results.Problem(statusCode: status, title: error.Message).ExecuteAsync(context);
        return true;
    }
}
