string[] words = ["a", "b", "a"];
var counts = new Dictionary<string, int>(StringComparer.Ordinal);

foreach (string word in words)
{
    counts.TryGetValue(word, out int count);
    counts[word] = count + 1;
}

Console.WriteLine($"{counts["a"]},{counts["b"]}");
