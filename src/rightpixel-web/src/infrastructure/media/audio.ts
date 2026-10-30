import { mediaPreferences, PreferenceStore } from './preferences.js';

interface Tone {
  frequency: number;
  at: number;
  duration: number;
  wave: OscillatorType;
  endFrequency?: number;
}
export const SOUND_CUES = {
  click: [{ frequency: 520, at: 0, duration: 0.05, wave: 'square' }],
  win: [440, 554, 659, 880].map((frequency, i) => ({
    frequency,
    at: i * 0.085,
    duration: 0.08,
    wave: 'square' as const,
  })),
  fail: [
    { frequency: 240, endFrequency: 170, at: 0, duration: 0.12, wave: 'sawtooth' },
    { frequency: 170, endFrequency: 100, at: 0.12, duration: 0.16, wave: 'sawtooth' },
  ],
  coin: [987, 1318].map((frequency, i) => ({
    frequency,
    at: i * 0.07,
    duration: 0.065,
    wave: 'square' as const,
  })),
  levelUp: [523, 659, 783, 1046].map((frequency, i) => ({
    frequency,
    at: i * 0.11,
    duration: 0.1,
    wave: 'triangle' as const,
  })),
} satisfies Record<string, Tone[]>;
export type SoundCue = keyof typeof SOUND_CUES;

export class AudioSynth {
  private context?: AudioContext;
  private master?: GainNode;
  private voices = new Map<OscillatorNode, GainNode>();
  private unsubscribe: () => void;
  constructor(
    private preferences: PreferenceStore = mediaPreferences,
    private factory: () => AudioContext = () => new AudioContext(),
  ) {
    this.unsubscribe = preferences.subscribe((settings) => {
      try {
        this.master?.gain.setValueAtTime(
          settings.sound ? settings.volume * 0.16 : 0,
          this.context!.currentTime,
        );
      } catch {
        /* Optional audio device may have closed. */
      }
      if (!settings.sound || settings.volume === 0) this.stopAll();
    });
  }
  async unlock(): Promise<boolean> {
    const settings = this.preferences.snapshot;
    if (!settings.sound || settings.volume === 0) return false;
    try {
      if (!this.context || this.context.state === 'closed') {
        this.context = this.factory();
        this.master = this.context.createGain();
        this.master.connect(this.context.destination);
        this.master.gain.value = settings.volume * 0.16;
      }
      if (this.context.state === 'suspended') await this.context.resume();
      return this.context.state === 'running';
    } catch {
      return false;
    }
  }
  play(cue: SoundCue, delay = 0): () => void {
    const ctx = this.context,
      master = this.master,
      settings = this.preferences.snapshot;
    if (!ctx || !master || ctx.state !== 'running' || !settings.sound || settings.volume === 0)
      return () => {};
    const created: OscillatorNode[] = [];
    try {
      if (this.voices.size > 24) this.stopAll();
      for (const tone of SOUND_CUES[cue] as Tone[]) {
        const oscillator = ctx.createOscillator(),
          gain = ctx.createGain();
        const start = ctx.currentTime + Math.max(0, Math.min(5, delay)) + tone.at;
        oscillator.type = tone.wave;
        oscillator.frequency.setValueAtTime(tone.frequency, start);
        if (tone.endFrequency)
          oscillator.frequency.exponentialRampToValueAtTime(
            tone.endFrequency,
            start + tone.duration,
          );
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(0.8, start + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + tone.duration);
        oscillator.connect(gain);
        gain.connect(master);
        created.push(oscillator);
        this.voices.set(oscillator, gain);
        oscillator.onended = () => {
          this.voices.delete(oscillator);
          oscillator.disconnect();
          gain.disconnect();
        };
        oscillator.start(start);
        oscillator.stop(start + tone.duration + 0.01);
      }
    } catch {
      created.forEach((voice) => this.stop(voice));
    }
    return () => created.forEach((voice) => this.stop(voice));
  }
  private stop(voice: OscillatorNode) {
    try {
      voice.stop();
    } catch {
      /* Not started or already ended. */
    }
    try {
      voice.disconnect();
      this.voices.get(voice)?.disconnect();
    } catch {
      /* Device disconnected. */
    }
    this.voices.delete(voice);
  }
  stopAll() {
    [...this.voices.keys()].forEach((voice) => this.stop(voice));
  }
  suspend() {
    this.stopAll();
    try {
      void this.context?.suspend().catch(() => {});
    } catch {
      /* Unavailable device. */
    }
  }
  dispose() {
    this.unsubscribe();
    this.stopAll();
    try {
      void this.context?.close().catch(() => {});
    } catch {
      /* Already closed. */
    }
  }
}
export const audioSynth = new AudioSynth();

export function bindAudioGestures() {
  const click = (event: MouseEvent) => {
    const element = event.target instanceof Element ? event.target.closest('button,a[href]') : null;
    if (!element || (element instanceof HTMLButtonElement && element.disabled)) return;
    void audioSynth.unlock().then((ready) => {
      if (ready) audioSynth.play('click');
    });
  };
  const key = (event: KeyboardEvent) => {
    if (!event.repeat && ['Space', 'Enter'].includes(event.code)) void audioSynth.unlock();
  };
  const visibility = () => {
    if (document.hidden) audioSynth.suspend();
  };
  document.addEventListener('click', click, true);
  document.addEventListener('keydown', key, true);
  document.addEventListener('visibilitychange', visibility);
  return () => {
    document.removeEventListener('click', click, true);
    document.removeEventListener('keydown', key, true);
    document.removeEventListener('visibilitychange', visibility);
  };
}
