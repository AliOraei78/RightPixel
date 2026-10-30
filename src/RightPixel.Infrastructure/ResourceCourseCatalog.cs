using RightPixel.Application;
namespace RightPixel.Infrastructure;

public class ResourceCourseCatalog : ICourseCatalog
{
    public PackRequest Read() => BundledCourse.Read(); public byte[]? Workshop(string session) => BundledCourse.Workshop(session);
}
