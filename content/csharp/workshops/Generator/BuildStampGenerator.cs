using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.Text;
using System.Text;
namespace CourseGenerator;
[Generator]
public sealed class BuildStampGenerator : IIncrementalGenerator
{
    public void Initialize(IncrementalGeneratorInitializationContext context)
    {
        context.RegisterPostInitializationOutput(output => output.AddSource("BuildStamp.g.cs",
            SourceText.From("""namespace CourseGenerated { public static class BuildStamp { public const string Value = "course-v1"; } }""", Encoding.UTF8)));
    }
}
