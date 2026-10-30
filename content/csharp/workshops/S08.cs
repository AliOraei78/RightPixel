IPrintable report = new Report();
Console.WriteLine(report.Print());

interface IPrintable { string Print(); }

sealed class Report : IPrintable
{
    string IPrintable.Print() => "report";
}
