using var stream = new MemoryStream(new byte[] { 2, 3, 4 });
byte[] buffer = new byte[3];

await stream.ReadExactlyAsync(buffer);
int total = 0;
foreach (byte value in buffer) total += value;
Console.WriteLine(total);
