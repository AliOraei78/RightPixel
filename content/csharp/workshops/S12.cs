IEnumerable<string> names = new[] { "Ada", "Lin" };
IEnumerable<object> objects = names;

Action<object> print = item => Console.WriteLine(item);
Action<string> printName = print;

foreach (string name in names) printName(name);
Console.WriteLine(objects.Count());
