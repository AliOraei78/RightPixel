IText text = new Upper(new Brackets(new Plain()));
Console.WriteLine(text.Read());

interface IText { string Read(); }
sealed class Plain : IText { public string Read() => "hello"; }

sealed class Brackets(IText inner) : IText { public string Read() => "[" + inner.Read() + "]"; }

sealed class Upper(IText inner) : IText { public string Read() => inner.Read().ToUpperInvariant(); }
