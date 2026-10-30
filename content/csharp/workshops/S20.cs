int visits = 0;
var snapshot = Values().ToArray();
Console.WriteLine(snapshot.Sum());
Console.WriteLine(snapshot.Count());
Console.WriteLine(visits);

IEnumerable<int> Values()
{
    for (int i = 1; i <= 3; i++)
    {
        visits++;
        yield return i;
    }
}
