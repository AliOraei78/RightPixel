using System.Threading.Channels;

var channel = Channel.CreateBounded<int>(2);
Task producer = Task.Run(async () =>
{
    for (int i = 1; i <= 5; i++) await channel.Writer.WriteAsync(i);
    channel.Writer.Complete();
});

int total = 0;
await foreach (int value in channel.Reader.ReadAllAsync()) total += value;
await producer;
Console.WriteLine(total);
