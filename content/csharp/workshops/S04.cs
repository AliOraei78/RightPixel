int[] values = [2, -1, 0, 5];
int total = 0;

foreach (int value in values)
{
    if (value <= 0) continue;
    total += value;
}

Console.WriteLine(total);
