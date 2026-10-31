import type { GameNode } from '../../core/contracts';
import type { RenderContext } from './render-context';
import { appendSources, mountWorkshop } from '../workshop/view';
export function renderWhoAmI(
  node: Extract<GameNode, { type: 'who_am_i' }>,
  context: RenderContext,
) {
  const { challenge, button, paragraph, submit, store, sync, live, error, unlock } = context;

  const payload = node.payload,
    clues = document.createElement('div');
  challenge.append(clues);
  let revealing = false;
  const reveal = button(
    'سرنخ بعدی',
    () => {
      if (revealing || context.isDone() || context.isBusy()) return;
      revealing = true;
      reveal.disabled = true;
      void store
        .purchase('clue', node.id)
        .then(async (updated) => {
          sync(updated);
          const fresh = await store.getNode(node.id);
          if (fresh.type === 'who_am_i') {
            payload.clues = fresh.payload.clues;
            payload.clueCount = fresh.payload.clueCount;
          }
          if (live()) show();
        })
        .catch(error)
        .finally(() => {
          revealing = false;
          if (live()) show();
        });
    },
    challenge,
  );
  function show() {
    const count = unlock()?.cluesRevealed ?? 1;
    clues.replaceChildren();
    payload.clues.slice(0, count).forEach((text) => {
      const p = document.createElement('p');
      p.textContent = text;
      clues.append(p);
    });
    reveal.disabled =
      context.isDone() ||
      context.isBusy() ||
      revealing ||
      count >= (payload.clueCount ?? payload.clues.length);
  }
  show();
  payload.options.forEach(
    (option) =>
      (button(option, () => {
        void submit(option);
      }).disabled = !!context.reviewing),
  );
}
