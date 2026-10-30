var target = new Counter { Value = 10 };
ICommand command = new Add(target, 5);
command.Execute();
Console.WriteLine(target.Value);
command.Undo();
Console.WriteLine(target.Value);

interface ICommand { void Execute(); void Undo(); }
sealed class Counter { public int Value; }

sealed class Add(Counter target, int amount) : ICommand
{
    public void Execute() => target.Value += amount;
    public void Undo() => target.Value -= amount;
}
