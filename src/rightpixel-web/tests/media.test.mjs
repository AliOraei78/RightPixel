import {AVATARS,drawAvatar} from '../.media-tests/infrastructure/media/avatars.js';
import assert from 'node:assert/strict';
import test from 'node:test';
import { SPRITES, npcSprite, drawPixelMatrix, renderAvatar } from '../.media-tests/infrastructure/media/sprites.js';
import { PreferenceStore, PREFERENCE_KEY, mediaPreferences, reducedMotion } from '../.media-tests/infrastructure/media/preferences.js';
import { AudioSynth, SOUND_CUES } from '../.media-tests/infrastructure/media/audio.js';
import { createDungeonScene } from '../.media-tests/infrastructure/media/scene.js';

test('all six pixel characters have complete, distinct 12×11 matrices and palettes', () => {
  const matrices = new Set();
  for (const [name, sprite] of Object.entries(SPRITES)) {
    assert.equal(sprite.matrix.length, 11, name);
    for (const row of sprite.matrix) {
      assert.equal(row.length, 12, `${name}: ${row}`);
      for (const pixel of row) if (pixel !== '.') assert.ok(sprite.palette[pixel], `${name}: missing ${pixel}`);
    }
    matrices.add(sprite.matrix.join(''));
  }
  assert.equal(matrices.size, 6);
});

test('unknown NPC names fall back by room type, including malformed author input', () => {
  const expected = { dialogue_lore: 'wizard', who_am_i: 'riddler', bug_sniper: 'goblin', bomb_defusal: 'bomb', compiler_judge: 'boss', code_puzzle: 'riddler' };
  for (const [type, sprite] of Object.entries(expected)) {
    assert.equal(npcSprite('missing', type), sprite);
    assert.equal(npcSprite('__proto__', type), sprite);
    assert.equal(npcSprite('hero', type), sprite);
  }
  assert.equal(npcSprite('boss', 'dialogue_lore'), 'boss');
});

test('matrix drawing skips transparency and preserves exact pixel positions', () => {
  const squares = [], ctx = { fillStyle: '', fillRect(...position) { squares.push([this.fillStyle, ...position]); } };
  drawPixelMatrix(ctx, ['a.', '.b'], { a: '#123', b: '#456' }, 10, 20, 4);
  assert.deepEqual(squares, [['#123', 10, 20, 4, 4], ['#456', 14, 24, 4, 4]]);
});

test('motion preference follows the OS unless explicitly overridden', () => {
  assert.equal(reducedMotion('system', true), true);
  assert.equal(reducedMotion('system', false), false);
  assert.equal(reducedMotion('reduced', false), true);
  assert.equal(reducedMotion('full', true), false);
});

function storage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), values };
}

test('preferences migrate legacy mute and persist volume/motion across reloads', () => {
  const backing = storage({ sound: 'off' }), prefs = new PreferenceStore(backing);
  assert.equal(prefs.snapshot.sound, false);
  let changes = 0; const unsubscribe = prefs.subscribe(() => changes++);
  prefs.update({ sound: true, volume: .6, motion: 'reduced' });
  prefs.update({ volume: .6 }); assert.equal(changes, 1); unsubscribe();
  assert.deepEqual(new PreferenceStore(backing).snapshot, { sound: true, volume: .6, motion: 'reduced' });
  prefs.update({ volume: 999 }); assert.equal(prefs.snapshot.volume, 1);
  prefs.update({ volume: -1 }); assert.equal(prefs.snapshot.volume, 0);
});

test('corrupt or denied preference storage never blocks session settings', () => {
  const corrupt = new PreferenceStore(storage({ [PREFERENCE_KEY]: '{invalid' })); assert.equal(corrupt.snapshot.motion, 'system');
  const denied = new PreferenceStore({ getItem() { throw Error('denied'); }, setItem() { throw Error('denied'); } });
  assert.doesNotThrow(() => denied.update({ sound: false, motion: 'reduced' })); assert.equal(denied.snapshot.sound, false);
  const invalid = new PreferenceStore(storage({ [PREFERENCE_KEY]: JSON.stringify({ sound: 'yes', volume: 'loud', motion: 'unknown' }) }));
  assert.deepEqual(invalid.snapshot, { sound: true, volume: .35, motion: 'system' });
});

