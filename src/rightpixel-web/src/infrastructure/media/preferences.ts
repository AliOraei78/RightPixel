export type MotionPreference = 'system' | 'reduced' | 'full';
export interface MediaPreferences {
  sound: boolean;
  volume: number;
  motion: MotionPreference;
}
export interface PreferenceStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export const PREFERENCE_KEY = 'rightpixel.media.v1';
const defaults: MediaPreferences = { sound: true, volume: 0.35, motion: 'system' };

function normalize(value: Partial<MediaPreferences>): MediaPreferences {
  return {
    sound: typeof value.sound === 'boolean' ? value.sound : defaults.sound,
    volume:
      typeof value.volume === 'number' && Number.isFinite(value.volume)
        ? Math.max(0, Math.min(1, value.volume))
        : defaults.volume,
    motion: ['system', 'reduced', 'full'].includes(value.motion ?? '') ? value.motion! : 'system',
  };
}

export class PreferenceStore {
  private value: MediaPreferences;
  private listeners = new Set<(value: MediaPreferences) => void>();
  constructor(private storage?: PreferenceStorage) {
    this.value = this.read();
  }
  private read() {
    try {
      const raw = this.storage?.getItem(PREFERENCE_KEY);
      if (raw) {
        const value: unknown = JSON.parse(raw);
        if (value && typeof value === 'object' && !Array.isArray(value)) return normalize(value);
      }
      return { ...defaults, sound: this.storage?.getItem('sound') !== 'off' };
    } catch {
      return { ...defaults };
    }
  }
  get snapshot(): MediaPreferences {
    return { ...this.value };
  }
  subscribe(listener: (value: MediaPreferences) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  update(patch: Partial<MediaPreferences>) {
    const next = normalize({ ...this.value, ...patch });
    if (JSON.stringify(next) === JSON.stringify(this.value)) return;
    this.value = next;
    try {
      this.storage?.setItem(PREFERENCE_KEY, JSON.stringify(next));
    } catch {
      /* Session settings still work when storage is unavailable. */
    }
    this.listeners.forEach((listener) => listener(this.snapshot));
  }
  reload() {
    this.value = this.read();
    this.listeners.forEach((listener) => listener(this.snapshot));
  }
}

function browserStorage(): PreferenceStorage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}
export const mediaPreferences = new PreferenceStore(browserStorage());
export function reducedMotion(preference: MotionPreference, systemReduced: boolean) {
  return preference === 'reduced' || (preference === 'system' && systemReduced);
}

export function bindMotionPreference() {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  const apply = () => {
    document.documentElement.dataset.motion = reducedMotion(
      mediaPreferences.snapshot.motion,
      query.matches,
    )
      ? 'reduced'
      : 'full';
  };
  const unsubscribe = mediaPreferences.subscribe(apply);
  const storage = (event: StorageEvent) => {
    if (event.key === PREFERENCE_KEY || event.key === 'sound' || event.key === null)
      mediaPreferences.reload();
  };
  query.addEventListener('change', apply);
  window.addEventListener('storage', storage);
  apply();
  return () => {
    unsubscribe();
    query.removeEventListener('change', apply);
    window.removeEventListener('storage', storage);
  };
}
