int[] numbers = [1, 2, 3, 4];
Func<int, bool> keep = static x => x % 2 == 0;
Func<int, int> transform = static x => x * 10;

var result = numbers.Where(keep).Select(transform).ToArray();
Console.WriteLine(string.Join(",", result));
