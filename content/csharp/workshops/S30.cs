using var gate = new SemaphoreSlim(1);
int count = 0;

await Task.WhenAll(Enumerable.Range(0, 10).Select(async _ =>
{
    await gate.WaitAsync();
    try
    {
        int before = count;
        await Task.Yield();
        count = before + 1;
    }
    finally { gate.Release(); }
}));

Console.WriteLine(count);
