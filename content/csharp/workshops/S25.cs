byte[] buffer = GC.AllocateArray<byte>(4, pinned: true);
buffer[0] = 7;

Console.WriteLine(buffer.Length);
Console.WriteLine(buffer[0]);
GC.KeepAlive(buffer);
