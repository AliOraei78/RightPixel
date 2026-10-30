import type { GameNode } from '../../core/contracts';
import type { RenderContext } from './render-context';
import { appendSources, mountWorkshop } from '../workshop/view';
export function renderBombDefusal(
  node: Extract<GameNode, { type: 'bomb_defusal' }>,
  context: RenderContext,
) {
  const { challenge, button, paragraph, submit, store, sync, live, error, unlock } = context;

  const payload = node.payload;
  paragraph(payload.prompt);
  const filled: (string | null)[] = payload.blanks.map(() => null),
    display = document.createElement('div');
  display.className = 'token-code';
  display.dir = 'ltr';
  context.workspace.prepend(display);
  const show = () => {
    display.replaceChildren();
    for (const part of payload.codeTemplate.split(/(__\d+__)/g)) {
      const match = /^__(\d+)__$/.exec(part);
      if (match) {
        const index = Number(match[1]) - 1;
        button(
          filled[index] ?? part,
          () => {
            filled[index] = null;
            context.saveCheckpoint?.({ filled });
            show();
          },
          display,
        ).dir = 'ltr';
      } else {
        const span = document.createElement('span');
        span.textContent = part;
        display.append(span);
      }
    }
  };
  if (Array.isArray(context.checkpoint?.filled))
    context.checkpoint.filled.forEach((token, i) => {
      if (i < filled.length && typeof token === 'string' && payload.tokenBank.includes(token))
        filled[i] = token;
    });
  show();
  payload.tokenBank.forEach((token) =>
    button(token, () => {
      const index = filled.indexOf(null);
      if (index >= 0) {
        filled[index] = token;
        context.saveCheckpoint?.({ filled });
        show();
      }
    }),
  );
  button('بریدن سیم و تست کد', () => {
    void submit(filled);
  });
}
