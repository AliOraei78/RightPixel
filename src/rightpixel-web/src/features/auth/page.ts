import { ApiError } from '../../core/errors';
import type { AuthGateway } from '../../core/ports';
import { platform } from '../../ui/platform';
import { bindFormValidation } from '../../ui/form-validation';
export function mountAuth(
  root: HTMLElement,
  api: AuthGateway,
  onLogin: () => void,
  mode = 'login',
  target = '/dungeon',
) {
  let email = '',
    avatarId = 'avatar-01',
    disposed = false,
    timer: number | undefined;
  const register = mode === 'register';
  const route = (path: string) => {
    location.hash = path + '?returnTo=' + encodeURIComponent(target);
  };
  function frame(title: string, subtitle: string, body: string, footer: string) {
    if (timer) clearInterval(timer);
    root.innerHTML = `<main class="auth-layout"><section class="auth-card panel ${register && title === 'قهرمانت رو بساز' ? 'auth-register' : ''}"><a href="#/" class="auth-brand" dir="ltr">RIGHT<span>PIXEL</span></a><h1>${title}</h1><p class="auth-intro">${subtitle}</p>${body}<footer class="auth-footer">${footer}<a class="auth-home" href="#/">برگشت به صفحهٔ آغاز</a></footer></section></main>`;
    root.querySelectorAll<HTMLAnchorElement>('a[href^="#/"]').forEach((link) => {
      const href = link.getAttribute('href')!;
      if (href !== '#/' && !href.includes('?'))
        link.setAttribute('href', href + '?returnTo=' + encodeURIComponent(target));
    });
    const form = root.querySelector('form')!;
    bindFormValidation(form);
    form.querySelectorAll<HTMLInputElement>('input[type=password]').forEach((input) => {
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'password-visibility';
      toggle.textContent = 'نمایش';
      toggle.setAttribute('aria-label', 'نمایش رمز');
      input.setAttribute('aria-label', input.closest('label')?.textContent?.trim() ?? 'رمز');
      toggle.setAttribute('aria-pressed', 'false');
      toggle.onclick = () => {
        const visible = input.type === 'password';
        input.type = visible ? 'text' : 'password';
        toggle.textContent = visible ? 'پنهان' : 'نمایش';
        toggle.setAttribute('aria-label', visible ? 'پنهان کردن رمز' : 'نمایش رمز');
        toggle.setAttribute('aria-pressed', String(visible));
      };
      const wrapper = document.createElement('div');
      wrapper.className = 'password-field';
      input.before(wrapper);
      wrapper.append(input, toggle);
    });
    return form;
  }
  const status = (text: string, tone = 'error') => {
    if (!disposed) {
      const message = root.querySelector<HTMLElement>('[data-auth-status]')!;
      message.textContent = text;
      message.dataset.tone = tone;
    }
  };
  function passwordForm() {
    const form = frame(
      'رمزت رو بساز',
      'یه رمز ۶ تا ۱۲۸ کاراکتری با حداقل یک حرف، یک عدد و یک نماد بساز.',
      '<form novalidate><label>رمز جدید<input name="password" type="password" required autocomplete="new-password"></label><label>تکرار رمز<input name="confirmation" type="password" required autocomplete="new-password"></label><button class="auth-primary" type="submit">ذخیرهٔ رمز</button><p class="auth-status" data-auth-status role="status"></p></form>',
      '<a href="#/forgot-password">تأیید دوبارهٔ ایمیل</a><a href="#/login">رمز رو ساختی؟ وارد شو</a>',
    );
    form.onsubmit = async (e) => {
      e.preventDefault();
      const pass = form.querySelector<HTMLInputElement>('[name=password]')!,
        confirmation = form.querySelector<HTMLInputElement>('[name=confirmation]')!,
        button = form.querySelector<HTMLButtonElement>('[type=submit]')!;
      if (pass.value !== confirmation.value) {
        status('تکرار رمز با رمزت یکی نیست.');
        confirmation.focus();
        return;
      }
      button.disabled = true;
      try {
        const result = await api.request<{ authenticated: boolean }>('/auth/password', {
          method: 'POST',
          body: JSON.stringify({ password: pass.value }),
        });
        if (!disposed) {
          form.reset();
          if (result.authenticated) onLogin();
          else route('/login');
        }
      } catch (error) {
        status(error instanceof Error ? error.message : 'رمز ذخیره نشد.');
        button.disabled = false;
      }
    };
  }
  function loginForm() {
    const form = frame(
      'ورود به سفر',
      'با ایمیل و رمزت وارد شو؛ سیوت منتظرته.',
      '<form novalidate><label>ایمیل<input name="email" type="email" required autocomplete="username" dir="ltr"></label><label>رمز<input name="password" type="password" required autocomplete="current-password"></label><label class="remember-me"><input name="rememberMe" type="checkbox">من رو به خاطر بسپار</label><p class="remember-help">حداکثر ۷ روز؛ بعد از ۲۴ ساعت بی‌کاری دوباره وارد شو.</p><button class="auth-primary" type="submit">ورود</button><p class="auth-status" data-auth-status role="status"></p></form>',
      '<a href="#/forgot-password">رمزم یادم نیست / تکمیل حساب</a><a href="#/register">ساخت حساب</a>',
    );
    form.onsubmit = async (e) => {
      e.preventDefault();
      const button = form.querySelector<HTMLButtonElement>('[type=submit]')!;
      if (button.disabled) return;
      button.disabled = true;
      try {
        await api.request('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: form.querySelector<HTMLInputElement>('[name=email]')!.value.trim(),
            password: form.querySelector<HTMLInputElement>('[name=password]')!.value,
            rememberMe: form.querySelector<HTMLInputElement>('[name=rememberMe]')!.checked,
          }),
        });
        if (!disposed) {
          form.reset();
          onLogin();
        }
      } catch (error) {
        status(error instanceof Error ? error.message : 'ورود انجام نشد.');
        button.disabled = false;
      }
    };
  }
  function show() {
    const form = frame(
      register ? 'قهرمانت رو بساز' : 'ساخت یا بازیابی رمز',
      register
        ? 'اسمت رو بنویس، یه شخصیت انتخاب کن و سفرت رو شروع کن.'
        : 'ایمیلت رو وارد کن تا کد تأیید رو برات بفرستیم.',
      `<form novalidate><label>ایمیل<input name="email" type="email" required autocomplete="email" dir="ltr" placeholder="name@example.com"></label>${register ? '<label>نام بازیکن<input name="playerName" maxlength="50" required autocomplete="nickname" placeholder="دوست داری چی صدات کنیم؟"></label><p class="avatar-label">قهرمانت کدومه؟</p><div id="avatars"></div>' : ''}<button class="auth-primary" type="submit">دریافت کد</button><p class="auth-status" data-auth-status role="status"></p></form>`,
      register
        ? '<span>قبلاً حساب ساختی؟ <a id="switch" href="#/login">حساب دارم</a></span>'
        : '<span>تازه رسیدی؟ <a id="switch" href="#/register">ساخت حساب</a></span>',
    );
    const input = form.querySelector<HTMLInputElement>('[name=email]')!;
    input.value = email;
    if (register)
      platform.avatars.mount(root.querySelector('#avatars')!, avatarId, (id) => {
        avatarId = id;
      });
    root.querySelector('#switch')!.addEventListener('click', (e) => {
      e.preventDefault();
      route(register ? '/login' : '/register');
    });
    form.onsubmit = async (e) => {
      e.preventDefault();
      const button = form.querySelector<HTMLButtonElement>('[type=submit]')!;
      if (button.disabled) return;
      button.disabled = true;
      email = input.value.trim();
      status('داریم کدت رو می‌فرستیم…', 'info');
      try {
        const result = register
          ? await api.register(
              email,
              form.querySelector<HTMLInputElement>('[name=playerName]')!.value,
              avatarId,
            )
          : await api.requestCode(email);
        if (!disposed) {
          history.replaceState(null, '', '#/verify-email?returnTo=' + encodeURIComponent(target));
          verify(result.remainingSeconds, 'کد ارسال شد؛ ایمیلت رو چک کن.');
        }
      } catch (error) {
        if (disposed) return;
        const text = error instanceof Error ? error.message : 'این بار نشد؛ دوباره امتحان کن.';
        if (error instanceof ApiError && (error.status === 429 || error.status === 503)) {
          history.replaceState(null, '', '#/verify-email?returnTo=' + encodeURIComponent(target));
          verify(error.retryAfter ?? 120, text);
        } else {
          status(text);
          button.disabled = false;
        }
      }
    };
  }
  function verify(seconds: number, message = '') {
    const form = frame(
      'کدت رو وارد کن',
      'کد شش‌رقمی رو از ایمیلت بردار و اینجا بنویس.',
      `<form novalidate><label>کد تأیید<input class="verification-code" name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required dir="ltr" placeholder="------"></label><button class="auth-primary" type="submit">تأیید ایمیل</button></form><p class="auth-status" data-auth-status role="status"></p><button class="auth-secondary" id="resend" type="button"></button><button class="auth-text-button" id="back" type="button">تغییر ایمیل</button>`,
      '',
    );
    const destination = document.createElement('p');
    destination.className = 'verification-destination';
    destination.dir = 'ltr';
    destination.textContent = email;
    root.querySelector('.auth-intro')!.after(destination);
    status(
      message.replace(/ارسال مجدد (?:پس|بعد) از \d+ ثانیه/, 'برای کد تازه، شمارش معکوس رو ببین.'),
    );
    root.querySelector<HTMLElement>('[data-auth-status]')!.dataset.tone = message.includes(
      'ارسال شد',
    )
      ? 'success'
      : message
        ? 'error'
        : 'info';
    const resend = root.querySelector<HTMLButtonElement>('#resend')!;
    const end = Date.now() + seconds * 1000;
    let sending = false;
    const tick = () => {
      const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      resend.disabled = left > 0 || sending;
      resend.textContent = left ? `${left} ثانیه دیگه می‌تونی کد بگیری` : 'ارسال مجدد کد';
    };
    tick();
    timer = window.setInterval(tick, 250);
    form.onsubmit = async (e) => {
      e.preventDefault();
      const button = form.querySelector<HTMLButtonElement>('button')!;
      if (button.disabled) return;
      button.disabled = true;
      try {
        await api.verifyCode(email, form.querySelector<HTMLInputElement>('input')!.value);
        if (!disposed) {
          history.replaceState(null, '', '#/set-password?returnTo=' + encodeURIComponent(target));
          passwordForm();
        }
      } catch (error) {
        if (!disposed) {
          status(error instanceof Error ? error.message : 'کد تأیید نشد.');
          button.disabled = false;
        }
      }
    };
    resend.onclick = async () => {
      if (sending) return;
      sending = true;
      resend.disabled = true;
      try {
        const result = await api.resendCode(email);
        if (!disposed) verify(result.remainingSeconds, 'کد جدید ارسال شد.');
      } catch (error) {
        if (disposed) return;
        if (error instanceof ApiError && error.retryAfter) verify(error.retryAfter);
        else resend.disabled = false;
        status(error instanceof Error ? error.message : 'کد ارسال نشد.');
      } finally {
        sending = false;
        if (!disposed && root.contains(resend)) tick();
      }
    };
    root.querySelector<HTMLButtonElement>('#back')!.onclick = () => route('/login');
  }
  let pendingBusy = false;
  async function restorePending() {
    if (pendingBusy || disposed) return;
    pendingBusy = true;
    try {
      const p = await api.pending();
      if (disposed) return;
      if (p.email) {
        email = p.email;
        verify(p.remainingSeconds);
      } else route('/login');
    } catch (error) {
      if (disposed) return;
      frame(
        'ارتباط قطع شد',
        'دوباره امتحان کن؛ ایمیل تازه‌ای خودکار ارسال نمی‌شه.',
        '<form><button type="button" id="retry-pending" class="auth-primary">تلاش دوباره</button><p class="auth-status" data-auth-status role="status"></p></form>',
        '',
      );
      status(error instanceof Error ? error.message : 'ارتباط قطع شد.');
      root.querySelector<HTMLButtonElement>('#retry-pending')!.onclick = () => {
        void restorePending();
      };
    } finally {
      pendingBusy = false;
    }
  }
  if (mode === 'verify-email') {
    frame(
      'تأیید ایمیل',
      'وضعیت تأیید قبلی رو بررسی می‌کنیم؛ ایمیل تازه‌ای ارسال نمی‌شه.',
      '<form><p class="auth-status" data-auth-status role="status"></p></form>',
      '',
    );
    void restorePending();
  } else if (mode === 'set-password') passwordForm();
  else if (mode === 'login') loginForm();
  else show();
  return () => {
    disposed = true;
    if (timer) clearInterval(timer);
  };
}
