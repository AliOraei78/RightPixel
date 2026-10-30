Console.WriteLine(new Checkout(new NoDiscount()).Total(100m));
Console.WriteLine(new Checkout(new HalfPrice()).Total(100m));

interface IDiscount { decimal Apply(decimal price); }

sealed class NoDiscount : IDiscount { public decimal Apply(decimal price) => price; }
sealed class HalfPrice : IDiscount { public decimal Apply(decimal price) => price / 2; }

sealed class Checkout(IDiscount discount)
{
    public decimal Total(decimal price) => discount.Apply(price);
}
