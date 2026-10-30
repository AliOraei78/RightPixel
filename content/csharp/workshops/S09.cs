var start = new Point(2, 3);
var moved = start.Move(5);
Console.WriteLine($"{start.X},{moved.X}");

readonly struct Point(int x, int y)
{
    public int X { get; } = x;
    public int Y { get; } = y;
    public Point Move(int dx) => new(X + dx, Y);
}
