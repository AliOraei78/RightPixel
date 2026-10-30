var original = new Order("book", 100m);
var discounted = original with { Total = 80m };

Console.WriteLine($"{original.Total},{discounted.Total}");
Console.WriteLine(discounted == new Order("book", 80m));

record Order(string Product, decimal Total);