function audioContext() {
  const param = () => ({ value: 0, events: [], setValueAtTime(...args) { this.events.push(['set', ...args]); }, linearRampToValueAtTime(...args) { this.events.push(['linear', ...args]); }, exponentialRampToValueAtTime(...args) { this.events.push(['exponential', ...args]); } });
  const connection = () => ({ disconnects: 0, connect() {}, disconnect() { this.disconnects++; } });
  return {
    state: 'suspended', currentTime: 10, destination: {}, oscillators: [], gains: [], resumes: 0,
    async resume() { this.resumes++; this.state = 'running'; }, async suspend() { this.state = 'suspended'; }, async close() { this.state = 'closed'; },
    createGain() { const node = { ...connection(), gain: param() }; this.gains.push(node); return node; },
    createOscillator() { const node = { ...connection(), frequency: param(), starts: [], stops: [], start(at) { this.starts.push(at); }, stop(at) { this.stops.push(at); } }; this.oscillators.push(node); return node; },
  };
}

test('audio is gesture-unlocked and schedules the documented win and level-up notes', async () => {
  const ctx = audioContext(); let created = 0;
  const synth = new AudioSynth(new PreferenceStore(storage()), () => { created++; return ctx; });
  synth.play('win'); assert.equal(created, 0); assert.equal(ctx.oscillators.length, 0);
  assert.equal(await synth.unlock(), true); assert.equal(created, 1); assert.equal(ctx.resumes, 1);
  const cancel = synth.play('win');
  assert.deepEqual(ctx.oscillators.map(o => o.frequency.events[0][1]), [440, 554, 659, 880]);
  assert.ok(ctx.oscillators.every(o => o.type === 'square' && o.starts[0] >= 10));
  cancel(); assert.ok(ctx.oscillators.every(o => o.disconnects > 0));
  synth.play('levelUp', .65); assert.deepEqual(ctx.oscillators.slice(4).map(o => o.frequency.events[0][1]), [523, 659, 783, 1046]);
  assert.ok(ctx.oscillators.slice(4).every(o => o.type === 'triangle' && o.starts[0] >= 10.65));
  synth.dispose();
});

test('mute or zero volume stops queued audio, and failures in the device stay optional', async () => {
  const preferences = new PreferenceStore(storage()), ctx = audioContext(), synth = new AudioSynth(preferences, () => ctx);
  await synth.unlock(); synth.play('coin', 1); assert.equal(ctx.oscillators.length, 2);
  preferences.update({ sound: false }); assert.ok(ctx.oscillators.every(o => o.disconnects > 0));
  assert.equal(await synth.unlock(), false); synth.play('win'); assert.equal(ctx.oscillators.length, 2);
  preferences.update({ sound: true, volume: 0 }); assert.equal(await synth.unlock(), false);
  synth.dispose();
  const unavailable = new AudioSynth(new PreferenceStore(storage()), () => { throw Error('device unavailable'); });
  assert.equal(await unavailable.unlock(), false); assert.doesNotThrow(() => unavailable.play('fail')); unavailable.dispose();
  const broken = audioContext(), create = broken.createOscillator.bind(broken);
  broken.createOscillator = () => ({ ...create(), start() { throw Error('device disconnected'); }, stop() { throw Error('not started'); } });
  const disconnected = new AudioSynth(new PreferenceStore(storage()), () => broken);
  await disconnected.unlock(); assert.doesNotThrow(() => disconnected.play('win')); assert.ok(broken.gains[1].disconnects > 0); disconnected.dispose();
});

test('click, coin and descending failure use their separate waveforms and pitches', async () => {
  assert.equal(SOUND_CUES.click[0].frequency, 520); assert.equal(SOUND_CUES.click[0].duration, .05);
  assert.deepEqual(SOUND_CUES.coin.map(t => t.frequency), [987, 1318]);
  const ctx = audioContext(), synth = new AudioSynth(new PreferenceStore(storage()), () => ctx);
  await synth.unlock(); synth.play('fail');
  assert.ok(ctx.oscillators.every(o => o.type === 'sawtooth'));
  assert.equal(ctx.oscillators[0].frequency.events[1][0], 'exponential'); synth.dispose();
});

