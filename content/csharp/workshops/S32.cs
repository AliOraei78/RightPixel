int started = 0;
int winners = 0;

Parallel.For(0, 100, _ =>
{
    if (Interlocked.CompareExchange(ref started, 1, 0) == 0)
        Interlocked.Increment(ref winners);
});

Console.WriteLine(winners);
