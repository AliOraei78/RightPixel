using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();
services.AddScoped<Session>();
using var provider = services.BuildServiceProvider(validateScopes: true);

using var first = provider.CreateScope();
var a = first.ServiceProvider.GetRequiredService<Session>();
var b = first.ServiceProvider.GetRequiredService<Session>();
using var second = provider.CreateScope();
var c = second.ServiceProvider.GetRequiredService<Session>();
Console.WriteLine(ReferenceEquals(a, b));
Console.WriteLine(ReferenceEquals(a, c));

sealed class Session { }
