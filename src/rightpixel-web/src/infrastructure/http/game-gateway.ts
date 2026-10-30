import type { PlayerState, World, Stage, GameNode, RoomSummary } from '../../core/contracts';
import { ApiError } from '../../core/errors';
import type { GameGateway } from '../../core/ports';
export class HttpStorageAdapter implements GameGateway {
  constructor(private readonly signal?: AbortSignal) {}

  private csrf?: string;
  pending() {
    return this.request<{ email: string | null; remainingSeconds: number }>('/auth/pending');
  }
  register(email: string, playerName: string, avatarId: string) {
    return this.request<{ remainingSeconds: number }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, playerName, avatarId }),
    });
  }
  requestCode(email: string) {
    return this.request<{ remainingSeconds: number }>('/auth/code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }
  verifyCode(email: string, code: string) {
    this.csrf = undefined;
    return this.request<{ authenticated: boolean; requiresPasswordSetup?: boolean }>(
      '/auth/verify',
      {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      },
    );
  }
  resendCode(email: string) {
    return this.request<{ remainingSeconds: number }>('/auth/resend', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }
  private purchases = new Map<string, string>();
  async request<T>(path: string, init?: RequestInit): Promise<T> {
    if (init?.method && init.method !== 'GET' && !this.csrf) {
      const tokenResponse = await fetch('/api/auth/csrf');
      this.csrf = (await tokenResponse.json()).token;
    }
    const response = await fetch('/api' + path, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(this.csrf ? { 'X-CSRF-TOKEN': this.csrf } : {}),
        ...init?.headers,
      },
      signal: this.signal
        ? AbortSignal.any([this.signal, AbortSignal.timeout(10000)])
        : AbortSignal.timeout(10000),
    });
    if (response.status === 401) window.dispatchEvent(new Event('rightpixel:unauthorized'));
    if (!response.ok) {
      const problem = await response.json().catch(() => null);
      throw new ApiError(
        problem?.errors?.playerName?.[0] ?? problem?.title ?? 'ارتباط با سرور برقرار نشد.',
        response.status,
        problem?.remainingSeconds ?? (Number(response.headers.get('Retry-After')) || undefined),
      );
    }
    return response.json() as Promise<T>;
  }
  async purchase(kind: string, nodeId: string): Promise<PlayerState> {
    const operation = `rightpixel.purchase.${kind}.${nodeId}`;
    let key = this.purchases.get(operation);
    try {
      key ??= sessionStorage.getItem(operation) ?? undefined;
    } catch {
      /* Session-only fallback. */
    }
    key ??= crypto.randomUUID();
    this.purchases.set(operation, key);
    try {
      sessionStorage.setItem(operation, key);
    } catch {
      /* Session-only fallback. */
    }
    const clear = () => {
      this.purchases.delete(operation);
      try {
        sessionStorage.removeItem(operation);
      } catch {
        /* Optional storage. */
      }
    };
    try {
      const state = await this.request<PlayerState>(
        `/shop/${kind}?nodeId=${encodeURIComponent(nodeId)}`,
        { method: 'POST', headers: { 'Idempotency-Key': key } },
      );
      clear();
      return state;
    } catch (e) {
      if (e instanceof ApiError && e.status >= 400 && e.status < 500) clear();
      throw e;
    }
  }
  checkpoint(id: string) {
    return this.request<{ revision: number; state: Record<string, unknown> }>(
      `/nodes/${encodeURIComponent(id)}/checkpoint`,
    );
  }
  saveCheckpoint(id: string, attemptId: string, revision: number, state: Record<string, unknown>) {
    return this.request<{ revision: number }>(`/nodes/${encodeURIComponent(id)}/checkpoint`, {
      method: 'PATCH',
      body: JSON.stringify({ attemptId, revision, state }),
    });
  }
  getPlayer() {
    return this.request<PlayerState>('/player');
  }
  updateProfile(playerName: string, avatarId?: string) {
    return this.request<PlayerState>('/player/profile', {
      method: 'PATCH',
      body: JSON.stringify({ playerName, avatarId }),
    });
  }
  getWorlds() {
    return this.request<World[]>('/worlds');
  }
  getStages(id: string) {
    return this.request<Stage[]>(`/worlds/${encodeURIComponent(id)}/stages`);
  }
  getNodes(id: string) {
    return this.request<RoomSummary[]>(`/stages/${encodeURIComponent(id)}/nodes`);
  }

  getNode(id: string) {
    return this.request<GameNode>('/nodes/' + encodeURIComponent(id));
  }
  start(id: string) {
    return this.request<{
      attemptId: string;
      roundIndex: number;
      deadline: string | null;
      state: PlayerState;
    }>(`/nodes/${encodeURIComponent(id)}/start`, { method: 'POST' });
  }
  answer<T>(id: string, attemptId: string, answer: unknown) {
    return this.request<T>(`/nodes/${encodeURIComponent(id)}/answer`, {
      method: 'POST',
      body: JSON.stringify({ attemptId, answer }),
    });
  }
}
