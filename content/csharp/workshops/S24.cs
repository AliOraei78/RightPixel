int value = 5;
object boxed = value;
value = 9;

Console.WriteLine($"{value},{boxed}");
Console.WriteLine(boxed.GetType().Name);
