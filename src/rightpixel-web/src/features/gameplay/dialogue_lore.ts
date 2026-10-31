import type { GameNode } from '../../core/contracts';
import type { RenderContext } from './render-context';
import { platform } from '../../ui/platform';
export function renderDialogueLore(
  node: Extract<GameNode, { type: 'dialogue_lore' }>,
  context: RenderContext,
) {
  const payload = node.payload;
  let index = 0,
    timer: number | undefined,
    typing = false;
  const first = payload.dialogues[0]?.includes('پیش‌نیاز:')
    ? Math.min(1, payload.dialogues.length - 1)
    : 0;
  const line = context.paragraph('');
  line.className = 'dialogue-bubble';
  line.setAttribute('aria-live', 'off');
  line.setAttribute('role', 'button');
  line.tabIndex = 0;
  line.setAttribute('aria-label', 'نمایش متن کامل یا ادامهٔ دیالوگ');
  const stop = () => {
    if (timer) clearInterval(timer);
    timer = undefined;
  };
  const full = () => {
    stop();
    line.textContent = payload.dialogues[index] ?? payload.keyTakeaway;
    typing = false;
    line.setAttribute('aria-busy', 'false');
  };
  const show = () => {
    stop();
    if (previous) previous.disabled = index <= first;
    if (context.reviewing) advance.disabled = index + 1 >= payload.dialogues.length;
    const text = payload.dialogues[index] ?? payload.keyTakeaway;
    const words = text.split(/\s+/);
    let visible = 0;
    line.dataset.dialogueIndex = String(index);
    line.setAttribute('aria-busy', 'true');
    line.textContent = '';
    typing = true;
    if (
      context.reviewing ||
      platform.preferences.snapshot.motion === 'reduced' ||
      (platform.preferences.snapshot.motion === 'system' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    ) {
      full();
      return;
    }
    timer = window.setInterval(() => {
      if (!context.live()) {
        stop();
        return;
      }
      line.textContent = words.slice(0, ++visible).join(' ');
      if (visible >= words.length) {
        stop();
        typing = false;
        line.setAttribute('aria-busy', 'false');
      }
    }, 120);
  };
  const next = () => {
    if (context.reviewing) {
      if (index + 1 < payload.dialogues.length) {
        index++;
        show();
      }
      return;
    }
    if (context.isDone() || context.isBusy() || context.isAwaiting()) return;
    if (typing) {
      full();
      return;
    }
    if (context.advancePage?.()) return;
    if (index + 1 < payload.dialogues.length) {
      index++;
      context.saveCheckpoint?.({ dialogueIndex: index, npcPage: 0 });
      show();
    } else {
      stop();
      void context.submit(true);
    }
  };
  line.onclick = next;
  (context.challenge.closest('.npc-speech') ?? context.challenge).addEventListener(
    'click',
    (event) => {
      const target = event.target;
      if (
        event instanceof MouseEvent &&
        event.button === 0 &&
        typing &&
        target instanceof Element &&
        !target.closest('button,a,input,textarea,select,summary')
      )
        full();
    },
  );
  line.onkeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      next();
    }
  };
  const previous = context.reviewing
    ? context.button(
        'بخش قبلی',
        () => {
          if (index > first) {
            index--;
            show();
          }
        },
        context.challenge,
      )
    : undefined;
  const advance = context.button(context.reviewing ? 'بخش بعدی' : 'ادامه', next, context.challenge);
  if (previous) {
    previous.prepend('→ ');
    advance.append(' ←');
  }
  const checkpoint = context.checkpoint as { dialogueIndex?: number } | undefined;
  index = Math.min(payload.dialogues.length - 1, Math.max(0, checkpoint?.dialogueIndex ?? 0));
  if (payload.dialogues[0]?.includes('پیش‌نیاز:')) {
    if (index === 0) index = Math.min(1, payload.dialogues.length - 1);
  }
  show();
}
