// Presentation-only wording keeps answer values, saved content and code unchanged.
const abbreviations: Record<string, string> = {
  CLI: 'Common Language Infrastructure',
  CLR: 'Common Language Runtime',
  IL: 'Intermediate Language',
  CIL: 'Common Intermediate Language',
  MSIL: 'Microsoft Intermediate Language',
  CTS: 'Common Type System',
  CLS: 'Common Language Specification',
  BCL: 'Base Class Library',
  JIT: 'Just-In-Time',
  AOT: 'Ahead-Of-Time',
  GC: 'Garbage Collector',
  LOH: 'Large Object Heap',
  POH: 'Pinned Object Heap',
  API: 'Application Programming Interface',
  SDK: 'Software Development Kit',
  IDE: 'Integrated Development Environment',
  CPU: 'Central Processing Unit',
  RAM: 'Random Access Memory',
  UI: 'User Interface',
  JSON: 'JavaScript Object Notation',
  XML: 'Extensible Markup Language',
  SQL: 'Structured Query Language',
  HTTP: 'Hypertext Transfer Protocol',
  HTTPS: 'Hypertext Transfer Protocol Secure',
  URL: 'Uniform Resource Locator',
  URI: 'Uniform Resource Identifier',
  DTO: 'Data Transfer Object',
  NRT: 'Nullable Reference Types',
  LINQ: 'Language Integrated Query',
  PLINQ: 'Parallel Language Integrated Query',
  FIFO: 'First In, First Out',
  LIFO: 'Last In, First Out',
  TAP: 'Task-based Asynchronous Pattern',
  CAS: 'Compare-And-Swap',
  DI: 'Dependency Injection',
  EF: 'Entity Framework',
  CQRS: 'Command Query Responsibility Segregation',
  SRP: 'Single Responsibility Principle',
  OCP: 'Open/Closed Principle',
  LSP: 'Liskov Substitution Principle',
  ISP: 'Interface Segregation Principle',
  DIP: 'Dependency Inversion Principle',
  SOLID:
    'Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion',
  EOF: 'End Of File',
  CSS: 'Cascading Style Sheets',
  DLL: 'Dynamic Link Library',
  ABA: 'A to B to A',
  XP: 'Experience Points',
  TODO: 'To Do',
};
const abbreviationPattern = new RegExp(
  `(?<![A-Za-z0-9_./])(${Object.keys(abbreviations).join('|')})(?![A-Za-z0-9_]|\\.[A-Za-z_])`,
  'g',
);
export function expandAbbreviations(text: string): string {
  return text.replace(abbreviationPattern, (term: string, _match: string, offset: number) => {
    const full = abbreviations[term];
    const following = text.slice(offset + term.length).match(/^\s*\(([^()]*)\)/)?.[1];
    const preceding = text.slice(0, offset).trimEnd();
    if (following?.toLowerCase() === full.toLowerCase() || preceding.endsWith(`${full} -`))
      return term;
    return `${term} (${full})`;
  });
}
const phrases: [string, string][] = [
  ['ادعا درست است', 'آره، درسته'],
  ['ادعا نادرست است', 'نه، درست نیست'],
  ['زمان باقی‌مانده:', 'وقت باقی‌مونده:'],
  ['هر اتاق، یک قدم تا تسلط بر C#', 'هر اتاق، یه قدم برای بهتر شدن تو C#'],
  ['پیشرفتت همراه حساب تو می‌ماند', 'پیشرفتت توی حسابت می‌مونه'],
  [
    'هر مفهوم یک چالش تازه است. قدم‌به‌قدم یاد بگیر و مسیر قهرمان خودت را بساز.',
    'هر چیزی که یاد می‌گیری، یه چالش تازه داره. قدم‌به‌قدم جلو برو و داستان قهرمان خودت رو بساز.',
  ],
  ['منابع رسمی و مطالعهٔ بیشتر', 'دوست داری بیشتر بدونی؟ این منابع رو ببین'],
  ['خروجی مورد انتظار پس از پیاده‌سازی:', 'وقتی کارت تموم شد، باید این خروجی رو ببینی:'],
  ['نمایش پاسخ مرجع برای مقایسه', 'جوابت رو با این راه‌حل مقایسه کن'],
  ['کد دلخواه در سرور بازی اجرا نمی‌شود.', 'کدی که می‌نویسی روی سرور بازی اجرا نمی‌شه.'],
  ['تنظیمات روی همین مرورگر نگهداری می‌شوند.', 'این تنظیمات توی همین مرورگرت ذخیره می‌شن.'],
  ['در حال بررسی نشست…', 'داریم حسابت رو چک می‌کنیم…'],
  ['درخواست انجام نشد.', 'این بار نشد؛ دوباره امتحان کن.'],
  ['ارتباط برقرار نشد.', 'ارتباط قطع شد؛ دوباره امتحان کن.'],
  ['ابتدا اتاق قبلی را کامل کن.', 'اول اتاق قبلی رو تموم کن، بعد بیا سراغ این یکی.'],
];
const words: [string, string][] = [
  ['کدام', 'کدوم'],
  ['چگونه', 'چطور'],
  ['چه چیزی', 'چی'],
  ['آیا', 'به‌نظرت'],
  ['بله', 'آره'],
  ['خیر', 'نه'],
  ['نمی‌شوند', 'نمی‌شن'],
  ['می‌شوند', 'می‌شن'],
  ['نمی‌کنند', 'نمی‌کنن'],
  ['می‌کنند', 'می‌کنن'],
  ['نمی‌شود', 'نمی‌شه'],
  ['می‌شود', 'می‌شه'],
  ['نمی‌کند', 'نمی‌کنه'],
  ['می‌کند', 'می‌کنه'],
  ['نمی‌تواند', 'نمی‌تونه'],
  ['می‌تواند', 'می‌تونه'],
  ['نمی‌توان', 'نمی‌تونی'],
  ['می‌توان', 'می‌تونی'],
  ['نمی‌سازد', 'نمی‌سازه'],
  ['می‌سازد', 'می‌سازه'],
  ['نمی‌دهد', 'نمی‌ده'],
  ['می‌دهد', 'می‌ده'],
  ['ندارد', 'نداره'],
  ['دارد', 'داره'],
  ['ندارند', 'ندارن'],
  ['دارند', 'دارن'],
  ['می‌ماند', 'می‌مونه'],
  ['نمی‌گیرد', 'نمی‌گیره'],
  ['می‌گیرد', 'می‌گیره'],
  ['می‌رود', 'می‌ره'],
  ['می‌بیند', 'می‌بینه'],
  ['می‌خواهی', 'می‌خوای'],
  ['می‌توانید', 'می‌تونی'],
  ['می‌خواهید', 'می‌خوای'],
  ['باشند', 'باشن'],
  ['باشد', 'باشه'],
  ['آن‌ها', 'اون‌ها'],
  ['همان', 'همون'],
  ['آن', 'اون'],
  ['را', 'رو'],
  ['اگر', 'اگه'],
  ['شما', 'تو'],
  ['خودتان', 'خودت'],
  ['زیرا', 'چون'],
  ['ابتدا', 'اول'],
  ['سپس', 'بعد'],
  ['بنابراین', 'پس'],
  ['پس از', 'بعد از'],
  ['پیش از', 'قبل از'],
  ['است', 'هست'],
];
export function friendlyPersian(text: string): string {
  text = expandAbbreviations(text);
  if (!/[\u0600-\u06ff]/.test(text)) return text;
  for (const [from, to] of phrases) text = text.replaceAll(from, to);
  for (const [from, to] of words)
    text = text.replace(
      new RegExp('(?<![\\p{L}\\p{N}_])' + from + '(?![\\p{L}\\p{N}_])', 'gu'),
      to,
    );
  return text;
}
const excluded =
  'script,style,textarea,input,pre,code,bdi,[dir="ltr"],[contenteditable],.code-preview,.brand,.identity strong,#welcome-identity strong,[data-player-name]';
