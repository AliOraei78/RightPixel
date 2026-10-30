import type { GameNode } from '../core/contracts';
export interface Preferences {
  snapshot: { sound: boolean; volume: number; motion: 'system' | 'reduced' | 'full' };
  update(value: Partial<Preferences['snapshot']>): void;
  subscribe(listener: () => void): () => void;
}
export interface Scene {
  setMood(mood: 'win' | 'fail' | 'coin' | 'levelUp'): void;
  dispose(): void;
}
export interface Audio {
  play(cue: 'click' | 'win' | 'fail' | 'coin' | 'levelUp', delay?: number): () => void;
}
export interface Platform {
  portrait?: (
    canvas: HTMLCanvasElement,
    id: string,
    type: GameNode['type'],
    player: boolean,
  ) => void;
  avatars: { mount(root: Element, selected: string, onSelect: (id: string) => void): void };
  preferences: Preferences;
  audio: Audio;
  scene: (canvas: HTMLCanvasElement, sprite: string, type: GameNode['type']) => Scene;
  files: {
    download(name: string, data: BlobPart, type: string): void;
    project(session: string): Promise<Blob>;
  };
}
export let platform: Platform;
export function configurePlatform(value: Platform) {
  platform = value;
}
