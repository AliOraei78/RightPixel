int value = 3;
int copied = value;
copied = 8;

int[] first = [3];
int[] alias = first;
alias[0] = 8;

Console.WriteLine($"{value},{copied},{first[0]}");
