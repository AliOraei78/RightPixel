export interface World {
  isArchived?: boolean;
  id: string;
  title: string;
  icon: string;
  color: string;
  sortOrder: number;
}
export interface Stage {
  isArchived?: boolean;
  id: string;
  worldId: string;
  title: string;
  stageNumber: number;
  bossName: string;
}
export interface Progress {
  playerId: string;
  nodeId: string;
  attempts: number;
  completedAt: string | null;
  xpEarned: number;
}
export interface Unlock {
  playerId: string;
  nodeId: string;
  cluesRevealed: number;
  hintPurchased: boolean;
}
export interface PlayerState {
  avatarId: string;
  version: number;
  id: string;
  playerName: string;
  xp: number;
  level: number;
  title: string;
  hp: number;
  maxHp: number;
  coins: number;
  streak: number;
  bestStreak: number;
  activeNodeId: string | null;
  lastSavedAt: string;
  completedNodes: Progress[];
  unlocks: Unlock[];
}
export interface Workshop {
  sessionId: string;
  task: string;
  starterCode: string;
  solutionCode: string;
  expectedOutput: string;
  rubric: string[];
  sources: string[];
}
type Payloads = {
  runtime_forge: { prompt: string; cards: string[] };
  memory_mirror: { prompt: string; code: string; labels: string[]; values: number[] };
  branch_gates: { prompt: string; code: string; gates: string[] };
  boss_fight: { rounds: { type: Exclude<NodeType, 'boss_fight'>; payload: unknown }[] };
  dialogue_lore: { dialogues: string[]; keyTakeaway: string; topics?: string; sources?: string[] };
  who_am_i: { clues: string[]; clueCount?: number; options: string[]; correctAnswer: string };
  bug_sniper: {
    prompt: string;
    codeLines: string[];
    buggyLineIndex: number;
    fixOptions: string[];
    correctFixIndex: number;
  };
  bomb_defusal: { prompt: string; codeTemplate: string; blanks: string[]; tokenBank: string[] };
  compiler_judge: {
    prompt: string;
    codeSnippet: string;
    claimedOutput: string;
    verdictOptions: string[];
    correctVerdictIndex: number;
  };
  code_puzzle: {
    prompt: string;
    scrambledLines: string[];
    correctOrderIndices: number[];
    workshop?: Workshop;
  };
};
export type NodeType = keyof Payloads;
type CommonNode = {
  isLocked?: boolean;
  isArchived?: boolean;
  id: string;
  stageId: string;
  sortOrder: number;
  title: string;
  npcName: string;
  npcSprite: string;
  xpReward: number;
  timeLimitSec: number | null;
  hint: string | null;
  explanation: string | null;
};
export type GameNode = {
  [K in NodeType]: CommonNode & { type: K; payload: Payloads[K] & { learningNote?: string[] } };
}[NodeType];
export interface RoomSummary {
  id: string;
  stageId: string;
  sortOrder: number;
  type: NodeType;
  title: string;
  isLocked: boolean;
}
