using System.Text.Json;
using System.Text.Json.Serialization;

string json = JsonSerializer.Serialize(new Order(42), CourseJsonContext.Default.Order);
var order = JsonSerializer.Deserialize(json, CourseJsonContext.Default.Order);
Console.WriteLine(order?.Id);

record Order(int Id);

[JsonSerializable(typeof(Order))]
partial class CourseJsonContext : JsonSerializerContext { }
