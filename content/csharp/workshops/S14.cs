var order = new Order("A1", 20m);
Console.WriteLine(IsValid(order));
Console.WriteLine(IsValid(null));

static bool IsValid(Order? order) => order is { Id.Length: > 0, Total: > 0 };

record Order(string Id, decimal Total);
