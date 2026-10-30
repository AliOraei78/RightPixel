import type { PlayerState } from './contracts';
export class PlayerStore {
  private state: PlayerState | null = null;
  private listeners = new Set<(state: PlayerState) => void>();
  get value() {
    return this.state;
  }
  set value(state: PlayerState | null) {
    this.state = state;
    if (state) this.listeners.forEach((listener) => listener(state));
  }
  subscribe(listener: (state: PlayerState) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
