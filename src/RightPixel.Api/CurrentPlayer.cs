using System.Security.Claims;
using RightPixel.Application;
namespace RightPixel.Api;
public sealed class CurrentPlayer(IHttpContextAccessor accessor) : ICurrentPlayer
{
    public Guid Id => Guid.TryParse(accessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier), out var id)
        ? id : Guid.Empty;
}
