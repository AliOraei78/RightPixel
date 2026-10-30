var pool = System.Buffers.ArrayPool<int>.Shared;
int[] buffer = pool.Rent(3);

try
{
    buffer[0] = 2; buffer[1] = 3; buffer[2] = 4;
    int total = 0;
    foreach (int value in buffer.AsSpan(0, 3)) total += value;
    Console.WriteLine(total);
}

finally
{
    pool.Return(buffer, clearArray: true);
}
