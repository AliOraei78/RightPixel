var first = System.Collections.Immutable.ImmutableArray.Create(1, 2);

var second = first.Add(3);
Console.WriteLine($"{first.Length},{second.Length}");
