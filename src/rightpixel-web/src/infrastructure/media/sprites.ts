import type { NodeType } from '../../core/contracts.js';

export interface PixelSprite {
  matrix: readonly string[];
  palette: Readonly<Record<string, string>>;
}
const palette = {
  a: '#9bb5cc',
  s: '#edc6a6',
  e: '#172230',
  b: '#80ddcd',
  w: '#edf7f9',
  g: '#edc875',
  p: '#af91e1',
  d: '#42335d',
  r: '#ec8b92',
  l: '#8aba73',
  k: '#33404c',
  o: '#f1a05b',
};
export const SPRITES = {
  hero: {
    palette,
    matrix: [
      '....aaaa....',
      '...aaaaaa...',
      '...aseesa...',
      '....ssss.w..',
      '...abbbabw..',
      '..aabbbabw..',
      '..gabbbaaw..',
      '..ggbbba.w..',
      '....aaaa....',
      '...aa..aa...',
      '..aaa..aaa..',
    ],
  },
  wizard: {
    palette,
    matrix: [
      '.....pp.....',
      '....pppp....',
      '...pppppp...',
      '..pppppppp..',
      '....sees..g.',
      '....ssss..g.',
      '...pppppp.g.',
      '..ppppppp.g.',
      '..pppdppp.g.',
      '...pppppp.g.',
      '..ppppppppg.',
    ],
  },
  riddler: {
    palette,
    matrix: [
      '....bbbb....',
      '...bbddbb...',
      '..bbddddbb..',
      '..bdeeeddb..',
      '..bddggddb..',
      '...bddddb...',
      '...bbbbbb...',
      '..bbddddbb..',
      '..bbbgddbb..',
      '...bbddbb...',
      '..bbb..bbb..',
    ],
  },
  goblin: {
    palette,
    matrix: [
      '..l......l..',
      '..lll..lll..',
      '...llllll...',
      '..llellell..',
      '...llllll...',
      '....wrrw....',
      '...rrrrrr...',
      '..llrgrrll..',
      '....kkkk....',
      '...ll..ll...',
      '..lll..lll..',
    ],
  },
  bomb: {
    palette,
    matrix: [
      '......o.....',
      '.....o......',
      '.....g......',
      '....aaaa....',
      '...kkkkkk...',
      '..kkkwwkkk..',
      '..kkkwwkkk..',
      '..kkkkkkkk..',
      '...kkkkkk...',
      '....aaaa....',
      '...aa..aa...',
    ],
  },
  boss: {
    palette,
    matrix: [
      '.g........g.',
      '.gg..dd..gg.',
      '..dddddddd..',
      '.ddreddredd.',
      '.dddddddddd.',
      '..dwwwwwwd..',
      '.pddddddddp.',
      'ppppdggdpppp',
      'ppppddddpppp',
      '..ddd..ddd..',
      '.dddd..dddd.',
    ],
  },
} satisfies Record<string, PixelSprite>;
export type SpriteName = keyof typeof SPRITES;
export type NpcSpriteName = Exclude<SpriteName, 'hero'>;
export const SPRITE_LABELS: Record<NpcSpriteName, string> = {
  wizard: 'حکیم',
  riddler: 'معماگو',
  goblin: 'گابلین',
  bomb: 'بمب',
  boss: 'غول',
};
const fallback: Record<NodeType, NpcSpriteName> = {
  runtime_forge: 'wizard',
  memory_mirror: 'riddler',
  branch_gates: 'goblin',
  boss_fight: 'boss',
  dialogue_lore: 'wizard',
  who_am_i: 'riddler',
  bug_sniper: 'goblin',
  bomb_defusal: 'bomb',
  compiler_judge: 'boss',
  code_puzzle: 'riddler',
};
export function npcSprite(name: string, type: NodeType): NpcSpriteName {
  return name !== 'hero' && Object.hasOwn(SPRITES, name) ? (name as NpcSpriteName) : fallback[type];
}

export function drawPixelMatrix(
  ctx: CanvasRenderingContext2D,
  matrix: readonly string[],
  colors: Readonly<Record<string, string>>,
  x: number,
  y: number,
  scale: number,
) {
  matrix.forEach((row, rowIndex) =>
    [...row].forEach((pixel, column) => {
      if (pixel !== '.' && colors[pixel]) {
        ctx.fillStyle = colors[pixel];
        ctx.fillRect(
          Math.round(x + column * scale),
          Math.round(y + rowIndex * scale),
          scale,
          scale,
        );
      }
    }),
  );
}
export function drawSprite(
  ctx: CanvasRenderingContext2D,
  name: SpriteName,
  x: number,
  y: number,
  scale: number,
) {
  const sprite = SPRITES[name];
  drawPixelMatrix(ctx, sprite.matrix, sprite.palette, x, y, scale);
}
export { drawAvatar as renderAvatar } from './avatars.js';
