import { bindPersianCopy } from '../ui/persian-copy';
import { mountAvatarPicker } from '../infrastructure/media/avatars';
import { mountAuth } from '../features/auth/page';
import { updateHud } from '../ui/hud';
import { ViewScope } from '../ui/lifecycle';
import { renderShell } from './shell';
import { mountProfile } from '../features/profile/page';
import { configurePlatform } from '../ui/platform';
import { files } from '../infrastructure/browser/files';
import { audioSynth } from '../infrastructure/media/audio';
import { mediaPreferences } from '../infrastructure/media/preferences';
import { createDungeonScene, renderPortrait } from '../infrastructure/media/scene';
import { PlayerStore } from '../core/player-store';
import { bindAudioGestures } from '../infrastructure/media/audio.js';
import { bindMotionPreference } from '../infrastructure/media/preferences.js';
import { renderAvatar } from '../infrastructure/media/sprites.js';
import { mountMediaSettings } from '../infrastructure/media/settings.js';
import { createDungeonFeature } from '../features/dungeon/page';
import '@fontsource/vazirmatn/400.css';
import '@fontsource/vazirmatn/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '../styles/index.css';
import { HttpStorageAdapter } from '../infrastructure/http/game-gateway';
import type { PlayerState, World } from '../core/contracts';
const app = document.querySelector<HTMLDivElement>('#app')!;
bindPersianCopy(app);
let storage = new HttpStorageAdapter();
configurePlatform({
  avatars: { mount: mountAvatarPicker },
  audio: audioSynth,
  preferences: mediaPreferences,
  scene: createDungeonScene,
  portrait: renderPortrait,
  files,
});
const dungeonFeature = createDungeonFeature();
const mountFeatures = dungeonFeature.mount;
const stopFeatures = () => dungeonFeature.dispose();
const playerStore = new PlayerStore();
playerStore.subscribe(updateHud);
bindAudioGestures();
bindMotionPreference();
let disposeMediaSettings = () => {};
let pageScope = new ViewScope();
let session: 'checking' | 'guest' | 'authenticated' | 'error' = 'checking';
let failure = '';
let loadGeneration = 0;
const routes = [
  ['dungeon', 'نقشه', '◇'],
  ['profile', 'پروفایل', '♙'],
] as const;
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
function safeTarget(value: string | null) {
  return value && (/^\/(dungeon|profile)$/.test(value) || /^\/play\/[A-Za-z0-9_-]+$/.test(value))
    ? value
    : '/dungeon';
}
function navigate(path: string, replace = false) {
  if (replace) {
    history.replaceState(null, '', '#' + path);
    render();
  } else location.hash = path;
}
function render() {
  pageScope.dispose();
  pageScope = new ViewScope();
  storage = new HttpStorageAdapter(pageScope.controller.signal);
  stopFeatures();
  disposeMediaSettings();
  disposeMediaSettings = () => {};
  const url = new URL(location.hash.slice(1) || '/', location.origin);
  const path = url.pathname;
  const target = safeTarget(url.searchParams.get('returnTo'));
  const home = () => navigate('/');
  if (path === '/') {
    const player = playerStore.value;
    const signed = session === 'authenticated' && player;
    app.innerHTML = `<main class="welcome"><a class="brand" href="#/">RIGHT<span>PIXEL</span></a><section class="welcome-grid"><div><p class="eyebrow">سفر یادگیری تو</p><h1>C# را با حل معما و شکست نگهبان‌ها یاد بگیر</h1><p>هر مفهوم یک چالش تازه است. قدم‌به‌قدم یاد بگیر و مسیر قهرمان خودت را بساز.</p><div id="welcome-identity"></div><div class="welcome-actions"><button id="begin" ${session === 'checking' || session === 'error' ? 'disabled' : ''}>${session === 'checking' ? 'آماده‌سازی سفر…' : signed ? 'ادامهٔ سفر' : 'شروع سفر'}</button><a class="button-link" href="${signed ? '#/dungeon' : '#/login'}">${signed ? 'نقشهٔ یادگیری' : 'حساب دارم'}</a>${signed ? '<a href="#/profile">پروفایل</a>' : ''}</div><p id="welcome-status" role="status"></p>${session === 'error' ? '<button id="retry">تلاش دوباره</button>' : ''}</div><canvas class="welcome-scene" aria-label="قهرمان و نگهبان سیاه‌چال"></canvas></section><div class="welcome-features"><div><b>یادگیری مرحله‌ای</b><p>هر اتاق، یک قدم تا تسلط بر C#</p></div><div><b>معما و نبرد</b><p>با حل چالش‌ها راهت را باز کن</p></div><div><b>سیو مستقل</b><p>پیشرفتت همراه حساب تو می‌ماند</p></div></div></main>`;
    if (signed) {
      const identity = app.querySelector('#welcome-identity')!;
      const avatar = document.createElement('canvas');
      avatar.className = 'player-avatar';
      avatar.dataset.avatarId = player.avatarId;
      renderAvatar(avatar, player.avatarId);
      const name = document.createElement('strong');
      name.textContent = player.playerName;
      identity.append(avatar, name);
    }
    const scene = createDungeonScene(
      app.querySelector('canvas.welcome-scene')!,
      'wizard',
      'dialogue_lore',
    );
    disposeMediaSettings = () => scene.dispose();
    app.querySelector<HTMLButtonElement>('#begin')!.onclick = () => {
      if (signed) {
        const active = player.activeNodeId;
        const unfinished =
          active && !player.completedNodes.some((p) => p.nodeId === active && p.completedAt);
        navigate(unfinished ? '/play/' + encodeURIComponent(active) : '/dungeon');
      } else navigate('/register');
    };
    if (session === 'error') {
      app.querySelector('#welcome-status')!.textContent = failure;
      app.querySelector('#retry')!.addEventListener('click', () => void load());
    }
    return;
  }
  const authRoute = [
    '/login',
    '/register',
    '/verify-email',
    '/set-password',
    '/forgot-password',
  ].includes(path);
  if (session === 'checking' || session === 'error') {
    app.innerHTML =
      '<main class="auth-layout"><section class="auth-card panel"><h1>آماده‌سازی سفر</h1><p role="status"></p><a class="auth-home" href="#/">برگشت به صفحهٔ آغاز</a></section></main>';
    app.querySelector('p')!.textContent = session === 'error' ? failure : 'در حال بررسی نشست…';
    if (session === 'error') {
      const b = document.createElement('button');
      b.textContent = 'تلاش دوباره';
      b.onclick = () => void load();
      b.className = 'auth-secondary';
      app.querySelector('.auth-card')!.append(b);
    }
    return;
  }
  if (authRoute) {
    if (session === 'authenticated') {
      navigate('/', true);
      return;
    }
    disposeMediaSettings = mountAuth(
      app,
      storage,
      () => {
        void load().then(() => {
          if (session === 'authenticated') navigate(target, true);
        });
      },
      path.slice(1),
      target,
    );
    return;
  }
  if (session !== 'authenticated') {
    navigate('/login?returnTo=' + encodeURIComponent(safeTarget(path)), true);
    return;
  }
  const room = /^\/play\/([A-Za-z0-9_-]+)$/.exec(path);
  const selected = routes.find((r) => '/' + r[0] === path);
  renderShell(app, playerStore.value, room ? 'dungeon' : path.slice(1), routes, selected);
  app.querySelector('.brand')?.setAttribute('href', '#/');
  const gameHeader = app.querySelector('aside')!;
  const headerSize = new ResizeObserver(() =>
    app.style.setProperty('--game-header-height', `${gameHeader.getBoundingClientRect().height}px`),
  );
  headerSize.observe(gameHeader);
  pageScope.controller.signal.addEventListener('abort', () => headerSize.disconnect());
  const avatar = app.querySelector<HTMLCanvasElement>('.player-avatar');
  if (avatar) {
    avatar.dataset.avatarId = playerStore.value!.avatarId;
    renderAvatar(avatar, playerStore.value!.avatarId);
  }
  const content = app.querySelector<HTMLElement>('#content')!;
  const menu = document.createElement('details');
  menu.className = 'game-settings';
  menu.innerHTML = '<summary>تنظیمات</summary><div></div>';
  disposeMediaSettings = mountMediaSettings(menu.querySelector('div')!);
  const logout = document.createElement('button');
  logout.textContent = 'خروج از حساب';
  logout.onclick = async () => {
    try {
      await storage.request('/auth/logout', { method: 'POST' });
      playerStore.value = null;
      session = 'guest';
      loadGeneration++;
      navigate('/', true);
    } catch (e) {
      const p = document.createElement('p');
      p.role = 'alert';
      p.textContent = e instanceof Error ? e.message : 'خروج انجام نشد.';
      menu.append(p);
    }
  };
  const settingsPanel = menu.querySelector<HTMLElement>('div')!;
  const closeSettings = document.createElement('button');
  closeSettings.type = 'button';
  closeSettings.className = 'settings-close';
  closeSettings.textContent = 'بستن تنظیمات';
  closeSettings.onclick = () => {
    menu.open = false;
    menu.querySelector('summary')!.focus();
  };
  settingsPanel.prepend(closeSettings);
  settingsPanel.append(logout);
  menu.onkeydown = (e) => {
    if (e.key === 'Escape') closeSettings.click();
  };
  menu.ontoggle = () => {
    if (menu.open) closeSettings.focus();
  };
  pageScope.controller.signal.addEventListener('abort', () => {
    menu.open = false;
  });
  app.querySelector('nav')!.append(menu);
  if (path === '/profile') {
    const stop = disposeMediaSettings;
    const view = mountProfile(
      content,
      storage,
      playerStore.value!,
      render,
      (s) => {
        playerStore.value = s;
      },
      mountMediaSettings,
    );
    disposeMediaSettings = () => {
      stop();
      view.dispose();
    };
  } else if (path === '/dungeon' || room)
    void mountFeatures(
      content,
      room ? room[1]! : '',
      storage,
      playerStore.value!,
      async () => {},
      (s) => {
        playerStore.value = s;
      },
    );
  else
    content.innerHTML =
      '<section class="panel auth"><h1>این مسیر وجود ندارد</h1><a href="#/">صفحهٔ آغاز</a></section>';
}
async function load() {
  const generation = ++loadGeneration;
  session = 'checking';
  failure = '';
  render();
  try {
    const api = new HttpStorageAdapter();
    const status = await api.request<{ authenticated: boolean }>('/auth/session');
    if (generation !== loadGeneration) return;
    if (status.authenticated) {
      const player = await api.getPlayer();
      if (generation !== loadGeneration) return;
      playerStore.value = player;
      session = 'authenticated';
    } else {
      playerStore.value = null;
      session = 'guest';
    }
  } catch (e) {
    if (generation !== loadGeneration) return;
    playerStore.value = null;
    session = 'error';
    failure = e instanceof Error ? e.message : 'ارتباط با سرویس برقرار نشد.';
  }
  if (generation === loadGeneration) render();
}
window.addEventListener('rightpixel:unauthorized', () => {
  if (session === 'authenticated') {
    playerStore.value = null;
    session = 'guest';
    loadGeneration++;
    const path = new URL(location.hash.slice(1) || '/', location.origin).pathname;
    navigate('/login?returnTo=' + encodeURIComponent(safeTarget(path)), true);
  }
});
window.addEventListener('pageshow', (e) => {
  if (e.persisted) void load();
});
window.addEventListener('hashchange', render);
void load();
