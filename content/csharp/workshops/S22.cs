try
{
    if (!int.TryParse("bad", out int value)) Console.WriteLine("invalid");
    else Console.WriteLine(value);
}

finally
{
    Console.WriteLine("finished");
}
