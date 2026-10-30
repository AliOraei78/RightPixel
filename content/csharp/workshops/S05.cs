bool ok = TryDivide(10, 2, out int result);
Console.WriteLine($"{ok},{result}");
Console.WriteLine(TryDivide(10, 0, out _));

static bool TryDivide(int a, int b, out int result)
{
    result = 0;
    if (b == 0) return false;
    result = a / b;
    return true;
}