test('unavailable canvas does not prevent the game from mounting', () => {
  const canvas = { classList: { add() {} }, dataset: {}, setAttribute() {}, getContext() { return null; } };
  assert.doesNotThrow(() => { const scene = createDungeonScene(canvas, 'wizard', 'dialogue_lore'); scene.setMood('win'); scene.dispose(); renderAvatar(canvas); });
});

test('reduced motion and hidden documents stop scene frames; disposal removes listeners', () => {
  const original = new Map(['window', 'document', 'requestAnimationFrame', 'cancelAnimationFrame', 'ResizeObserver', 'MutationObserver'].map(key => [key, globalThis[key]]));
  const saved = mediaPreferences.snapshot, documentEvents = new Map(), queryEvents = new Map(), frames = new Map(); let frameId = 0;
  try {
    const query = { matches: false, addEventListener: (k, fn) => queryEvents.set(k, fn), removeEventListener: k => queryEvents.delete(k) };
    globalThis.window = { matchMedia: () => query, devicePixelRatio: 1, addEventListener() {}, removeEventListener() {}, setTimeout: () => 0 };
    globalThis.MutationObserver = class {observe(){} disconnect(){}};
    globalThis.ResizeObserver = class {observe(){} disconnect(){}};
    globalThis.document = { createElement:()=>({getContext:()=>ctx}),querySelector:()=>null, hidden: false, addEventListener: (k, fn) => documentEvents.set(k, fn), removeEventListener: k => documentEvents.delete(k) };
    globalThis.requestAnimationFrame = fn => { frames.set(++frameId, fn); return frameId; }; globalThis.cancelAnimationFrame = id => frames.delete(id);
    const ctx = { save(){},restore(){},translate(){},scale(){},drawImage(){},setTransform() {}, clearRect() {}, fillRect() {}, strokeRect() {} };
    const canvas = { classList: { add() {} }, dataset: {}, setAttribute() {}, getContext: () => ctx,getBoundingClientRect:()=>({width:640,height:220}) };
    mediaPreferences.update({ motion: 'reduced' });
    const scene = createDungeonScene(canvas, 'goblin', 'bug_sniper'); assert.equal(canvas.dataset.npcSprite, 'goblin'); assert.equal(frames.size, 0);
    scene.setMood('fail'); assert.equal(frames.size, 0);
    mediaPreferences.update({ motion: 'full' }); assert.equal(frames.size, 1);
    document.hidden = true; documentEvents.get('visibilitychange')(); assert.equal(frames.size, 0);
    document.hidden = false; documentEvents.get('visibilitychange')(); assert.equal(frames.size, 1);
    scene.dispose(); assert.equal(frames.size, 0); assert.equal(documentEvents.size, 0); assert.equal(queryEvents.size, 0);
  } finally {
    mediaPreferences.update(saved);
    original.forEach((value, key) => { if (value === undefined) delete globalThis[key]; else globalThis[key] = value; });
  }
});

test('48 account avatars have distinct pixel artwork',()=>{const fingerprints=new Set();for(const avatar of AVATARS){const operations=[];const ctx={fillStyle:'',imageSmoothingEnabled:false,clearRect(){},scale(){},fillRect(...args){operations.push([this.fillStyle,...args]);}};drawAvatar({getContext:()=>ctx},avatar.id);fingerprints.add(JSON.stringify(operations));}assert.equal(AVATARS.length,48);assert.equal(fingerprints.size,48);});

const {friendlyPersian}=await import('../.media-tests/ui/persian-copy.js');
test('friendly Persian keeps negation and technical content intact',()=>{assert.equal(friendlyPersian('این کد اجرا نمی‌شود.'),'این کد اجرا نمی‌شه.');assert.equal(friendlyPersian('C# ref int x = 3;'),'C# ref int x = 3;');assert.equal(friendlyPersian('دو شیء یکسان نیستند؛ کپی نمی‌کند.'),'دو شیء یکسان نیستند؛ کپی نمی‌کنه.');assert.equal(friendlyPersian('آرایه‌ها را بررسی کن.'),'آرایه‌ها رو بررسی کن.');});
