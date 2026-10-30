var account = new Account(10);
account.Deposit(5);
Console.WriteLine(account.Balance);

sealed class Account
{
    public int Balance { get; private set; }
    public Account(int initial)
    {
        if (initial < 0) throw new ArgumentOutOfRangeException(nameof(initial));
        Balance = initial;
    }
    public void Deposit(int amount)
    {
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount));
        Balance += amount;
    }
}
