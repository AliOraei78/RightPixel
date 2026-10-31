// Native columns paginate flowing text without shrinking it or adding nested scrollbars.
export function mountReadingPanel(
  body: HTMLElement,
  footer: HTMLElement,
  initialPage = 0,
  savePage: (page: number) => void = () => {},
) {
  const pages = document.createElement('div');
  pages.className = 'reading-pages';
  pages.append(...body.childNodes);
  body.append(pages);
  const continuous = !!body.closest('.npc-speech');
  body.classList.toggle('continuous-reading', continuous);
  const nav = document.createElement('div');
  nav.className = 'reading-navigation';
  const previous = document.createElement('button');
  const next = document.createElement('button');
  const count = document.createElement('span');
  previous.type = next.type = 'button';
  previous.textContent = 'قبلی';
  next.textContent = 'بعدی';
  count.setAttribute('aria-live', 'polite');
  nav.append(previous, count, next);
  footer.before(nav);
  let page = Number.isInteger(initialPage) ? Math.max(0, initialPage) : 0,
    total = 1,
    frame = 0;
  let pendingPage: number | undefined = page;
  let dialogueIndex = pages.querySelector<HTMLElement>('.dialogue-bubble')?.dataset.dialogueIndex;
  function update() {
    const width = body.clientWidth;
    if (!width) return;
    if (continuous) {
      nav.hidden = true;
      if (pendingPage !== undefined && !pages.querySelector('[aria-busy="true"]')) {
        body.scrollTop = pendingPage * body.clientHeight;
        pendingPage = undefined;
      }
      return;
    }
    pages.style.width = `${width}px`;
    total = Math.max(1, Math.round((pages.scrollWidth + 24) / (width + 24)));
    const typing = pages.querySelector('[aria-busy="true"]');
    if (pendingPage !== undefined) {
      page = Math.min(pendingPage, total - 1);
      if (!typing) pendingPage = undefined;
    } else page = Math.min(page, total - 1);
    pages.style.transform = `translateX(${page * (width + 24)}px)`;
    previous.disabled = page === 0;
    next.disabled = page === total - 1;
    count.textContent = `${page + 1} / ${total}`;
    nav.hidden = total === 1;
    pages.inert = false;
  }
  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
  };
  previous.onclick = () => {
    pendingPage = undefined;
    page = Math.max(0, page - 1);
    savePage(page);
    update();
  };
  next.onclick = () => {
    pendingPage = undefined;
    page = Math.min(total - 1, page + 1);
    savePage(page);
    update();
  };
  // Keyboard focus must reveal the column containing the focused control.
  pages.addEventListener('focusin', (event) => {
    if (continuous) return;
    body.scrollLeft = 0;
    update();
    const target = event.target as HTMLElement;
    const box = target.getBoundingClientRect(),
      viewport = body.getBoundingClientRect();
    if (box.left < viewport.left || box.right > viewport.right) {
      pendingPage = undefined;
      page = Math.max(
        0,
        Math.min(
          total - 1,
          page + Math.round((viewport.right - box.right) / (body.clientWidth + 24)),
        ),
      );
      update();
    }
  });
  const observer = new MutationObserver(() => {
    const index = pages.querySelector<HTMLElement>('.dialogue-bubble')?.dataset.dialogueIndex;
    if (index !== dialogueIndex) {
      dialogueIndex = index;
      pendingPage = undefined;
      page = 0;
      body.scrollTop = 0;
    }
    schedule();
  });
  observer.observe(pages, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['aria-busy', 'data-dialogue-index'],
  });
  body.addEventListener('scroll', () => {
    if (!continuous || pendingPage !== undefined) return;
    const current = Math.floor(body.scrollTop / Math.max(1, body.clientHeight));
    if (current !== page) {
      page = current;
      savePage(page);
    }
  });
  const additions = new MutationObserver(() => {
    for (const child of [...body.childNodes]) if (child !== pages) pages.append(child);
    schedule();
  });
  additions.observe(body, { childList: true });
  const size = new ResizeObserver(schedule);
  size.observe(body);
  void document.fonts.ready.then(schedule);
  schedule();
  return {
    pages,
    advance() {
      if (continuous) return false;
      update();
      if (page + 1 >= total) return false;
      pendingPage = undefined;
      page++;
      savePage(page);
      update();
      return true;
    },
    reset() {
      pendingPage = undefined;
      page = 0;
      body.scrollTop = 0;
      schedule();
    },
    dispose() {
      observer.disconnect();
      additions.disconnect();
      size.disconnect();
      cancelAnimationFrame(frame);
    },
  };
}

export function openCodeView(content: HTMLElement, label: string, notices: HTMLElement[] = []) {
  const dialog = document.createElement('dialog');
  dialog.className = 'code-view';
  const header = document.createElement('header');
  const title = document.createElement('strong');
  title.textContent = label;
  dialog.setAttribute('aria-label', label);
  const noticeSlots = notices.map((notice) => {
    const slot = document.createComment('notice location');
    notice.before(slot);
    header.append(notice);
    return { notice, slot };
  });
  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = 'بستن';
  close.onclick = () => dialog.close();
  header.append(title, close);
  const slot = document.createComment('code location');
  content.before(slot);
  const viewport = document.createElement('div');
  viewport.className = 'code-view-content';
  viewport.append(content);
  dialog.append(header, viewport);
  document.body.append(dialog);
  dialog.addEventListener(
    'close',
    () => {
      slot.replaceWith(content);
      for (const { notice, slot } of noticeSlots) slot.replaceWith(notice);
      dialog.remove();
    },
    { once: true },
  );
  dialog.showModal();
}
