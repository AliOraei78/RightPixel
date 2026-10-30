int[] values = [3, 4];

unsafe
{
    fixed (int* pointer = values)
    {
        Console.WriteLine(pointer[0] + pointer[1]);
    }
}
