import type { GameNode } from '../../core/contracts';
import type { RenderContext } from './render-context';
import { appendSources, mountWorkshop } from '../workshop/view';
export function renderCompilerJudge(
  node: Extract<GameNode, { type: 'compiler_judge' }>,
  context: RenderContext,
) {
  const { challenge, button, paragraph, submit, store, sync, live, error, unlock } = context;

  const payload = node.payload;
  paragraph(payload.prompt);
  const pre = document.createElement('pre');
  pre.dir = 'ltr';
  pre.textContent = payload.codeSnippet;
  challenge.append(pre);
  paragraph(payload.claimedOutput);
  payload.verdictOptions.forEach((text, i) =>
    button(text, () => {
      void submit(i);
    }),
  );
}
