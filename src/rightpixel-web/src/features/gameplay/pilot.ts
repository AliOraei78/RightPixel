import type { GameNode } from '../../core/contracts';
import type { RenderContext } from './render-context';
export function renderPilot(
  node: Extract<GameNode, { type: 'runtime_forge' | 'memory_mirror' | 'branch_gates' }>,
  context: RenderContext,
) {
  context.paragraph(node.payload.prompt);
  if ('code' in node.payload) {
    const code = document.createElement('pre');
    code.dir = 'ltr';
    code.textContent = node.payload.code;
    context.challenge.append(code);
  }
  let selection: number[] = Array.isArray(context.checkpoint?.selection)
    ? (context.checkpoint.selection as number[]).filter(Number.isInteger)
    : [];
  const display = document.createElement('div');
  display.className = 'pilot-board';
  display.setAttribute('aria-label', 'وضعیت بازی');
  context.workspace.prepend(display);
  const save = () => context.saveCheckpoint?.({ selection });
  if (node.type === 'memory_mirror') {
    const payload = node.payload;
    selection = payload.labels.map((_, i) =>
      payload.values.includes(selection[i]!) ? selection[i]! : payload.values[0]!,
    );
    const show = () => {
      display.replaceChildren();
      payload.labels.forEach((label, i) => {
        const group = document.createElement('div');
        const title = document.createElement('strong');
        title.textContent = label;
        group.append(title);
        payload.values.forEach((value) => {
          const b = context.button(
            String(value),
            () => {
              selection[i] = value;
              save();
              show();
            },
            group,
          );
          b.setAttribute('aria-pressed', String(selection[i] === value));
        });
        display.append(group);
      });
    };
    show();
  } else {
    const cards = node.type === 'runtime_forge' ? node.payload.cards : node.payload.gates;
    selection = selection.filter(
      (value, i) => value >= 0 && value < cards.length && selection.indexOf(value) === i,
    );
    const show = () => {
      display.replaceChildren();
      selection.forEach((value, i) =>
        context.button(
          cards[value]!,
          () => {
            selection.splice(i, 1);
            save();
            show();
          },
          display,
        ),
      );
    };
    cards.forEach((card, i) =>
      context.button(card, () => {
        if (!selection.includes(i)) {
          selection.push(i);
          save();
          show();
        }
      }),
    );
    context.button('پاک کردن مسیر', () => {
      selection = [];
      save();
      show();
    });
    show();
  }
  context.button('اجرای آزمایش', () => void context.submit(selection));
}
