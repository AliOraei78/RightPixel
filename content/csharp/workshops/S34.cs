var correlation = new AsyncLocal<string?>();
correlation.Value = "order-42";

await Task.Delay(1).ConfigureAwait(false);
Console.WriteLine(correlation.Value);
