var store = new UserStore();
var handler = new CreateUserHandler(store);
handler.Handle(new CreateUser(1, "  Ada  "));
Console.WriteLine(store.Find(1));

record CreateUser(int Id, string Name);
interface IUserStore { void Add(int id, string name); string? Find(int id); }

sealed class UserStore : IUserStore
{
    private readonly Dictionary<int, string> users = new();
    public void Add(int id, string name) => users.Add(id, name);
    public string? Find(int id) => users.GetValueOrDefault(id);
}

sealed class CreateUserHandler(IUserStore store)
{
    public void Handle(CreateUser command)
    {
        if (string.IsNullOrWhiteSpace(command.Name)) throw new ArgumentException(nameof(command));
        store.Add(command.Id, command.Name.Trim());
    }
}
