import { projects } from './projects-data.js';

// The roulette presents only the original portfolio projects. Redesign proposals
// remain on their separate page and never enter this selection.
const featured = [
  { name: 'VELMORA', mood: 'sea', category: 'Immersive experience', description: 'Uno yacht da esplorare, un mondo da immaginare.', image: '/one-man/assets/velmora.jpg', url: '/velmora/index.html' },
  { name: 'VANTA', mood: 'asphalt', category: 'Automotive experience', description: 'Un’altra idea di noleggio premium, da vivere in prima persona.', image: '/one-man/assets/vanta.jpg', url: '/vanta/index.html' },
  { name: 'LUNÉA', mood: 'rose', category: 'Jewelry experience', description: 'Un atelier digitale dove ogni dettaglio prende forma.', image: '/projects/lunea.jpg', url: '/lunea/index.html' },
];
const worlds = [...featured, ...projects.filter(project => project.kind !== 'redesign')];
const section = document.querySelector('#project-roulette');
if (section && worlds.length) {
  const stage = section.querySelector('#arcade-stage');
  const machine = section.querySelector('#arcade-machine');
  const image = section.querySelector('#arcade-image');
  const backOne = section.querySelector('#arcade-back-one');
  const backTwo = section.querySelector('#arcade-back-two');
  const title = section.querySelector('#arcade-name');
  const category = section.querySelector('#arcade-category');
  const number = section.querySelector('#arcade-number');
  const description = section.querySelector('#arcade-description');
  const open = section.querySelector('#arcade-open');
  const status = section.querySelector('#arcade-status');
  const dots = section.querySelector('#arcade-dots');
  const spin = section.querySelector('#arcade-spin');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const pointerFine = matchMedia('(hover: hover) and (pointer: fine)');
  let current = 0, animation = 0, busy = false, touchStart = null, pointerFrame = 0, swiped = false, imageToken = 0;
  const imageCache = new Map();
  const categoryMood = { Luxury: 'sea', Automotive: 'asphalt', Food: 'olive', Sport: 'asphalt', Lifestyle: 'rose', Esperienze: 'sea' };
  function prepareImage(src) {
    if (!imageCache.has(src)) {
      const candidate = new Image(); candidate.src = src;
      imageCache.set(src, candidate.decode().catch(() => {}));
    }
    return imageCache.get(src);
  }
  function showImage(world) {
    const token = ++imageToken;
    if (image.getAttribute('src') === world.image) { image.alt = `Anteprima del progetto ${world.name}`; return; }
    prepareImage(world.image).then(() => {
      if (token !== imageToken) return;
      const previous = image.cloneNode(false);
      previous.removeAttribute('id'); previous.alt = ''; previous.setAttribute('aria-hidden', 'true');
      previous.className = 'arcade-transition-image';
      if (!reduceMotion.matches && typeof previous.animate === 'function') {
        open.querySelectorAll('.arcade-transition-image').forEach(item => item.remove());
        open.append(previous);
        const outgoing = previous.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.045)' }], { duration: 760, easing: 'cubic-bezier(.22,1,.36,1)' });
        outgoing.finished.then(() => previous.remove(), () => previous.remove());
      }
      image.src = world.image; image.alt = `Anteprima del progetto ${world.name}`;
      if (!reduceMotion.matches && typeof image.animate === 'function') {
        image.getAnimations().forEach(item => item.cancel());
        image.animate([{ transform: 'scale(1.055)' }, { transform: 'scale(1)' }], { duration: 900, easing: 'cubic-bezier(.16,1,.3,1)' });
      }
    });
  }
  const wrap = n => (n + worlds.length) % worlds.length;
  const indicatorButtons = worlds.map((world, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'arcade-dot';
    button.setAttribute('aria-label', `Seleziona ${world.name}`);
    button.addEventListener('click', () => choose(index));
    dots.append(button);
    return button;
  });
  function display(index, announce = true) {
    current = wrap(index);
    const world = worlds[current], one = worlds[wrap(current + 1)], two = worlds[wrap(current + 2)];
    showImage(world);
    backOne.src = one.image; backTwo.src = two.image;
    machine.dataset.world = world.mood || categoryMood[world.category] || 'asphalt';
    if (section.classList.contains('is-active')) { prepareImage(one.image); prepareImage(two.image); }
    title.textContent = world.name;
    description.textContent = world.description;
    category.textContent = `${String(current + 1).padStart(2, '0')} / ${world.category.toLocaleUpperCase('it-IT')}`;
    number.textContent = String(current + 1).padStart(2, '0');
    open.href = world.url;
    open.setAttribute('aria-label', `Apri la demo ${world.name} in una nuova scheda`);
    indicatorButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === current)));
    if (announce) status.textContent = `${world.name}, progetto ${current + 1} di ${worlds.length}.`;
  }
  function animateChange() {
    if (reduceMotion.matches || typeof title.animate !== 'function') return;
    for (const item of [title, category, description, number]) {
      item.getAnimations().forEach(animation => animation.cancel());
      item.animate([{ opacity: .35, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 620, easing: 'cubic-bezier(.16,1,.3,1)' });
    }
  }
  function choose(index) {
    if (busy) return;
    display(index); animateChange();
  }
  section.querySelector('#arcade-prev').addEventListener('click', () => choose(current - 1));
  section.querySelector('#arcade-next').addEventListener('click', () => choose(current + 1));
  spin.addEventListener('click', () => {
    if (busy) return;
    const step = 1 + Math.floor(Math.random() * (worlds.length - 1));
    const target = wrap(current + step);
    if (reduceMotion.matches) { display(target); return; }
    busy = true;
    machine.classList.add('is-spinning');
    spin.setAttribute('aria-busy', 'true');
    status.textContent = 'La roulette sta scegliendo un progetto.';
    let turns = 0;
    const advance = () => {
      turns += 1;
      display(turns === 3 ? target : current + 1, turns === 3);
      animateChange();
      if (turns < 3) animation = window.setTimeout(advance, 360);
      else { busy = false; machine.classList.remove('is-spinning'); spin.removeAttribute('aria-busy'); }
    };
    animation = window.setTimeout(advance, 220);
  });
  stage.addEventListener('touchstart', event => {
    if (event.touches.length === 1) touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });
  stage.addEventListener('touchend', event => {
    if (!touchStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) { swiped = true; choose(current + (dx < 0 ? 1 : -1)); window.setTimeout(() => { swiped = false; }, 450); }
    touchStart = null;
  }, { passive: true });
  open.addEventListener('click', event => { if (swiped) { event.preventDefault(); swiped = false; } });
  machine.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); choose(current + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  stage.addEventListener('pointermove', event => {
    if (!pointerFine.matches || reduceMotion.matches || event.pointerType === 'touch' || pointerFrame) return;
    const rect = stage.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
    const y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
    pointerFrame = requestAnimationFrame(() => {
      stage.style.setProperty('--arcade-x', `${(x * 3).toFixed(2)}deg`);
      stage.style.setProperty('--arcade-y', `${(-y * 3).toFixed(2)}deg`);
      pointerFrame = 0;
    });
  });
  stage.addEventListener('pointerleave', () => { stage.style.setProperty('--arcade-x', '0deg'); stage.style.setProperty('--arcade-y', '0deg'); });
  const stopSpin = () => {
    clearTimeout(animation); busy = false; machine.classList.remove('is-spinning'); spin.removeAttribute('aria-busy');
  };
  window.addEventListener('pagehide', () => { stopSpin(); cancelAnimationFrame(pointerFrame); pointerFrame = 0; });
  display(0, false);
  section.hidden = false;
  document.querySelector('.hero-discover')?.setAttribute('href', '#project-roulette');
  if (reduceMotion.matches || !('IntersectionObserver' in window)) section.classList.add('is-visible');
  else {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { section.classList.add('is-visible'); observer.disconnect(); }
    }, { threshold: .08 });
    observer.observe(section);
  }
  // Decorative orbital motion only runs while the roulette is on screen.
  if ('IntersectionObserver' in window) {
    const activeObserver = new IntersectionObserver(entries => {
      const active = entries.some(entry => entry.isIntersecting);
      section.classList.toggle('is-active', active);
      if (active) { prepareImage(worlds[wrap(current + 1)].image); prepareImage(worlds[wrap(current + 2)].image); }
    }, { threshold: .05 });
    activeObserver.observe(section);
  }
  reduceMotion.addEventListener('change', event => {
    if (event.matches) {
      section.classList.add('is-visible'); stopSpin();
      for (const item of [title, category, description, number, image]) item.getAnimations?.().forEach(animation => animation.cancel());
      open.querySelectorAll('.arcade-transition-image').forEach(item => item.remove());
      status.textContent = `${worlds[current].name}, progetto ${current + 1} di ${worlds.length}.`;
    }
  });
}

// One restrained curtain transition for each featured case; native links stay usable.
const projectMotion = matchMedia('(prefers-reduced-motion: reduce)');
const featureFrames = [...document.querySelectorAll('.project-visual')];
if (!projectMotion.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('motion-project-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: .12, rootMargin: '0px 0px -30px 0px' });
  for (const frame of featureFrames) { frame.classList.add('motion-project-reveal'); observer.observe(frame); }
  projectMotion.addEventListener('change', event => {
    if (event.matches) { observer.disconnect(); featureFrames.forEach(frame => frame.classList.add('motion-project-visible')); }
  });
}
