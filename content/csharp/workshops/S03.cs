int a = int.MaxValue;
int b = 1;

try
{
    Console.WriteLine(checked(a + b));
}

catch (OverflowException)
{
    Console.WriteLine("overflow");
}