export function bindPersianCopy(root: HTMLElement): () => void {
  const update = (node: Node) => {
    if (!root.contains(node)) return;
    if (
      node.nodeType !== Node.TEXT_NODE ||
      !node.parentElement ||
      node.parentElement.closest(excluded)
    )
      return;
    const raw = node.textContent ?? '';
    const text = friendlyPersian(raw);
    const tokens =
      /[A-Z][A-Z0-9]*[ \t]+\([A-Za-z][A-Za-z0-9,/:& \-]*\)|\([A-Za-z.][A-Za-z0-9_@#+./<>()\[\],?:=& \-]*\)|(?:[0-9]+[ \t]+)?(?:\.[A-Za-z]|[A-Za-z])[A-Za-z0-9_@#+./<>\[\],?:=-]*(?:\([A-Za-z0-9_., ?<>]*\))?(?:[ \t]+(?:&[ \t]+)?[A-Za-z0-9_@#+./<>\[\],?:=-]+)*/g;
    const matches = [...text.matchAll(tokens)];
    if (!matches.length) {
      if (text !== raw) node.textContent = text;
      return;
    }
    const fragment = document.createDocumentFragment();
    let index = 0;
    for (const match of matches) {
      fragment.append(document.createTextNode(text.slice(index, match.index)));
      const bdi = document.createElement('bdi');
      bdi.dir = 'ltr';
      bdi.textContent = match[0];
      fragment.append(bdi);
      index = match.index! + match[0].length;
    }
    fragment.append(document.createTextNode(text.slice(index)));
    node.parentNode!.replaceChild(fragment, node);
  };
  const scan = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      update(node);
      return;
    }
    if (node instanceof Element) {
      for (const element of [node, ...node.querySelectorAll('[title],[aria-label]')]) {
        if (element.closest(excluded)) continue;
        for (const name of ['title', 'aria-label']) {
          const original = element.getAttribute(name);
          if (original === null) continue;
          const expanded = expandAbbreviations(original);
          if (expanded !== original) element.setAttribute(name, expanded);
        }
      }
    }
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    const texts: Node[] = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    texts.forEach(update);
  };
  scan(root);
  const observer = new MutationObserver((records) => {
    observer.disconnect();
    for (const record of records) {
      if (record.type === 'characterData') update(record.target);
      else if (record.type === 'attributes') scan(record.target);
      else record.addedNodes.forEach(scan);
    }
    observe();
  });
  const observe = () =>
    observer.observe(root, {
      childList: true,
      characterData: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['title', 'aria-label'],
    });
  observe();
  return () => observer.disconnect();
}
