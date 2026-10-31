import type { GameNode } from '../../core/contracts';
import type { RenderContext } from './render-context';
import { appendSources, mountWorkshop } from '../workshop/view';
export function renderBugSniper(
  node: Extract<GameNode, { type: 'bug_sniper' }>,
  context: RenderContext,
) {
  const { challenge, button, paragraph, submit, store, sync, live, error, unlock } = context;

  const payload = node.payload;
  let line = -1;
  paragraph(payload.prompt);
  const fixes = document.createElement('div');
  fixes.hidden = true;
  payload.codeLines.forEach((text, i) => {
    const b = button(`${i + 1}  ${text}`, () => {
      line = i;
      context.saveCheckpoint?.({ line });
      context.workspace
        .querySelectorAll('.code-line')
        .forEach((el) => el.classList.remove('selected'));
      b.classList.add('selected');
      fixes.hidden = false;
    });
    b.className = 'code-line';
    b.dir = 'ltr';
  });
  context.workspace.append(fixes);
  if (Number.isInteger(context.checkpoint?.line)) {
    const index = context.checkpoint!.line as number;
    if (index >= 0 && index < payload.codeLines.length)
      context.workspace.querySelectorAll<HTMLButtonElement>('.code-line')[index]?.click();
  }
  payload.fixOptions.forEach(
    (text, i) =>
      (button(
        text,
        () => {
          void submit({ line, fix: i });
        },
        fixes,
      ).disabled = !!context.reviewing),
  );
}
