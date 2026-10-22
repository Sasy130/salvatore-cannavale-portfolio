export const CONTACT_EMAIL = 'sasycannavale1999@gmail.com';

/** Compose a local mail draft; no project information is sent to a server. */
export function buildBriefMailto({ name = '', service = '', message = '' } = {}) {
  const sender = String(name).trim().slice(0, 100);
  const project = String(service).trim().slice(0, 200);
  const description = String(message).trim().slice(0, 3000);
  const subject = `Un nuovo progetto — ${sender.replace(/[\r\n]+/g, ' ')}`;
  const body = `Ciao ONE MAN,\n\nSono ${sender}.\nVorrei creare: ${project}.\n\n${description}\n\nA presto,\n${sender}`;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function startPortfolio() {
  const root = document.documentElement;
  const body = document.body;
  const hero = document.querySelector('.hero');
  const header = document.querySelector('.site-header');
  const canvas = document.querySelector('#sculpture');
  const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fineQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  let reduced = reducedQuery.matches;
  let sculpture = null;
  let sculptureReady = false;
  let currentMode = 'flow';
  let currentProgress = 0;
  let scrollFrame = 0;
  let pointerFrame = 0;
  let disposed = false;
  body.classList.add('js-enabled');

  // The introduction is time bounded even when WebGL or a network request fails.
  const intro = document.querySelector('#intro');
  const counter = document.querySelector('#intro-count');
  const introStart = performance.now();
  let introClosing = false;
  let introFrame = 0;
  let introTimer = 0;
  const finishIntro = () => {
    if (introClosing) return;
    introClosing = true;
    cancelAnimationFrame(introFrame);
    if (counter) counter.textContent = '100';
    intro?.classList.add('is-exiting');
    body.classList.add('is-ready');
    window.setTimeout(() => {
      body.classList.add('intro-done');
      clearTimeout(introTimer);
    }, reduced ? 0 : 420);
  };
  const animateIntro = now => {
    const elapsed = now - introStart;
    const progress = clamp(elapsed / 1450);
    const eased = 1 - Math.pow(1 - progress, 2.3);
    if (counter) counter.textContent = String(Math.round(eased * 100)).padStart(2, '0');
    if (elapsed >= 1450 && (sculptureReady || elapsed >= 1950)) finishIntro();
    else introFrame = requestAnimationFrame(animateIntro);
  };
  if (reduced) finishIntro();
  else {
    introFrame = requestAnimationFrame(animateIntro);
    introTimer = window.setTimeout(finishIntro, 2150);
  }

  const modeButtons = [...document.querySelectorAll('[data-mode]')];
  for (const button of modeButtons) {
    button.addEventListener('click', () => {
      currentMode = button.dataset.mode;
      for (const item of modeButtons) item.setAttribute('aria-pressed', String(item === button));
      sculpture?.setMode(currentMode);
    });
  }

  const loadSculpture = async () => {
    if (!canvas) return;
    try {
      const { createSculpture } = await import('./sculpture.js');
      if (disposed) return;
      sculpture = createSculpture(canvas, {
        reduced,
        onReady: () => {
          sculptureReady = true;
          body.classList.add('sculpture-ready');
          body.classList.remove('no-webgl');
          for (const button of modeButtons) button.disabled = false;
        }
      });
      sculpture.setMode(currentMode);
      sculpture.setProgress(currentProgress);
    } catch (error) {
      body.classList.add('no-webgl');
      for (const button of modeButtons) {
        button.disabled = true;
        button.title = 'La modalità 3D non è disponibile su questo dispositivo.';
      }
      console.warn('La scultura 3D non è disponibile su questo dispositivo.', error);
    }
  };
  loadSculpture();

  const track = document.querySelector('.motion-track');
  const motionBand = document.querySelector('.motion-band');
  const updateScroll = () => {
    scrollFrame = 0;
    const y = window.scrollY || 0;
    const total = Math.max(1, root.scrollHeight - window.innerHeight);
    root.style.setProperty('--scroll-progress', clamp(y / total).toFixed(5));
    header?.classList.toggle('is-scrolled', y > 32);
    if (hero) {
      const rect = hero.getBoundingClientRect();
      currentProgress = reduced ? 0 : clamp(-rect.top / Math.max(1, rect.height));
      hero.style.setProperty('--hero-progress', currentProgress.toFixed(5));
      sculpture?.setProgress(currentProgress);
    }
    if (track && motionBand) {
      const rect = motionBand.getBoundingClientRect();
      const progress = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height));
      track.style.setProperty('--marquee-x', `${reduced ? 0 : -progress * (window.innerWidth < 600 ? 230 : 440)}px`);
    }
  };
  const queueScroll = () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
  };
  window.addEventListener('scroll', queueScroll, { passive: true });
  window.addEventListener('resize', queueScroll, { passive: true });
  updateScroll();
  document.fonts?.ready.then(queueScroll);

  const reveals = [...document.querySelectorAll('[data-reveal]')];
  if (reduced || !('IntersectionObserver' in window)) {
    for (const item of reveals) item.classList.add('is-visible');
  } else {
    const revealObserver = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }, { threshold: .12, rootMargin: '0px 0px -24px 0px' });
    for (const item of reveals) revealObserver.observe(item);
  }

  const navLinks = [...document.querySelectorAll('[data-nav]')];
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const link of navLinks) {
          if (link.dataset.nav === entry.target.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        }
      }
    }, { rootMargin: '-15% 0px -55% 0px', threshold: 0 });
    for (const id of ['top', 'work', 'approach', 'contact']) {
      const section = document.getElementById(id);
      if (section) navObserver.observe(section);
    }
  }

  // Keep the native pointer, adding a small contextual label only to project cards.
  const cursor = document.querySelector('#cursor-label');
  let activeCard = null;
  let cursorX = 0;
  let cursorY = 0;
  const hideCursor = () => {
    cursor?.classList.remove('is-visible');
    if (activeCard) {
      activeCard.classList.remove('is-hovered');
      activeCard.style.setProperty('--tilt-x', '0deg');
      activeCard.style.setProperty('--tilt-y', '0deg');
    }
    activeCard = null;
  };
  const paintPointer = () => {
    pointerFrame = 0;
    if (!activeCard || !fineQuery.matches || !cursor) return;
    const width = cursor.offsetWidth || 120;
    const height = cursor.offsetHeight || 40;
    const x = Math.min(cursorX + 18, window.innerWidth - width - 10);
    const y = Math.min(cursorY + 18, window.innerHeight - height - 10);
    cursor.style.transform = `translate3d(${Math.max(8, x)}px,${Math.max(8, y)}px,0)`;
    cursor.classList.add('is-visible');
  };
  for (const card of document.querySelectorAll('[data-cursor]')) {
    card.addEventListener('pointermove', event => {
      if (!fineQuery.matches || event.pointerType === 'touch') return;
      activeCard = card;
      cursorX = event.clientX;
      cursorY = event.clientY;
      if (cursor) cursor.textContent = card.dataset.cursor;
      card.classList.add('is-hovered');
      if (!reduced) {
        const rect = card.getBoundingClientRect();
        const x = clamp((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = clamp((event.clientY - rect.top) / rect.height) * 2 - 1;
        card.style.setProperty('--tilt-x', `${(-y * 1.6).toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${(x * 1.8).toFixed(2)}deg`);
      }
      if (!pointerFrame) pointerFrame = requestAnimationFrame(paintPointer);
    });
    card.addEventListener('pointerleave', hideCursor);
    card.addEventListener('blur', hideCursor);
  }
  hero?.addEventListener('pointermove', event => {
    if (!fineQuery.matches || event.pointerType === 'touch' || reduced) return;
    const rect = hero.getBoundingClientRect();
    const x = clamp((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = clamp((event.clientY - rect.top) / rect.height) * 2 - 1;
    hero.style.setProperty('--pointer-x', x.toFixed(4));
    hero.style.setProperty('--pointer-y', y.toFixed(4));
    sculpture?.setPointer(x, y);
  });
  hero?.addEventListener('pointerleave', () => {
    hero.style.setProperty('--pointer-x', '0');
    hero.style.setProperty('--pointer-y', '0');
    sculpture?.setPointer(0, 0);
  });
  window.addEventListener('blur', hideCursor);

  const main = document.querySelector('main');
  const menu = document.querySelector('#mobile-menu');
  const menuButton = document.querySelector('#menu-toggle');
  const setMenu = (open, restoreFocus = false) => {
    body.classList.toggle('menu-open', open);
    menuButton?.setAttribute('aria-expanded', String(open));
    if (menu) menu.inert = !open;
    if (main) main.inert = open;
    hideCursor();
    if (open) menu?.querySelector('a')?.focus({ preventScroll: true });
    else if (restoreFocus) menuButton?.focus({ preventScroll: true });
  };
  menuButton?.addEventListener('click', () => setMenu(!body.classList.contains('menu-open'), true));
  document.querySelector('.brand')?.addEventListener('click', () => setMenu(false));
  for (const link of menu?.querySelectorAll('a') || []) link.addEventListener('click', () => setMenu(false));
  document.addEventListener('keydown', event => {
    if (!body.classList.contains('menu-open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setMenu(false, true);
    } else if (event.key === 'Tab') {
      const items = [menuButton, ...menu.querySelectorAll('a, button')].filter(Boolean);
      const index = items.indexOf(document.activeElement);
      if (event.shiftKey && index <= 0) {
        event.preventDefault(); items.at(-1)?.focus();
      } else if (!event.shiftKey && index === items.length - 1) {
        event.preventDefault(); items[0]?.focus();
      }
    }
  });
  const wideQuery = window.matchMedia('(min-width: 901px)');
  wideQuery.addEventListener('change', event => {
    if (event.matches && body.classList.contains('menu-open')) setMenu(false);
  });

  const dialogs = [...document.querySelectorAll('dialog')];
  const dialogTriggers = new WeakMap();
  const openDialog = (id, trigger) => {
    const dialog = document.getElementById(id);
    if (!dialog || dialog.open) return;
    setMenu(false);
    hideCursor();
    dialogTriggers.set(dialog, trigger || document.activeElement);
    dialog.scrollTop = 0;
    dialog.showModal();
    body.classList.add('dialog-open');
    requestAnimationFrame(() => dialog.querySelector('[data-close-dialog]')?.focus({ preventScroll: true }));
  };
  document.querySelector('#open-case')?.addEventListener('click', event => openDialog('case-dialog', event.currentTarget));
  document.querySelector('#open-vanta-case')?.addEventListener('click', event => openDialog('vanta-case-dialog', event.currentTarget));
  for (const button of document.querySelectorAll('[data-open-brief]')) {
    button.addEventListener('click', event => openDialog('brief-dialog', event.currentTarget));
  }
  for (const button of document.querySelectorAll('[data-close-dialog]')) {
    button.addEventListener('click', () => document.getElementById(button.dataset.closeDialog)?.close());
  }
  for (const dialog of dialogs) {
    let pointerBeganOutside = false;
    const outside = event => {
      const rect = dialog.getBoundingClientRect();
      return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    };
    dialog.addEventListener('pointerdown', event => { pointerBeganOutside = event.target === dialog && outside(event); });
    dialog.addEventListener('click', event => {
      if (event.target === dialog && pointerBeganOutside && outside(event)) dialog.close();
      pointerBeganOutside = false;
    });
    dialog.addEventListener('close', () => {
      body.classList.toggle('dialog-open', dialogs.some(item => item.open));
      const trigger = dialogTriggers.get(dialog);
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    });
  }

  // Native details remain fully usable with JavaScript disabled.
  const services = [...document.querySelectorAll('.service-list details')];
  for (const item of services) item.addEventListener('toggle', () => {
    if (item.open) for (const other of services) if (other !== item) other.open = false;
  });

  const toast = document.querySelector('#toast');
  let toastTimer = 0;
  const announce = message => {
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 4800);
  };
  const fallbackCopy = text => {
    const previous = document.activeElement;
    const field = document.createElement('textarea');
    field.value = text;
    field.readOnly = true;
    field.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;';
    document.body.append(field);
    field.select();
    let result = false;
    try { result = document.execCommand('copy'); } catch { /* Show the address below. */ }
    field.remove();
    previous?.focus({ preventScroll: true });
    return result;
  };
  document.querySelector('#copy-email')?.addEventListener('click', async () => {
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(CONTACT_EMAIL);
        copied = true;
      }
    } catch { /* Local clipboard fallback also works without a secure origin. */ }
    if (!copied) copied = fallbackCopy(CONTACT_EMAIL);
    announce(copied ? 'Indirizzo email copiato.' : `Copia questo indirizzo: ${CONTACT_EMAIL}`);
  });

  document.querySelector('#brief-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const fields = Object.fromEntries(new FormData(form).entries());
    if (!String(fields.name || '').trim() || !String(fields.message || '').trim()) {
      const empty = !String(fields.name || '').trim() ? form.elements.name : form.elements.message;
      empty.setCustomValidity('Scrivi qualche parola prima di continuare.');
      empty.reportValidity();
      empty.addEventListener('input', () => empty.setCustomValidity(''), { once: true });
      return;
    }
    const draft = buildBriefMailto(fields);
    const note = form.querySelector('.form-note');
    if (note) {
      note.setAttribute('role', 'status');
      note.textContent = 'Bozza preparata. Completa l’invio nella tua app email. Se non si apre, usa l’indirizzo qui sotto.';
    }
    try { window.location.href = draft; }
    catch { /* The direct email link remains available if external apps are blocked. */ }
    announce('Bozza preparata. Completa l’invio nella tua app email.');
  });

  reducedQuery.addEventListener('change', event => {
    reduced = event.matches;
    if (reduced) {
      finishIntro();
      for (const item of reveals) item.classList.add('is-visible');
      hideCursor();
    }
    sculpture?.dispose();
    sculpture = null;
    sculptureReady = false;
    body.classList.remove('sculpture-ready');
    loadSculpture();
    queueScroll();
  });

  window.addEventListener('pagehide', event => {
    hideCursor();
    if (!event.persisted) {
      disposed = true;
      sculpture?.dispose();
      cancelAnimationFrame(scrollFrame);
      cancelAnimationFrame(pointerFrame);
      cancelAnimationFrame(introFrame);
      clearTimeout(introTimer);
      clearTimeout(toastTimer);
    }
  });
  window.addEventListener('pageshow', queueScroll);
}

if (typeof document !== 'undefined') startPortfolio();
