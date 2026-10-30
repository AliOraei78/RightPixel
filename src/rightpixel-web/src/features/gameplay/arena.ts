import { mountReadingPanel, openCodeView } from './reading-panel';
import { renderChallenge } from './renderers';
import { platform } from '../../ui/platform';

import type { GameNode, PlayerState } from '../../core/contracts';
import type { GameGateway } from '../../core/ports';
import { ApiError } from '../../core/errors';
import { appendSources, mountWorkshop } from '../workshop/view';

type AnswerResult = {
  correct: boolean;
  nodeCompleted: boolean;
  failureReason: 'wrong_line' | 'wrong_fix' | 'timeout' | 'incorrect_answer' | null;
  nextNodeId: string | null;
  earnedXp: number;
  earnedCoins: number;
  explanation: string | null;
  state: PlayerState;
};

export async function mountArena(
  root: HTMLElement,
  node: GameNode,
  store: GameGateway,
  initialState: PlayerState,
  onState: (state: PlayerState) => void,
  onNext: ((id: string) => Promise<void>) | undefined,
  onBack: () => void,
  current: () => boolean,
): Promise<() => void> {
  const session = await store.start(node.id);
  const checkpoint = await store.checkpoint(node.id);
  let saveQueue = Promise.resolve();
  let saveViewState: (state: Record<string, unknown>) => void = () => {};
  let npcReader: ReturnType<typeof mountReadingPanel> | undefined;
  if (!current()) return () => {};
  let state: PlayerState = session.state ?? { ...initialState, activeNodeId: node.id };
  let done = false,
    busy = false,
    disposed = false,
    awaitingReceipt = false;
  root.innerHTML =
    '<div id="room-navigation" class="actions"></div><canvas width="480" height="130" aria-label="صحنهٔ پیکسلی قهرمان و راهنما"></canvas><h3 id="room-title" tabindex="-1"></h3><p id="npc"></p><div id="timer" role="timer"></div><div id="challenge"></div><div class="actions" id="shop"></div><p id="hint-text"></p><p id="shop-status" role="status"></p><p id="level-up" class="level-banner" role="status" hidden></p><div id="feedback"><p role="status"></p><div class="actions"></div></div>';
  root.closest('main')?.classList.add('playing');
  root.classList.remove('mistake');
  delete root.dataset.result;
  root.querySelector('#room-title')!.textContent = node.title.replace(
    /^S\d+\s*·\s*(?:درس:\s*)?/,
    '',
  );
  const roomTitle = root.querySelector<HTMLElement>('#room-title')!;
  roomTitle.title = roomTitle.textContent ?? '';
  roomTitle.focus();
  root.querySelector('#npc')!.textContent = node.npcName;
  const challenge = root.querySelector<HTMLElement>('#challenge')!;
  const roomTimer = root.querySelector<HTMLElement>('#timer')!;
  const npcSpeech = document.createElement('section');
  npcSpeech.className = 'speech npc-speech';
  npcSpeech.setAttribute('aria-label', node.npcName);
  const playerSpeech = document.createElement('section');
  playerSpeech.className = 'speech player-speech';
  playerSpeech.setAttribute('aria-label', 'انتخاب‌های تو');
  const playerChoices = document.createElement('div');
  playerChoices.className = 'player-choices';
  playerSpeech.append(playerChoices);
  const npcBubble = document.createElement('div');
  npcBubble.className = 'speech npc-speech';
  npcSpeech.className = 'speech-content';
  npcBubble.append(npcSpeech);
  const playerBubble = document.createElement('div');
  playerBubble.className = 'speech player-speech';
  playerSpeech.className = 'speech-content';
  playerBubble.append(playerSpeech);
  challenge.append(npcBubble, playerBubble);
  const npcFooter = document.createElement('div');
  npcFooter.className = 'speech-actions';
  npcBubble.append(npcFooter);
  const playerFooter = document.createElement('div');
  playerFooter.className = 'speech-actions';
  playerBubble.append(playerFooter);
  const questionAgain = document.createElement('button');
  questionAgain.type = 'button';
  questionAgain.className = 'question-again';
  questionAgain.textContent = 'دیدن سؤال';
  questionAgain.setAttribute('aria-label', 'سؤال رو دوباره ببین');
  questionAgain.onclick = () => {
    challenge.dataset.speaker = 'npc';
    npcSpeech.focus();
  };
  playerFooter.append(questionAgain);
  const choose = document.createElement('button');
  choose.type = 'button';
  choose.className = 'show-choices';
  choose.textContent = 'جواب من';
  choose.onclick = () => {
    challenge.dataset.speaker = 'player';
    (playerChoices.querySelector('button') ?? playerSpeech.querySelector('button'))?.focus();
  };
  npcFooter.append(choose);
  challenge.dataset.speaker = 'npc';
  npcSpeech.tabIndex = -1;

  challenge.tabIndex = -1;
  npcSpeech.append(root.querySelector('#hint-text')!);
  const status = root.querySelector('#feedback [role=status]')!;
  const actions = root.querySelector('#feedback .actions')!;
  npcBubble.insertBefore(root.querySelector('#feedback')!, npcSpeech);
  const shop = root.querySelector('#shop')!;
  const inventory = document.createElement('details');
  inventory.className = 'scene-inventory';
  const inventoryTitle = document.createElement('summary');
  inventoryTitle.textContent = 'کوله';
  inventory.append(inventoryTitle, shop);
  root.append(inventory);
  const toolbar = document.createElement('div');
  toolbar.className = 'room-toolbar';
  toolbar.append(
    root.querySelector('#room-navigation')!,
    root.querySelector('#room-title')!,
    inventory,
  );
  const notices = document.createElement('div');
  notices.className = 'room-notices';
  notices.append(roomTimer, root.querySelector('#shop-status')!, root.querySelector('#level-up')!);
  toolbar.append(notices);
  const compactStats = document.createElement('span');
  compactStats.className = 'compact-stats';
  notices.append(compactStats);
  root.prepend(toolbar);
  inventory.onkeydown = (e) => {
    if (e.key === 'Escape') {
      inventory.open = false;
      inventoryTitle.focus();
    }
  };
  const roomSize = new ResizeObserver(() => {
    root.style.setProperty('--room-header-height', `${toolbar.getBoundingClientRect().height}px`);
    const controls = root.querySelector('.scene-hotspots');
    if (controls)
      root.style.setProperty(
        '--scene-controls-height',
        `${controls.getBoundingClientRect().height}px`,
      );
  });
  roomSize.observe(toolbar);
  const scene = platform.scene(root.querySelector('canvas')!, node.npcSprite, node.type);
  let stopOutcome = () => {};
  function outcome(cue: 'win' | 'fail' | 'coin' | 'levelUp', coins = false) {
    stopOutcome();
    scene.setMood(cue);
    const stops = [platform.audio.play(cue === 'levelUp' ? 'win' : cue)];
    if (coins) stops.push(platform.audio.play('coin', 0.4));
    if (cue === 'levelUp') stops.push(platform.audio.play('levelUp', 0.65));
    stopOutcome = () => stops.forEach((stop) => stop());
  }
  const live = () => !disposed && current();
  function button(label: string, fn: () => void, parent: Element = playerChoices) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.onclick = fn;
    if (parent === npcSpeech && label === 'ادامه') npcFooter.append(b);
    else if (
      parent === playerChoices &&
      ['اجرای آزمایش', 'بررسی ترتیب', 'بریدن سیم و تست کد'].includes(label)
    ) {
      b.dataset.submit = 'true';
      playerFooter.append(b);
    } else parent.append(b);
    return b;
  }
  function paragraph(text: string) {
    const p = document.createElement('p');
    p.textContent = text;
    npcSpeech.append(p);
    return p;
  }
  function sync(updated: PlayerState) {
    if (!live()) return;
    state = updated;
    compactStats.textContent = `جان ${updated.hp}/${updated.maxHp} · سکه ${updated.coins}`;
    onState(updated);
    updateShop();
  }
  function error(e: unknown) {
    challenge.dataset.speaker = 'npc';
    npcFooter.append(actions);
    status.textContent = e instanceof Error ? e.message : 'درخواست انجام نشد.';
  }
  function feedbackMessage(result: AnswerResult) {
    if (result.correct) return 'درست!';
    return {
      wrong_line: 'خط انتخاب‌شده اشتباه است؛ دوباره محل باگ را بررسی کن.',
      wrong_fix: 'خط باگ را درست پیدا کردی، اما راه‌حل انتخاب‌شده اشتباه است.',
      timeout: 'زمان این تلاش تمام شد.',
      incorrect_answer: 'پاسخ درست نیست؛ دوباره تلاش کن.',
    }[result.failureReason ?? 'incorrect_answer'];
  }
  async function submit(answer: unknown) {
    if (done || busy || !live()) return;
    const savedAnswer = structuredClone(answer);
    busy = true;
    back.disabled = true;
    actions.replaceChildren();
    let uncertain = false;
    const controls = [...challenge.querySelectorAll<HTMLButtonElement>('button')].map((b) => ({
      b,
      disabled: b.disabled,
    }));
    controls.forEach(({ b }) => {
      b.disabled = true;
    });
    updateShop();
    try {
      await saveQueue;
      const result = await store.answer<AnswerResult>(node.id, session.attemptId, savedAnswer);
      const leveledUp = result.state.level > state.level;
      done = true;
      document.querySelector<HTMLDialogElement>('.code-view')?.close();
      choose.hidden = true;
      awaitingReceipt = false;
      sync(result.state);
      if (!live()) return;
      outcome(
        result.correct ? (leveledUp ? 'levelUp' : 'win') : 'fail',
        result.correct && result.earnedCoins > 0,
      );
      root.dataset.result = result.correct ? 'win' : 'fail';
      challenge.dataset.speaker = 'npc';
      npcFooter.append(actions);
      const banner = root.querySelector<HTMLElement>('#level-up')!;
      banner.hidden = !leveledUp;
      if (leveledUp)
        banner.textContent = `ارتقا به سطح ${result.state.level} · ${result.state.title}`;
      status.textContent = `${feedbackMessage(result)} · ${result.earnedXp} XP · ${result.earnedCoins} سکه${result.explanation ? ' — ' + result.explanation : ''}`;
      root.classList.toggle('mistake', !result.correct);
      if (result.correct && result.nextNodeId && onNext) {
        const next = button(
          'اتاق بعد',
          () => {
            next.disabled = true;
            void onNext(result.nextNodeId!).catch((e) => {
              if (live()) {
                error(e);
                next.disabled = false;
              }
            });
          },
          actions,
        );
      }
      button(onNext ? 'بازگشت به نقشه' : 'بازگشت به نقشه', onBack, actions);
      if (!result.correct || result.nodeCompleted === false)
        button(
          result.correct ? 'دور بعد نبرد' : 'تلاش دوباره',
          () => {
            void restart().catch(error);
          },
          actions,
        );
    } catch (e) {
      uncertain = !(e instanceof ApiError && e.status >= 400 && e.status < 500);
      awaitingReceipt = uncertain;
      if (live()) {
        error(e);
        if (e instanceof ApiError && (e.status === 404 || e.status === 409))
          button(
            'ورود دوباره به اتاق',
            () => {
              void restart().catch(error);
            },
            actions,
          );
        else
          button(
            'ارسال دوبارهٔ پاسخ',
            () => {
              void submit(savedAnswer);
            },
            actions,
          );
        button('بازگشت به نقشه', onBack, actions);
      }
    } finally {
      busy = false;
      back.disabled = false;
      if (!done && !uncertain)
        controls.forEach(({ b, disabled }) => {
          b.disabled = disabled;
        });
      if (live()) updateShop();
    }
  }
  let restarting = false;
  async function restart() {
    if (restarting) return;
    restarting = true;
    cleanup();
    // Keep ownership of the replacement's cleanup when this arena is unmounted.
    try {
      replacementCleanup = await mountArena(
        root,
        node,
        store,
        state,
        onState,
        onNext,
        onBack,
        current,
      );
    } finally {
      restarting = false;
    }
  }
  const back = button('نقشه', onBack, root.querySelector('#room-navigation')!);
  const unlock = () => state.unlocks.find((x) => x.nodeId === node.id);
  const hint = button(
    'راهنما · ۲۰ سکه',
    () => {
      void purchase('hint');
    },
    shop,
  );
  const potion = button(
    'معجون · ۳۰ سکه',
    () => {
      void purchase('potion');
    },
    shop,
  );
  const mute = button(
    '',
    () => platform.preferences.update({ sound: !platform.preferences.snapshot.sound }),
    shop,
  );
  const syncSound = () => {
    const enabled = platform.preferences.snapshot.sound;
    mute.textContent = enabled ? 'صدا روشن' : 'صدا خاموش';
    mute.setAttribute('aria-pressed', String(enabled));
  };
  const unsubscribeSound = platform.preferences.subscribe(syncSound);
  syncSound();

  function updateShop() {
    hint.disabled =
      busy ||
      awaitingReceipt ||
      done ||
      !node.hint ||
      !!unlock()?.hintPurchased ||
      state.coins < 20;
    potion.disabled = busy || awaitingReceipt || state.hp >= state.maxHp || state.coins < 30;
    chest.disabled = hint.disabled;
    root.querySelector('#hint-text')!.textContent = unlock()?.hintPurchased
      ? (node.hint ?? '')
      : '';
  }
  let shopping = false;
  async function purchase(kind: string) {
    if (shopping || !live()) return;
    shopping = true;
    hint.disabled = true;
    potion.disabled = true;
    try {
      sync(await store.purchase(kind, node.id));
      if (kind === 'hint') {
        node.hint = (await store.getNode(node.id)).hint;
        challenge.dataset.speaker = 'npc';
      }
      if (live()) outcome('coin');
      if (live())
        root.querySelector('#shop-status')!.textContent =
          `خرید انجام شد · جان ${state.hp}/${state.maxHp} · سکه ${state.coins}`;
    } catch (e) {
      if (live()) error(e);
    } finally {
      shopping = false;
      if (live()) updateShop();
    }
  }
  const hotspots = document.createElement('div');
  hotspots.className = 'scene-hotspots';
  root.append(hotspots);
  roomSize.observe(hotspots);
  const npcHotspot = button(
    'گفت‌وگو با نگهبان',
    () => {
      challenge.dataset.speaker = 'npc';
      const target = root.querySelector<HTMLElement>('.dialogue-bubble') ?? npcSpeech;
      target.focus();
      target.scrollIntoView({ block: 'nearest' });
    },
    hotspots,
  );
  npcHotspot.className = 'npc-hotspot';
  const chest = button(
    'صندوق راهنما',
    () => {
      void purchase('hint');
    },
    hotspots,
  );
  chest.className = 'chest-hotspot';
  chest.disabled = !node.hint;
  const door = button('در خروج', onBack, hotspots);
  door.className = 'door-hotspot';
  updateShop();
  let keyHandler = (_e: KeyboardEvent) => {};
  renderChallenge(node, {
    advancePage: () => npcReader?.advance() ?? false,
    roundIndex: session.roundIndex,
    checkpoint: checkpoint.state,
    saveCheckpoint: (saveViewState = (state) => {
      if (!live() || done || busy || awaitingReceipt) return;
      checkpoint.state = { ...checkpoint.state, ...state };
      const snapshot = structuredClone(checkpoint.state);
      saveQueue = saveQueue
        .then(async () => {
          if (!live() || done || awaitingReceipt) return;
          const saved = await store.saveCheckpoint(
            node.id,
            session.attemptId,
            checkpoint.revision,
            snapshot,
          );
          checkpoint.revision = saved.revision;
          if (live()) root.querySelector('#shop-status')!.textContent = 'ذخیره شد';
        })
        .catch((e) => {
          if (live() && !done)
            root.querySelector('#shop-status')!.textContent =
              e instanceof Error ? e.message : 'ذخیره انجام نشد.';
        });
    }),
    challenge: npcSpeech,
    workspace: playerSpeech,
    button,
    paragraph,
    submit,
    store,
    sync,
    live,
    error,
    unlock,
    isDone: () => done,
    isBusy: () => busy,
    isAwaiting: () => awaitingReceipt,
    onKey: (handler) => {
      keyHandler = handler;
    },
  });
  npcReader = mountReadingPanel(
    npcSpeech,
    npcFooter,
    Number(checkpoint.state.npcPage ?? 0),
    (page) => saveViewState({ npcPage: page }),
  );
  const playerReader = mountReadingPanel(
    playerSpeech,
    playerFooter,
    Number(checkpoint.state.playerPage ?? 0),
    (page) => saveViewState({ playerPage: page }),
  );
  for (const [bubble, speaker] of [
    [npcBubble, node.npcName],
    [playerBubble, state.playerName],
  ] as const) {
    const heading = document.createElement('strong');
    heading.className = 'speaker-heading';
    const portrait = document.createElement('canvas');
    portrait.width = portrait.height = 32;
    platform.portrait?.(
      portrait,
      bubble === playerBubble ? state.avatarId : node.npcSprite,
      node.type,
      bubble === playerBubble,
    );
    const label = document.createElement('span');
    label.textContent = speaker;
    heading.append(portrait, label);
    bubble.prepend(heading);
  }
  const previewObservers: MutationObserver[] = [];
  function enhanceCode() {
    for (const code of [
      ...challenge.querySelectorAll<HTMLElement>(
        'pre:not([data-code-view]),.workshop:not([data-code-view]),.code-line:not([data-code-view])',
      ),
    ]) {
      if (!code.matches('.workshop') && code.closest('.workshop')) continue;
      code.dataset.codeView = 'true';
      const show = document.createElement('button');
      show.type = 'button';
      show.className = 'code-preview';
      if (code.matches('.code-line')) {
        show.append('دیدن قطعه کد · ');
        const snippet = document.createElement('bdi');
        snippet.dir = 'ltr';
        const text = code.textContent?.trim() ?? '';
        snippet.textContent = text.length > 32 ? `${text.slice(0, 32)}…` : text;
        show.append(snippet);
        show.title = text;
      } else {
        show.textContent = code.matches('.workshop') ? 'باز کردن کارگاه کد' : 'نمایش کامل کد';
      }
      code.before(show);
      code.hidden = true;
      const syncPreview = () => {
        show.disabled = code instanceof HTMLButtonElement && code.disabled;
        show.classList.toggle('selected', code.classList.contains('selected'));
        if (code.matches('button'))
          show.setAttribute('aria-pressed', String(code.classList.contains('selected')));
      };
      syncPreview();
      const previewObserver = new MutationObserver(syncPreview);
      previewObserver.observe(code, { attributes: true, attributeFilter: ['disabled', 'class'] });
      previewObservers.push(previewObserver);
      show.onclick = () => {
        code.hidden = false;
        openCodeView(code, 'کد کامل', roomTimer);
        const dialog = code.closest('dialog')!;
        dialog.addEventListener(
          'close',
          () => {
            code.hidden = true;
          },
          { once: true },
        );
        if (code.matches('button'))
          code.addEventListener('click', () => dialog.close(), { once: true });
      };
    }
  }
  enhanceCode();
  const codeObserver = new MutationObserver(enhanceCode);
  codeObserver.observe(challenge, { childList: true, subtree: true });
  const orderSpeech = () => {
    if (choose.parentElement !== npcFooter) npcFooter.append(choose);
    const hasChoices = !!(
      playerChoices.children.length ||
      playerSpeech.querySelector('.pilot-board,.chosen-lines,.token-code') ||
      playerFooter.querySelector('[data-submit]')
    );
    choose.hidden = done || !hasChoices;
    playerBubble.hidden = !hasChoices;
  };
  const speechObserver = new MutationObserver(orderSpeech);
  speechObserver.observe(npcSpeech, { childList: true });
  orderSpeech();
  let timedOut = false;
  const tick = () => {
    if (session.deadline && !done && !timedOut && !awaitingReceipt) {
      const remaining = Math.max(0, Math.ceil((Date.parse(session.deadline) - Date.now()) / 1000));
      roomTimer.textContent = `زمان باقی‌مانده: ${remaining}`;
      if (!remaining && !busy) {
        timedOut = true;
        void submit(null);
      }
    }
  };
  sync(state);
  window.addEventListener('keydown', keyHandler);
  const interval = window.setInterval(tick, 250);
  tick();
  let replacementCleanup: (() => void) | undefined;
  function cleanup() {
    disposed = true;
    root.closest('main')?.classList.remove('playing');
    speechObserver.disconnect();
    codeObserver.disconnect();
    previewObservers.forEach((observer) => observer.disconnect());
    roomSize.disconnect();
    scene.dispose();
    npcReader?.dispose();
    playerReader.dispose();
    document.querySelector<HTMLDialogElement>('.code-view')?.close();
    stopOutcome();
    unsubscribeSound();
    clearInterval(interval);
    window.removeEventListener('keydown', keyHandler);
  }
  return () => {
    cleanup();
    replacementCleanup?.();
  };
}
