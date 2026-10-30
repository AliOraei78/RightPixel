var source = new Source();
int count = 0;
EventHandler handler = (_, _) => count++;

source.Changed += handler;
source.Raise();
source.Changed -= handler;
source.Raise();
Console.WriteLine(count);

sealed class Source
{
    public event EventHandler? Changed;
    public void Raise() => Changed?.Invoke(this, EventArgs.Empty);
}
