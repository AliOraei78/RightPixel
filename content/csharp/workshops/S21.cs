var orders = new[] { new[] { (Name: "a", Qty: 2), (Name: "b", Qty: 1) }, new[] { (Name: "a", Qty: 3) } };

var totals = orders.SelectMany(x => x)
    .GroupBy(x => x.Name)
    .Select(g => (Name: g.Key, Qty: g.Sum(x => x.Qty)))
    .OrderBy(x => x.Name);

foreach (var item in totals) Console.WriteLine($"{item.Name}:{item.Qty}");
