using System.Text.Json;
using RightPixel.Domain;
namespace RightPixel.Application;

public static class ChallengeRegistry
{
    static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    static readonly IReadOnlyDictionary<NodeType, Func<string, JsonElement, bool>> Evaluators = new Dictionary<NodeType, Func<string, JsonElement, bool>>
    {
        [NodeType.runtime_forge] = (p,a) => System.Text.Json.Nodes.JsonNode.DeepEquals(System.Text.Json.Nodes.JsonNode.Parse(p)!["correctOrder"],System.Text.Json.Nodes.JsonNode.Parse(a.GetRawText())),
        [NodeType.memory_mirror] = (p,a) => System.Text.Json.Nodes.JsonNode.DeepEquals(System.Text.Json.Nodes.JsonNode.Parse(p)!["correctValues"],System.Text.Json.Nodes.JsonNode.Parse(a.GetRawText())),
        [NodeType.branch_gates] = (p,a) => System.Text.Json.Nodes.JsonNode.DeepEquals(System.Text.Json.Nodes.JsonNode.Parse(p)!["correctPath"],System.Text.Json.Nodes.JsonNode.Parse(a.GetRawText())),
        [NodeType.dialogue_lore] = (p, a) => new LoreEvaluator().Evaluate(JsonSerializer.Deserialize<DialogueLorePayload>(p, Json)!, a.ValueKind == JsonValueKind.True),
        [NodeType.who_am_i] = (p, a) => new IdentityEvaluator().Evaluate(JsonSerializer.Deserialize<WhoAmIPayload>(p, Json)!, a.GetString()),
        [NodeType.bug_sniper] = (p, a) => { var payload = JsonSerializer.Deserialize<BugSniperPayload>(p, Json)!; var line = a.GetProperty("line").GetInt32(); return new BugEvaluator().Evaluate(payload, (line, line == payload.BuggyLineIndex ? a.GetProperty("fix").GetInt32() : 0)); },
        [NodeType.bomb_defusal] = (p, a) => new BombEvaluator().Evaluate(JsonSerializer.Deserialize<BombDefusalPayload>(p, Json)!, a.Deserialize<string[]>(Json)!),
        [NodeType.compiler_judge] = (p, a) => new JudgeEvaluator().Evaluate(JsonSerializer.Deserialize<CompilerJudgePayload>(p, Json)!, a.GetInt32()),
        [NodeType.code_puzzle] = (p, a) => new PuzzleEvaluator().Evaluate(JsonSerializer.Deserialize<CodePuzzlePayload>(p, Json)!, a.Deserialize<int[]>(Json)!),
    };
    public static bool Evaluate(Node node, JsonElement answer) => Evaluators.TryGetValue(node.Type, out var evaluate) && evaluate(node.PayloadJson, answer);
}
