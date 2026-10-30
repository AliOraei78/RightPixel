using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text;
using System.Security.Cryptography;
using RightPixel.Domain;
namespace RightPixel.Application;

public enum ErrorKind
{
    Validation, NotFound, Conflict, Unavailable
}
public sealed class AppProblem(ErrorKind kind, string message) : Exception(message)
{
    public ErrorKind Kind { get; } = kind;
}

public static class DataJson
{
    public static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() }
    };

    static string Canonical(JsonElement value) => value.ValueKind switch
    {
        JsonValueKind.Object => "{" + string.Join(",", value.EnumerateObject().OrderBy(p => p.Name, StringComparer.Ordinal)
            .Select(p => JsonSerializer.Serialize(p.Name) + ":" + Canonical(p.Value))) + "}",
        JsonValueKind.Array => "[" + string.Join(",", value.EnumerateArray().Select(Canonical)) + "]",
        _ => value.GetRawText()
    };

    public static string Hash<T>(T value) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(
        Canonical(JsonSerializer.SerializeToElement(value, Options)))));
    public static string Question(Node node) => Hash(new { node.Type, node.TimeLimitSec, Payload = JsonSerializer.Deserialize<JsonElement>(node.PayloadJson) });
    public static string Question(NodeDto node) => Hash(new { node.Type, node.TimeLimitSec, node.Payload });
}

