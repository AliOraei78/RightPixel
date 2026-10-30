using System.Text.Json;
using RightPixel.Domain;
namespace RightPixel.Application;

public record UpdateProfileRequest(string? PlayerName, string? AvatarId = null);
public record WorldDto(string Id, string Title, string Icon, string Color, int SortOrder, bool IsArchived = false);
public record StageDto(string Id, string WorldId, string Title, int StageNumber, string BossName, bool IsArchived = false);
public record NodeDto(string Id, string StageId, int SortOrder, NodeType Type, string Title, string NpcName, string NpcSprite, int XpReward, int? TimeLimitSec, string? Hint, string? Explanation, JsonElement Payload, bool IsArchived = false);
public record PlayerStateDto(int Version, Guid Id, string PlayerName, int Xp, int Level, string Title, int Hp, int MaxHp, int Coins, int Streak, int BestStreak, string? ActiveNodeId, DateTime LastSavedAt, List<ProgressDto> CompletedNodes, List<UnlockDto> Unlocks, string AvatarId = "avatar-01");
public record PackRequest(int Version, WorldDto World, List<PackStage> Stages);
public record PackStage(string Id, string WorldId, string Title, int StageNumber, string BossName, List<NodeDto> Nodes, bool IsArchived = false);
