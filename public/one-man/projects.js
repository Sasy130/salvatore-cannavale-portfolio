import { projects } from './projects-data.js';
const dialog = document.querySelector('#collection-dialog');
const cards = [...document.querySelectorAll('.library-card')];
const filters = [...document.querySelectorAll('[data-project-filter]')];
let trigger = null;
for (const button of filters) {
  button.addEventListener('click', () => {
    const category = button.dataset.projectFilter;
    let visible = 0;
    for (const card of cards) {
      card.hidden = category !== 'Tutti' && card.dataset.projectCategory !== category;
      if (!card.hidden) visible++;
    }
    for (const filter of filters) filter.setAttribute('aria-pressed', String(filter === button));
    document.querySelector('.library-results').textContent = `${visible} ${visible === 1 ? 'progetto da esplorare' : 'progetti da esplorare'}`;
    window.dispatchEvent(new Event('resize'));
  });
}
for (const button of document.querySelectorAll('[data-open-project]')) {
  button.addEventListener('click', () => {
    const project = projects.find(item => item.slug === button.dataset.openProject);
    if (!project || !dialog) return;
    trigger = button;
    document.querySelector('#collection-title').textContent = project.name;
    document.querySelector('#collection-category').textContent = `${project.category.toUpperCase()} / CONCEPT DIGITALE`;
    document.querySelector('#collection-subtitle').textContent = project.subtitle;
    document.querySelector('#collection-description').textContent = project.description;
    const image = document.querySelector('#collection-image');
    image.src = project.image;
    image.alt = project.alt;
    const tags = document.querySelector('#collection-tags');
    tags.replaceChildren(...project.tags.map(tag => { const item = document.createElement('span'); item.textContent = tag; return item; }));
    const link = document.querySelector('#collection-link');
    link.href = project.url;
    link.textContent = project.access === 'public' ? 'APRI LA DEMO' : 'DEMO RISERVATA';
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    arrow.setAttribute('viewBox', '0 0 24 24'); arrow.setAttribute('aria-hidden', 'true'); arrow.setAttribute('fill', 'none'); arrow.setAttribute('stroke', 'currentColor'); arrow.setAttribute('stroke-width', '1.5');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path'); path.setAttribute('d', 'M5 19L19 5M5 5h14v14'); arrow.append(path); link.append(arrow);
    document.querySelector('#collection-access-note').textContent = project.access === 'public' ? 'Demo pubblica: nessun login richiesto per visitare il progetto.' : 'La demo completa richiede un account autorizzato. Questa anteprima è consultabile da tutti.';
    document.querySelector('#cursor-label')?.classList.remove('is-visible');
    dialog.scrollTop = 0;
    dialog.showModal();
    document.body.classList.add('dialog-open');
    dialog.querySelector('[data-close-dialog]')?.focus({preventScroll:true});
  });
}
dialog?.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  trigger?.focus({preventScroll:true});
});
