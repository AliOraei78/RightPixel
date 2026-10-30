import { audioSynth } from './audio.js';
import { mediaPreferences, type MotionPreference } from './preferences.js';

export function mountMediaSettings(root: HTMLElement) {
  root.className = 'panel profile media-settings';
  root.innerHTML = `<h2>صدا و حرکت</h2><p>تنظیمات روی همین مرورگر نگهداری می‌شوند.</p>
    <label class="confirm"><input id="sound-enabled" type="checkbox"> پخش صداهای بازی</label>
    <label for="sound-volume">بلندی صدا <output id="volume-value"></output></label><input id="sound-volume" type="range" min="0" max="100" step="5">
    <label for="motion-preference">حرکت و انیمیشن</label><select id="motion-preference"><option value="system">پیروی از تنظیم دستگاه</option><option value="reduced">حرکت کمتر</option><option value="full">حرکت کامل</option></select>
    <div class="actions"><button id="preview-sound" type="button">آزمایش صدا</button></div><p id="media-status" role="status"></p>`;
  const enabled = root.querySelector<HTMLInputElement>('#sound-enabled')!,
    volume = root.querySelector<HTMLInputElement>('#sound-volume')!;
  const motion = root.querySelector<HTMLSelectElement>('#motion-preference')!,
    preview = root.querySelector<HTMLButtonElement>('#preview-sound')!;
  const sync = () => {
    const settings = mediaPreferences.snapshot;
    enabled.checked = settings.sound;
    volume.value = String(Math.round(settings.volume * 100));
    root.querySelector('output')!.textContent = `${Math.round(settings.volume * 100)}٪`;
    motion.value = settings.motion;
    preview.disabled = !settings.sound || settings.volume === 0;
  };
  enabled.onchange = () => mediaPreferences.update({ sound: enabled.checked });
  volume.oninput = () => mediaPreferences.update({ volume: Number(volume.value) / 100 });
  motion.onchange = () => mediaPreferences.update({ motion: motion.value as MotionPreference });
  let stopPreview = () => {};
  preview.onclick = async () => {
    stopPreview();
    const ready = await audioSynth.unlock();
    if (!root.isConnected) return;
    if (ready) stopPreview = audioSynth.play('levelUp');
    root.querySelector('#media-status')!.textContent = ready
      ? 'صدای آزمایشی پخش شد.'
      : 'پخش صدا در این مرورگر در دسترس نیست.';
  };
  const unsubscribe = mediaPreferences.subscribe(sync);
  sync();
  return () => {
    stopPreview();
    unsubscribe();
  };
}
