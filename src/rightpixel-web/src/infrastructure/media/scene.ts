import { drawAvatar } from './avatars.js';
import type { NodeType } from '../../core/contracts.js';
import { mediaPreferences, reducedMotion } from './preferences.js';
import { drawSprite, npcSprite, SPRITE_LABELS } from './sprites.js';

export type SceneMood = 'idle' | 'win' | 'fail' | 'coin' | 'levelUp';
export interface DungeonScene {
  setMood(mood: SceneMood): void;
  dispose(): void;
}

export function createDungeonScene(
  canvas: HTMLCanvasElement,
  requestedSprite: string,
  type: NodeType,
): DungeonScene {
  const name = npcSprite(requestedSprite, type);
  canvas.classList.add('dungeon-canvas');
  canvas.dataset.npcSprite = name;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', `صحنهٔ پیکسلی قهرمان و ${SPRITE_LABELS[name]}`);
  let ctx: CanvasRenderingContext2D | null;
  try {
    ctx = canvas.getContext('2d');
  } catch {
    return { setMood() {}, dispose() {} };
  }
  if (!ctx) return { setMood() {}, dispose() {} };
  const hero = document.createElement('canvas');
  drawAvatar(hero, document.querySelector<HTMLElement>('.player-avatar')?.dataset.avatarId);
  const enteredAt = performance.now();
  const width = 640;
  let height = 220;
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = reducedMotion(mediaPreferences.snapshot.motion, query.matches),
    disposed = false;
  let frame: number | undefined,
    moodTimer: number | undefined,
    lastFrame = 0,
    mood: SceneMood = 'idle',
    moodStart = 0;
  const floorSpace = () =>
    Math.max(
      60,
      (canvas.parentElement?.querySelector('.scene-hotspots')?.getBoundingClientRect().height ??
        44) + 16,
    );
  function draw(now: number) {
    if (!ctx || disposed) return;
    const phase = reduced ? 0 : now / 1000,
      age = Math.max(0, (now - moodStart) / 1000);
    const bob = reduced ? 0 : Math.round(Math.sin(phase * 3) * 2);
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#111925';
    ctx.fillRect(0, 0, width, height);
    // Staggered bricks, central gate and stepped floor remain crisp at every scale.
    for (let y = 0; y < height - 35; y += 22)
      for (let x = -22; x < width; x += 44) {
        const left = x + (y % 44 ? 22 : 0);
        ctx.fillStyle = (x + y) % 3 ? '#1b2737' : '#202e40';
        ctx.fillRect(left + 1, y + 1, 42, 20);
        ctx.fillStyle = '#26374a';
        ctx.fillRect(left + 2, y + 2, 40, 1);
      }
    ctx.translate(0, height - 220 - (floorSpace() * width) / Math.max(1, canvas.clientWidth));
    ctx.fillStyle = '#304259';
    ctx.fillRect(260, 39, 120, 146);
    ctx.fillRect(270, 29, 100, 12);
    ctx.fillStyle = '#0b111b';
    ctx.fillRect(273, 49, 94, 136);
    ctx.fillStyle = '#273448';
    for (let x = 284; x < 365; x += 18) ctx.fillRect(x, 50, 5, 135);
    ctx.fillStyle = '#b39458';
    ctx.fillRect(314, 102, 12, 16);
    ctx.fillStyle = '#314158';
    ctx.fillRect(0, 185, width, 4);
    ctx.fillStyle = '#182332';
    ctx.fillRect(0, 189, width, 31);
    ctx.fillStyle = '#223146';
    for (let x = 0; x < width; x += 65) ctx.fillRect(x, 199, 52, 2);
    for (const x of [65, 558]) {
      ctx.fillStyle = '#28364b';
      ctx.fillRect(x - 9, 65, 26, 37);
      ctx.fillStyle = '#b18c55';
      ctx.fillRect(x, 70, 8, 29);
      const flame = reduced ? 0 : Math.round(Math.sin(phase * 9 + x) * 2);
      ctx.fillStyle = '#ec935d';
      ctx.fillRect(x - 4, 49 + flame, 16, 23 - flame);
      ctx.fillStyle = '#f6d892';
      ctx.fillRect(x, 46 + flame, 8, 23);
      ctx.fillStyle = '#fff1bc';
      ctx.fillRect(x + 2, 56, 4, 12);
    }
    const shake = mood === 'fail' && !reduced && age < 0.3 ? Math.round(Math.sin(age * 60) * 3) : 0;
    ctx.fillStyle = '#0b121d';
    ctx.fillRect(96, 180, 84, 5);
    ctx.fillRect(458, 180, 84, 5);
    const spriteScale = width / Math.max(1, canvas.clientWidth);
    drawSprite(ctx, name, 140 - 32 * spriteScale, 182 - 58 * spriteScale + bob, 5 * spriteScale);
    ctx.drawImage(
      hero,
      500 -
        32 * spriteScale +
        shake +
        (reduced ? 0 : Math.max(0, 1 - (now - enteredAt) / 650) * 140),
      182 - 64 * spriteScale - bob,
      64 * spriteScale,
      64 * spriteScale,
    );
    if (mood !== 'idle') {
      const color = mood === 'fail' ? '#d78694' : mood === 'levelUp' ? '#f5d18b' : '#94e4c1';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(449, 111, 96, 73);
      if (!reduced && mood !== 'fail')
        for (let i = 0; i < 14; i++) {
          const travel = (age * 35 + i * 13) % 80;
          ctx.fillStyle = i % 2 ? '#9adfc2' : '#edc875';
          ctx.fillRect(445 + ((i * 37) % 103), 175 - travel, 3, 3);
        }
    }
    // Bubble tails use the same world coordinates and entry movement as the sprites.
    const host = canvas.parentElement;
    const playerX = 500 + shake + (reduced ? 0 : Math.max(0, 1 - (now - enteredAt) / 650) * 140);
    host?.style.setProperty('--npc-x', `${(140 / width) * 100}%`);
    host?.style.setProperty('--player-x', `${(playerX / width) * 100}%`);
    host?.style.setProperty('--head-bottom', `${(102 / height) * canvas.clientHeight}px`);
    host?.style.setProperty('--head-y', `${((height - 102) / height) * 100}%`);
    ctx.restore();
  }
  function cancelFrame() {
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
  }
  function loop(now: number) {
    if (disposed || document.hidden || reduced) {
      frame = undefined;
      return;
    }
    if (now - lastFrame >= 1000 / 30) {
      draw(now);
      lastFrame = now;
    }
    frame = requestAnimationFrame(loop);
  }
  function reconcile() {
    cancelFrame();
    if (disposed) return;
    reduced = reducedMotion(mediaPreferences.snapshot.motion, query.matches);
    canvas.dataset.motion = reduced ? 'reduced' : 'full';
    draw(performance.now());
    if (!reduced && !document.hidden) {
      lastFrame = 0;
      frame = requestAnimationFrame(loop);
    }
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    height = Math.max(220, Math.round((width * rect.height) / Math.max(1, rect.width)));
    const ratio = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx!.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx!.imageSmoothingEnabled = false;
    reconcile();
  }
  const unsubscribe = mediaPreferences.subscribe(reconcile);
  query.addEventListener('change', reconcile);
  document.addEventListener('visibilitychange', reconcile);
  const speechChanges = new MutationObserver(() => {
    if (!disposed) draw(performance.now());
  });
  if (canvas.parentElement)
    speechChanges.observe(canvas.parentElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['data-speaker', 'hidden', 'class'],
    });
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  window.addEventListener('resize', resize);
  resize();
  return {
    setMood(next) {
      if (disposed) return;
      if (moodTimer !== undefined) clearTimeout(moodTimer);
      mood = next;
      moodStart = performance.now();
      canvas.dataset.mood = next;
      draw(moodStart);
      moodTimer = window.setTimeout(() => {
        mood = 'idle';
        canvas.dataset.mood = 'idle';
        if (!disposed) draw(performance.now());
      }, 1400);
    },
    dispose() {
      disposed = true;
      observer.disconnect();
      speechChanges.disconnect();
      cancelFrame();
      if (moodTimer !== undefined) clearTimeout(moodTimer);
      unsubscribe();
      query.removeEventListener('change', reconcile);
      document.removeEventListener('visibilitychange', reconcile);
      window.removeEventListener('resize', resize);
    },
  };
}

export function renderPortrait(
  canvas: HTMLCanvasElement,
  id: string,
  type: NodeType,
  player: boolean,
) {
  if (player) {
    drawAvatar(canvas, id);
    return;
  }
  const ctx = canvas.getContext('2d');
  if (ctx) drawSprite(ctx, npcSprite(id, type), 2, 4, 2);
}
