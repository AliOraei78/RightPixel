import { renderPilot } from './pilot';
import type { GameNode } from '../../core/contracts';
import type { RenderContext } from './render-context';
import { renderDialogueLore } from './dialogue_lore';
import { renderWhoAmI } from './who_am_i';
import { renderBugSniper } from './bug_sniper';
import { renderCompilerJudge } from './compiler_judge';
import { renderBombDefusal } from './bomb_defusal';
import { renderCodePuzzle } from './code_puzzle';
export function renderChallenge(node: GameNode, context: RenderContext) {
  switch (node.type) {
    case 'runtime_forge':
    case 'memory_mirror':
    case 'branch_gates':
      return renderPilot(node, context);
    case 'boss_fight': {
      const index = context.roundIndex ?? 0,
        round = node.payload.rounds[index];
      context.paragraph(`نگهبان: ${3 - index} ضربه تا پیروزی · دور ${index + 1} از ۳`);
      if (round)
        renderChallenge({ ...node, type: round.type, payload: round.payload } as GameNode, context);
      return;
    }
    case 'dialogue_lore':
      return renderDialogueLore(node, context);
    case 'who_am_i':
      return renderWhoAmI(node, context);
    case 'bug_sniper':
      return renderBugSniper(node, context);
    case 'compiler_judge':
      return renderCompilerJudge(node, context);
    case 'bomb_defusal':
      return renderBombDefusal(node, context);
    case 'code_puzzle':
      return renderCodePuzzle(node, context);
  }
}
