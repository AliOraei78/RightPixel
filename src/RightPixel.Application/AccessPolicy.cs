using RightPixel.Domain;
namespace RightPixel.Application;
public static class AccessPolicy
{
    public static bool CanPlay(IGameWorkspace db, Guid player, Node node)
    {
        var stage = db.Stages.Single(s => s.Id == node.StageId);
        return db.Nodes.Where(n => db.Stages.Any(s => s.Id == n.StageId && s.WorldId == stage.WorldId && (s.StageNumber < stage.StageNumber || s.Id == stage.Id && n.SortOrder < node.SortOrder)))
            .All(n => db.PlayerNodeProgress.Any(p => p.PlayerId == player && p.NodeId == n.Id && p.CompletedAt != null));
    }
    public static NodeDto PublicNode(IGameWorkspace db, Guid player, Node n)
    {
        var payload = System.Text.Json.Nodes.JsonNode.Parse(n.PayloadJson)!.AsObject();
        void Clean(System.Text.Json.Nodes.JsonNode? value)
        {
            if (value is System.Text.Json.Nodes.JsonObject obj) {
                foreach (var key in new[] { "correctAnswer", "buggyLineIndex", "correctFixIndex", "correctVerdictIndex", "correctOrderIndices", "correctOrder", "correctValues", "correctPath", "solutionCode" }) obj.Remove(key);
                if (obj["blanks"] is System.Text.Json.Nodes.JsonArray blanks) obj["blanks"] = new System.Text.Json.Nodes.JsonArray(blanks.Select(_ => (System.Text.Json.Nodes.JsonNode?)System.Text.Json.Nodes.JsonValue.Create("")).ToArray());
                foreach(var child in obj.ToArray()) Clean(child.Value);
            } else if(value is System.Text.Json.Nodes.JsonArray array) foreach(var child in array) Clean(child);
        }
        Clean(payload);
        var unlock = db.PlayerNodeUnlocks.SingleOrDefault(u => u.PlayerId == player && u.NodeId == n.Id);
        if(n.Type == NodeType.who_am_i && payload["clues"] is System.Text.Json.Nodes.JsonArray clues) {
            payload["clueCount"]=clues.Count;
            payload["clues"]=new System.Text.Json.Nodes.JsonArray(clues.Take(unlock?.CluesRevealed ?? 1).Select(c=>c?.DeepClone()).ToArray());
        }
        return new(n.Id,n.StageId,n.SortOrder,n.Type,n.Title,n.NpcName,n.NpcSprite,n.XpReward,n.TimeLimitSec,unlock?.HintPurchased == true ? n.Hint : n.Hint is null ? null : "راهنمای این اتاق",null,System.Text.Json.JsonSerializer.SerializeToElement(payload));
    }
}
