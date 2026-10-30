import { bindFormValidation } from '../../ui/form-validation';
import type { PlayerState } from '../../core/contracts';
import type { GameGateway } from '../../core/ports';
import { platform } from '../../ui/platform';
import type { Disposable } from '../../ui/lifecycle';
export function mountProfile(
  content: HTMLElement,
  storage: GameGateway,
  initial: PlayerState,
  render: () => void,
  onUpdate: (s: PlayerState) => void,
  _media: (root: HTMLElement) => () => void,
): Disposable {
  let disposed = false,
    avatarId = initial.avatarId;
  content.innerHTML =
    '<section class="panel profile"><h2>قهرمان تو</h2><form><label>نام بازیکن<input name="playerName" required maxlength="50"></label><div id="profile-avatars"></div><button>ذخیرهٔ تغییرات</button><p role="status"></p></form></section>';
  const input = content.querySelector<HTMLInputElement>('input')!;
  input.value = initial.playerName;
  platform.avatars.mount(content.querySelector('#profile-avatars')!, avatarId, (id) => {
    avatarId = id;
  });
  bindFormValidation(content.querySelector('form')!);
  content.querySelector('form')!.onsubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await storage.updateProfile(input.value.trim(), avatarId);
      if (!disposed) {
        onUpdate(updated);
        render();
      }
    } catch (e) {
      if (!disposed)
        content.querySelector('[role=status]')!.textContent =
          e instanceof Error ? e.message : 'ذخیره انجام نشد.';
    }
  };
  return {
    dispose: () => {
      disposed = true;
    },
  };
}
