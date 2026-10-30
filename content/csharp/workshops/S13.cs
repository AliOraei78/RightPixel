Console.WriteLine(Normalize(null));
Console.WriteLine(Normalize("  Ada  "));

static string Normalize(string? value)
{
    if (string.IsNullOrWhiteSpace(value)) return "guest";
    return value.Trim();
}
