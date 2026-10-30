using System.Reflection;

var tag = typeof(Report).GetCustomAttribute<TagAttribute>();
Console.WriteLine(tag?.Name);

[AttributeUsage(AttributeTargets.Class)]
sealed class TagAttribute(string name) : Attribute
{
    public string Name { get; } = name;
}

[Tag("audit")]
sealed class Report { }
