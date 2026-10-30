namespace RightPixel.Domain;

public record DialogueLorePayload(string[] Dialogues, string KeyTakeaway);
public record WhoAmIPayload(string[] Clues, string[] Options, string CorrectAnswer);
public record BugSniperPayload(string Prompt, string[] CodeLines, int BuggyLineIndex, string[] FixOptions, int CorrectFixIndex);
public record BombDefusalPayload(string Prompt, string CodeTemplate, string[] Blanks, string[] TokenBank);
public record CompilerJudgePayload(string Prompt, string CodeSnippet, string ClaimedOutput, string[] VerdictOptions, int CorrectVerdictIndex);
public record WorkshopPayload(string SessionId, string Task, string StarterCode, string SolutionCode, string ExpectedOutput, string[] Rubric, string[] Sources);
public record CodePuzzlePayload(string Prompt, string[] ScrambledLines, int[] CorrectOrderIndices, WorkshopPayload? Workshop = null);

