var resource = new Resource();
try
{
    using (resource) { throw new InvalidOperationException(); }
}
catch (InvalidOperationException) { }
Console.WriteLine(resource.Disposals);

sealed class Resource : IDisposable
{
    public int Disposals { get; private set; }
    public void Dispose() { Disposals++; }
}
