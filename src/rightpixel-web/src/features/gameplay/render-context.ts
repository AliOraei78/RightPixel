import type { GameNode, PlayerState } from '../../core/contracts';
import type { GameGateway } from '../../core/ports';
export interface RenderContext {
  advancePage?: () => boolean;
  roundIndex?: number;
  checkpoint?: Record<string, unknown>;
  saveCheckpoint?: (state: Record<string, unknown>) => void;
  challenge: HTMLElement;
  workspace: HTMLElement;
  button: (label: string, action: () => void, parent?: Element) => HTMLButtonElement;
  paragraph: (text: string) => HTMLElement;
  submit: (answer: unknown) => Promise<void>;
  store: GameGateway;
  sync: (state: PlayerState) => void;
  live: () => boolean;
  error: (e: unknown) => void;
  unlock: () => PlayerState['unlocks'][number] | undefined;
  isDone: () => boolean;
  isBusy: () => boolean;
  isAwaiting: () => boolean;
  onKey: (handler: (e: KeyboardEvent) => void) => void;
}
