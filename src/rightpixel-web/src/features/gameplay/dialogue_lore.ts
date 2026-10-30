import type { GameNode } from '../../core/contracts';
import type { RenderContext } from './render-context';
import { appendSources } from '../workshop/view';
import { platform } from '../../ui/platform';
export function renderDialogueLore(
  node: Extract<GameNode, { type: 'dialogue_lore' }>,
  context: RenderContext,
) {
  const payload = node.payload;
  let index = 0,
    timer: number | undefined,
    typing = false;
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
    const text = payload.dialogues[index] ?? payload.keyTakeaway;
    const words = text.split(/\s+/);
    let visible = 0;
    line.dataset.dialogueIndex = String(index);
    line.setAttribute('aria-busy', 'true');
    line.textContent = '';
    typing = true;
    if (
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
  line.onkeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      next();
    }
  };
  context.button('ادامه', next, context.challenge);
  appendSources(context.challenge, payload.sources);
  const checkpoint = context.checkpoint as { dialogueIndex?: number } | undefined;
  index = Math.min(payload.dialogues.length - 1, Math.max(0, checkpoint?.dialogueIndex ?? 0));
  if (payload.dialogues[0]?.includes('پیش‌نیاز:')) {
    const metadata = document.createElement('details');
    metadata.className = 'learning-sources';
    const summary = document.createElement('summary');
    summary.textContent = 'اطلاعات این مرحله';
    const text = document.createElement('p');
    text.textContent = payload.dialogues[0];
    metadata.append(summary, text);
    context.challenge.append(metadata);
    if (index === 0) index = Math.min(1, payload.dialogues.length - 1);
  }
  show();
}
