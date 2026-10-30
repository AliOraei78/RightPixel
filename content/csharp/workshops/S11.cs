Console.WriteLine(Max(3, 8));
Console.WriteLine(Max("a", "b"));

static T Max<T>(T a, T b) where T : IComparable<T>
    => a.CompareTo(b) >= 0 ? a : b;
