// Native-scroll presentation: no wheel interception, canvas, timers or animation loop at rest.
const story = document.querySelector('.scroll-story');
if (story) {
  const stage = story.querySelector('.story-stage');
  const panels = [...story.querySelectorAll('[data-story-panel]')];
  const chapters = [...story.querySelectorAll('[data-story-chapter]')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = value => Math.max(0, Math.min(1, value));
  const range = (value, from, to) => clamp((value - from) / (to - from));
  const ease = value => value * value * (3 - 2 * value);
  let frame = 0;
  let enabled = false;
  let active = -1;
  function paint() {
    frame = 0;
    if (!enabled) return;
    const rect = story.getBoundingClientRect();
    const progress = clamp(-rect.top / Math.max(1, rect.height - innerHeight));
    const enter = ease(range(progress, .14, .36));
    const leave = ease(range(progress, .54, .76));
    const out = ease(range(progress, 0, .30));
    stage.style.setProperty('--story-progress', progress.toFixed(4));
    stage.style.setProperty('--invite-opacity', (1 - ease(range(progress, .12, .27))).toFixed(4));
    stage.style.setProperty('--invite-scale', (1 + out * .24).toFixed(4));
    stage.style.setProperty('--invite-travel', `${-out * 12}vh`);
    stage.style.setProperty('--fragment-spread', `${out * 28}vw`);
    stage.style.setProperty('--orange-reveal', `${(1 - enter) * 100}%`);
    stage.style.setProperty('--impact-opacity', (enter * (1 - leave)).toFixed(4));
    stage.style.setProperty('--impact-scale', (1.12 - enter * .12 + leave * .15).toFixed(4));
    stage.style.setProperty('--impact-travel', `${(1 - enter) * 9 - leave * 10}vh`);
    stage.style.setProperty('--person-reveal', `${(1 - leave) * 100}%`);
    stage.style.setProperty('--person-travel', `${(1 - leave) * 8}vh`);
    const next = progress < .27 ? 0 : progress < .68 ? 1 : 2;
    if (next !== active) {
      active = next;
      panels.forEach((panel, index) => {
        panel.inert = index !== active;
        // Only the visible chapter may receive keyboard focus.
      });
      chapters.forEach((chapter, index) => chapter.classList.toggle('is-current', index === active));
      stage.dataset.chapter = String(active);
    }
  }
  function queue() { if (enabled && !frame) frame = requestAnimationFrame(paint); }
  function configure() {
    enabled = !motion.matches && CSS.supports('position', 'sticky');
    story.classList.toggle('is-enhanced', enabled);
    active = -1;
    if (enabled) paint();
    else {
      cancelAnimationFrame(frame); frame = 0;
      panels.forEach(panel => { panel.inert = false; });
    }
  }
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue, { passive: true });
  addEventListener('pageshow', queue);
  motion.addEventListener('change', configure);
  document.fonts?.ready.then(queue);
  // Focus navigation must never strand a keyboard user in an invisible chapter.
  story.addEventListener('focusin', event => {
    if (!enabled) return;
    const index = panels.findIndex(panel => panel.contains(event.target));
    if (index >= 0 && index !== active) {
      const rect = story.getBoundingClientRect();
      scrollTo({ top: scrollY + rect.top + (rect.height - innerHeight) * [0, .42, .84][index], behavior: 'instant' });
      paint();
    }
  });
  configure();
}
