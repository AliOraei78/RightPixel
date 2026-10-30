import type { GameNode } from '../../core/contracts';
import type { RenderContext } from './render-context';
import { appendSources, mountWorkshop } from '../workshop/view';
export function renderCodePuzzle(
  node: Extract<GameNode, { type: 'code_puzzle' }>,
  context: RenderContext,
) {
  const { challenge, button, paragraph, submit, store, sync, live, error, unlock } = context;

  const payload = node.payload;
  paragraph(payload.prompt);
  const indices: number[] = Array.isArray(context.checkpoint?.indices)
      ? (context.checkpoint.indices as number[]).filter(
          (i) => Number.isInteger(i) && i >= 0 && i < payload.scrambledLines.length,
        )
      : [],
    chosen = document.createElement('div');
  chosen.className = 'chosen-lines';
  chosen.dir = 'ltr';
  chosen.setAttribute('aria-label', 'ترتیب انتخاب‌شده');
  context.workspace.prepend(chosen);
  const available: HTMLButtonElement[] = [];
  const show = () => {
    chosen.replaceChildren();
    indices.forEach((index, position) => {
      button(
        payload.scrambledLines[index],
        () => {
          indices.splice(position, 1);
          context.saveCheckpoint?.({ indices });
          show();
        },
        chosen,
      ).className = 'code-line';
    });
    available.forEach((b, i) => {
      b.disabled = indices.includes(i);
    });
  };
  payload.scrambledLines.forEach((line, i) => {
    const b = button(line, () => {
      if (!indices.includes(i)) {
        indices.push(i);
        context.saveCheckpoint?.({ indices });
        show();
      }
    });
    b.dir = 'ltr';
    b.className = 'code-line';
    available.push(b);
  });
  button('بررسی ترتیب', () => {
    void submit(indices);
  });
  show();
  if (payload.workshop)
    mountWorkshop(
      context.workspace,
      node.id,
      payload.workshop,
      context.checkpoint,
      context.saveCheckpoint,
    );
}
