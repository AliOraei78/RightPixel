import type { PlayerState, World, Stage, GameNode, RoomSummary } from './contracts';
export interface GameGateway {
  checkpoint(id: string): Promise<{ revision: number; state: Record<string, unknown> }>;
  saveCheckpoint(
    id: string,
    attemptId: string,
    revision: number,
    state: Record<string, unknown>,
  ): Promise<{ revision: number }>;
  getPlayer(): Promise<PlayerState>;
  updateProfile(name: string, avatarId?: string): Promise<PlayerState>;
  getWorlds(): Promise<World[]>;
  getStages(id: string): Promise<Stage[]>;
  getNodes(id: string): Promise<RoomSummary[]>;
  getNode(id: string): Promise<GameNode>;
  start(id: string): Promise<{
    attemptId: string;
    roundIndex: number;
    deadline: string | null;
    state: PlayerState;
  }>;
  answer<T>(id: string, attemptId: string, answer: unknown): Promise<T>;
  purchase(kind: string, nodeId: string): Promise<PlayerState>;
}

export interface AuthGateway {
  request<T>(path: string, init?: RequestInit): Promise<T>;
  pending(): Promise<{ email: string | null; remainingSeconds: number }>;
  register(
    email: string,
    playerName: string,
    avatarId: string,
  ): Promise<{ remainingSeconds: number }>;
  requestCode(email: string): Promise<{ remainingSeconds: number }>;
  verifyCode(
    email: string,
    code: string,
  ): Promise<{ authenticated: boolean; requiresPasswordSetup?: boolean }>;
  resendCode(email: string): Promise<{ remainingSeconds: number }>;
}
