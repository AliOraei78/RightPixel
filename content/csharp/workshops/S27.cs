ReadOnlySpan<char> line = "hp=42".AsSpan();
int separator = line.IndexOf('=');

if (separator < 0) throw new FormatException();
int value = int.Parse(line[(separator + 1)..]);
Console.WriteLine(value);
