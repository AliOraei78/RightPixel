Enemy[] enemies = [new Goblin(), new Dragon()];
Console.WriteLine(enemies.Sum(enemy => enemy.Damage()));

abstract class Enemy { public abstract int Damage(); }

sealed class Goblin : Enemy { public override int Damage() => 2; }

sealed class Dragon : Enemy { public override int Damage() => 8; }
