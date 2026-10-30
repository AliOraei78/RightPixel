export interface Disposable {
  dispose(): void;
}
export class ViewScope implements Disposable {
  private cleanups: (() => void)[] = [];
  private closed = false;
  readonly controller = new AbortController();
  get active() {
    return !this.closed;
  }
  add(cleanup: () => void) {
    if (this.closed) cleanup();
    else this.cleanups.push(cleanup);
  }
  dispose() {
    if (this.closed) return;
    this.closed = true;
    this.controller.abort();
    this.cleanups
      .splice(0)
      .reverse()
      .forEach((cleanup) => cleanup());
  }
}
