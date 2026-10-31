import type { PlayerState } from '../core/contracts';
export const profileIcon =
  '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><circle cx="12" cy="8" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/></svg>';
export function renderShell(
  app: HTMLElement,
  player: PlayerState | null,
  route: string,
  routes: readonly (readonly [string, string, string])[],
  selected: readonly [string, string, string] | undefined,
) {
  const escape = (s: string) =>
    s.replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
    );
  app.innerHTML = `<aside><a class="brand" href="#/dungeon"><span class="brand-icon">▣</span><b>RIGHT<span>PIXEL</span></b></a><p class="eyebrow">سفر یادگیری تو</p><nav>${routes.map(([id, label, icon]) => `<a href="#/${id}" ${id === route ? 'aria-current="page"' : ''} ${id === 'profile' ? 'class="profile-link" aria-label="پروفایل" title="پروفایل"' : ''}>${id === 'profile' ? profileIcon : `<span aria-hidden="true">${icon}</span>${label}`}</a>`).join('')}</nav><div class="aside-footer"><i></i> نسخهٔ پایه <span dir="ltr">v0.1</span></div></aside><main><header><div><p class="eyebrow">PIXEL CODE DUNGEON</p><h1>${selected?.[1] ?? 'صفحه پیدا نشد'}</h1></div><span class="local">◉ نصب شخصی · محلی</span></header><section class="hud" aria-label="وضعیت بازیکن">${player ? `<div class="identity"><canvas class="avatar player-avatar" width="48" height="44" role="img" aria-label="قهرمان بازیکن"></canvas><div><strong>${escape(player.playerName)}</strong><small>${escape(player.title)}</small><progress class="level-progress" max="200" value="${player.xp % 200}" aria-label="پیشرفت سطح"></progress></div></div><div><small>سطح</small><b>${player.level}</b></div><div><small>تجربه</small><b>${player.xp} <em>XP</em></b></div><div><small>جان</small><b class="heart">${player.hp} / ${player.maxHp} ♥</b></div><div><small>سکه</small><b class="gold">${player.coins} ◈</b></div><div><small>استریک</small><b>${player.streak} ⚡</b></div>` : '<p>در انتظار دریافت وضعیت بازیکن…</p>'}</section><div id="content" aria-live="polite"></div><footer>هر سفر بزرگ، از یک قدم کوچک شروع می‌شود.<span dir="ltr">BUILD YOUR KNOWLEDGE.</span></footer></main>`;
}
