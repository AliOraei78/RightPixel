var counter = new Counter();
Parallel.For(0, 10_000, _ => counter.Increment());
Console.WriteLine(counter.Read());

sealed class Counter
{
    private readonly System.Threading.Lock gate = new();
    private int value;
    public void Increment() { lock (gate) { value++; } }
    public int Read() { lock (gate) { return value; } }
}
