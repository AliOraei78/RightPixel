import type { PlayerState } from '../core/contracts';
export function updateHud(state: PlayerState) {
  const hud = document.querySelector('.hud');
  const stats = hud?.querySelectorAll(':scope > div');
  [
    state.level,
    `${state.xp} XP`,
    `${state.hp} / ${state.maxHp} ♥`,
    `${state.coins} ◈`,
    `${state.streak} ⚡`,
  ].forEach((v, i) => {
    const b = stats?.[i + 1]?.querySelector('b');
    if (b) b.textContent = String(v);
  });
  const title = hud?.querySelector('.identity small');
  if (title) title.textContent = state.title;
  const progress = hud?.querySelector<HTMLProgressElement>('.level-progress');
  if (progress) progress.value = state.xp % 200;
}
