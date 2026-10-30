import { platform } from '../../ui/platform';
import type { Workshop } from '../../core/contracts';

export function appendSources(root: HTMLElement, sources: string[] | undefined) {
  if (!sources?.length) return;
  const details = document.createElement('details');
  details.className = 'learning-sources';
  const summary = document.createElement('summary');
  summary.textContent = 'منابع رسمی و مطالعهٔ بیشتر';
  details.append(summary);
  for (const value of sources) {
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      continue;
    }
    if (url.protocol !== 'https:') continue;
    const p = document.createElement('p'),
      a = document.createElement('a');
    a.href = url.href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = url.hostname + url.pathname;
    a.dir = 'ltr';
    p.append(a);
    details.append(p);
  }
  root.append(details);
}

export function mountWorkshop(
  root: HTMLElement,
  nodeId: string,
  workshop: Workshop,
  checkpoint?: Record<string, unknown>,
  save?: (state: Record<string, unknown>) => void,
) {
  const details = document.createElement('details');
  details.className = 'workshop';
  const summary = document.createElement('summary');
  summary.textContent = 'تمرین مستقل C# · کد شروع و معیار ارزیابی';
  details.append(summary);
  const info = document.createElement('p');
  info.textContent =
    'در بازی، بلوک‌های راه‌حل را مرتب کن. برای Live Coding مستقل، کد را خودت بنویس و پروژهٔ .NET را روی دستگاهت اجرا کن. کد دلخواه در سرور بازی اجرا نمی‌شود.';
  details.append(info);
  const label = document.createElement('label');
  label.textContent = 'پیش‌نویس کد C#';
  const editor = document.createElement('textarea');
  editor.dir = 'ltr';
  editor.spellcheck = false;
  editor.className = 'workshop-editor';
  editor.setAttribute('aria-label', 'پیش‌نویس کد C#');
  const key = nodeId;
  editor.value = workshop.starterCode;
  if (typeof checkpoint?.draft === 'string') editor.value = checkpoint.draft;
  editor.maxLength = 32000;
  const saved = document.createElement('p');
  saved.role = 'status';
  editor.addEventListener('input', () => {
    save?.({ draft: editor.value });
    saved.textContent = 'در حال ذخیره در حساب…';
  });
  label.append(editor);
  details.append(label, saved);
  const actions = document.createElement('div');
  actions.className = 'actions';
  const zip = document.createElement('a');
  zip.className = 'button-link';
  zip.textContent = 'دریافت پروژهٔ کارگاه (.NET)';
  zip.href = '#';
  zip.download = `rightpixel-csharp-${workshop.sessionId}.zip`;
  let downloading = false;
  zip.onclick = async (event) => {
    event.preventDefault();
    if (downloading) return;
    downloading = true;
    zip.setAttribute('aria-disabled', 'true');
    try {
      platform.files.download(
        zip.download,
        await platform.files.project(workshop.sessionId),
        'application/zip',
      );
    } catch (e) {
      saved.textContent = e instanceof Error ? e.message : 'دریافت انجام نشد.';
    } finally {
      downloading = false;
      zip.removeAttribute('aria-disabled');
    }
  };
  actions.append(zip);
  const download = document.createElement('button');
  download.type = 'button';
  download.textContent = 'دریافت پیش‌نویس Program.cs';
  download.onclick = () =>
    platform.files.download('Program.cs', editor.value, 'text/plain;charset=utf-8');
  actions.append(download);
  details.append(actions);
  const outputLabel = document.createElement('p');
  outputLabel.textContent = 'خروجی مورد انتظار پس از پیاده‌سازی:';
  const output = document.createElement('pre');
  output.dir = 'ltr';
  output.textContent = workshop.expectedOutput;
  details.append(outputLabel, output);
  const rubric = document.createElement('ul');
  for (const text of workshop.rubric) {
    const li = document.createElement('li');
    li.textContent = text;
    rubric.append(li);
  }
  details.append(rubric);
  if (workshop.solutionCode) {
    const reference = document.createElement('details'),
      referenceLabel = document.createElement('summary');
    referenceLabel.textContent = 'نمایش پاسخ مرجع برای مقایسه';
    const solution = document.createElement('pre');
    solution.dir = 'ltr';
    solution.textContent = workshop.solutionCode;
    reference.append(referenceLabel, solution);
    details.append(reference);
  }
  appendSources(details, workshop.sources);
  root.append(details);
}
