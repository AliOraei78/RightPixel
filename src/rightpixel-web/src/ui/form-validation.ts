let nextId = 0;
export function bindFormValidation(form: HTMLFormElement) {
  form.noValidate = true;
  const fields = [...form.querySelectorAll<HTMLInputElement>('input')];
  const errors = new Map<HTMLInputElement, HTMLElement>();
  for (const field of fields) {
    const error = document.createElement('p');
    error.id = `field-error-${++nextId}`;
    error.className = 'field-error';
    error.role = 'alert';
    error.hidden = true;
    (field.closest('label') ?? field).after(error);
    errors.set(field, error);
    field.addEventListener('input', () => {
      if (field.name === 'code')
        field.value = field.value.replace(/[۰-۹٠-٩]/g, (c) =>
          String(c.charCodeAt(0) - (c >= '۰' ? 1776 : 1632)),
        );
      if (field.getAttribute('aria-invalid') === 'true') show(field);
    });
  }
  function message(field: HTMLInputElement) {
    const value = ['password', 'confirmation'].includes(field.name)
      ? field.value
      : field.value.trim();
    if (field.required && !value)
      return field.name === 'email'
        ? 'ایمیلت رو وارد کن.'
        : ['password', 'confirmation'].includes(field.name)
          ? 'رمزت رو وارد کن.'
          : field.name === 'code'
            ? 'کدی که برات ایمیل شده رو وارد کن.'
            : 'یه اسم برای قهرمانت بنویس.';
    if (
      field.name === 'password' &&
      field.autocomplete === 'new-password' &&
      ([...value].length < 6 ||
        [...value].length > 128 ||
        !/\p{L}/u.test(value) ||
        !/\p{Nd}/u.test(value) ||
        !/[\p{P}\p{S}]/u.test(value))
    )
      return 'رمز باید ۶ تا ۱۲۸ کاراکتر و شامل حرف، عدد و نماد باشه.';
    if (field.type === 'email' && field.validity.typeMismatch)
      return 'این ایمیل درست به نظر نمیاد؛ مثلاً name@example.com وارد کن.';
    if (field.name === 'code' && !/^[0-9]{6}$/.test(value)) return 'کد باید دقیقاً ۶ رقم باشه.';
    if (field.maxLength > 0 && value.length > field.maxLength)
      return `حداکثر ${field.maxLength} کاراکتر می‌تونی وارد کنی.`;
    if (!field.validity.valid) return 'این قسمت رو دوباره چک کن.';
    return '';
  }
  function show(field: HTMLInputElement) {
    const text = message(field),
      error = errors.get(field)!;
    error.textContent = text;
    error.hidden = !text;
    if (text) {
      field.setAttribute('aria-invalid', 'true');
      const ids = new Set(
        (field.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean),
      );
      ids.add(error.id);
      field.setAttribute('aria-describedby', [...ids].join(' '));
    } else {
      field.removeAttribute('aria-invalid');
      const ids = (field.getAttribute('aria-describedby') ?? '')
        .split(' ')
        .filter((id) => id && id !== error.id);
      if (ids.length) field.setAttribute('aria-describedby', ids.join(' '));
      else field.removeAttribute('aria-describedby');
    }
    return !text;
  }
  form.addEventListener(
    'submit',
    (e) => {
      let first: HTMLInputElement | undefined;
      for (const field of fields) {
        if (field.type === 'email') field.value = field.value.trim();
        if (!show(field)) first ??= field;
      }
      if (first) {
        e.preventDefault();
        e.stopImmediatePropagation();
        first.focus();
      }
    },
    { capture: true },
  );
}
