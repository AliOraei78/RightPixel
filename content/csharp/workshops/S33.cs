Task<int> first = GetAsync(2);
Task<int> second = GetAsync(3);

int[] values = await Task.WhenAll(first, second);
Console.WriteLine(values.Sum());

static async Task<int> GetAsync(int value)
{
    await Task.Yield();
    return value;
}
