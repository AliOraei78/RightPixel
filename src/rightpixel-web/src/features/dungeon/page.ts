import { mountArena } from '../gameplay/arena';
import type { GameNode, PlayerState, Stage } from '../../core/contracts';
import type { GameGateway } from '../../core/ports';
export function createDungeonFeature() {
  let cleanup = () => {},
    generation = 0;
  const dispose = () => {
    generation++;
    cleanup();
    cleanup = () => {};
  };
  async function mount(
    root: HTMLElement,
    roomId: string,
    store: GameGateway,
    state: PlayerState,
    _refresh: () => Promise<void>,
    onState: (s: PlayerState) => void,
    reviewing = false,
  ) {
    dispose();
    const version = generation;
    const alive = () => root.isConnected && generation === version;
    root.innerHTML =
      '<section class="panel game-map"><div id="map"><h2>مسیر سفر</h2></div><div id="arena"></div></section>';
    const map = root.querySelector<HTMLElement>('#map')!,
      arena = root.querySelector<HTMLElement>('#arena')!;
    const error = (e: unknown) => {
      if (alive()) {
        const p = document.createElement('p');
        p.role = 'alert';
        p.textContent = e instanceof Error ? e.message : 'ارتباط برقرار نشد.';
        root.append(p);
      }
    };
    const sync = (updated: PlayerState) => {
      state = updated;
      onState(updated);
    };
    const stages: Stage[] = [];
    let opening = false;
    const open = async (id: string, updateHistory = false) => {
      if (opening) return;
      opening = true;
      map.hidden = true;
      try {
        const node = await store.getNode(id);
        if (!alive()) return;
        let review;
        if (reviewing) {
          const completed = new Set(
            state.completedNodes.filter((p) => p.completedAt).map((p) => p.nodeId),
          );
          if (!completed.has(id)) throw new Error('این قسمت هنوز تکمیل نشده.');
          const stage = stages.find((stage) => stage.id === node.stageId);
          const phase = stage?.title.match(/فاز [۰-۹0-9]+/)?.[0];
          const phaseStages = stages.filter(
            (candidate) =>
              candidate.worldId === stage?.worldId &&
              (phase
                ? candidate.title.match(/فاز [۰-۹0-9]+/)?.[0] === phase
                : candidate.id === stage?.id),
          );
          const rooms = (
            await Promise.all(
              phaseStages
                .sort((a, b) => a.stageNumber - b.stageNumber)
                .map((stage) => store.getNodes(stage.id)),
            )
          )
            .flat()
            .filter((room) => completed.has(room.id));
          if (!alive()) return;
          const index = rooms.findIndex((room) => room.id === id);
          review = {
            phase: phase ?? 'درس',
            checkpoint: await store.checkpoint(id),
            previous: rooms[index - 1],
            next: rooms[index + 1],
            navigate: (id: string) => {
              void open(id, true);
            },
          };
        }
        if (!alive()) return;
        cleanup();
        cleanup = await mountArena(
          arena,
          node,
          store,
          state,
          sync,
          async (id) => {
            location.hash = '/play/' + encodeURIComponent(id);
          },
          () => {
            location.hash = '/dungeon';
          },
          alive,
          review,
        );
        if (updateHistory && alive())
          history.pushState(null, '', '#/review/' + encodeURIComponent(id));
      } catch (e) {
        if (!arena.childElementCount) map.hidden = false;
        error(e);
      } finally {
        opening = false;
      }
    };
    async function rebuild() {
      map.replaceChildren();
      const heading = document.createElement('h2');
      heading.textContent = 'مسیر سفر';
      map.append(heading);
      const resume = document.createElement('button');
      resume.textContent = 'ادامهٔ سفر';
      resume.onclick = () => {
        if (state.activeNodeId) location.hash = '/play/' + encodeURIComponent(state.activeNodeId);
        else map.querySelector<HTMLButtonElement>('.stage-rooms button:not(:disabled)')?.click();
      };
      map.append(resume);
      const phases = new Map<string, HTMLElement>();
      const worlds = await store.getWorlds();
      for (const world of worlds) {
        for (const stage of await store.getStages(world.id)) {
          stages.push(stage);
          if (!alive()) return;
          const details = document.createElement('details');
          details.className = 'stage-map';
          details.dataset.stageId = stage.id;
          const summary = document.createElement('summary');
          summary.textContent = stage.title;
          details.append(summary);
          const phase = stage.title.match(/فاز [۰-۹0-9]+/)?.[0] ?? 'مرحله‌ها';
          if (!phases.has(phase)) {
            const group = document.createElement('details');
            group.className = 'phase-map';
            const title = document.createElement('summary');
            title.textContent = phase;
            group.append(title);
            map.append(group);
            phases.set(phase, group);
          }
          phases.get(phase)!.append(details);
          let loaded = false;
          details.ontoggle = async () => {
            if (!details.open || loaded) return;
            loaded = true;
            try {
              const rooms = await store.getNodes(stage.id);
              if (!alive()) return;
              const grid = document.createElement('div');
              grid.className = 'stage-rooms';
              for (const room of rooms) {
                const b = document.createElement('button');
                b.dataset.nodeId = room.id;
                b.textContent =
                  (state.completedNodes.some((p) => p.nodeId === room.id && p.completedAt)
                    ? '✓ '
                    : '◇ ') + room.title;
                b.disabled = !!room.isLocked;
                const completed = state.completedNodes.some(
                  (p) => p.nodeId === room.id && p.completedAt,
                );
                b.textContent =
                  (room.isLocked ? '🔒 قفل · ' : completed ? '✓ تمام‌شده · ' : '◇ جاری · ') +
                  room.title;
                b.onclick = () => {
                  location.hash = (completed ? '/review/' : '/play/') + encodeURIComponent(room.id);
                };
                grid.append(b);
              }
              details.append(grid);
            } catch (e) {
              loaded = false;
              error(e);
            }
          };
          if (
            stage.stageNumber === 1 ||
            stage.id === state.activeNodeId?.replace(/_n.*|_pilot$/, '')
          ) {
            details.open = true;
            (phases.get(phase)! as HTMLDetailsElement).open = true;
          }
        }
      }
    }
    try {
      await rebuild();
      if (roomId) await open(roomId);
      root.dataset.ready = 'true';
    } catch (e) {
      error(e);
    }
  }
  return { mount, dispose };
}
