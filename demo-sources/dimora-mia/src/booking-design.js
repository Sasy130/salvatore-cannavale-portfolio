import gsap from 'gsap';

export function animateBookingDesign() {
  gsap.from('.booking-heading h2', {
    y: 44, clipPath: 'inset(0 0 35% 0)', ease: 'power2.out',
    scrollTrigger: { trigger: '.booking-section', start: 'top 88%', end: 'top 40%', scrub: .6 },
  });
  gsap.from('.booking-card', {
    y: 65, rotation: 1.2, transformOrigin: '50% 100%', ease: 'power2.out',
    scrollTrigger: { trigger: '.booking-section', start: 'top 90%', end: 'top 36%', scrub: .6 },
  });
  // No animated clip masks or CSS transform transitions on photographs.
  // On phones the editorial layout is native document flow, without scroll rendering.
  if (matchMedia('(min-width: 701px)').matches) {
    gsap.utils.toArray('.image-card').forEach((card, i) => {
      gsap.from(card, {y: 28 + i * 12, ease: 'none',
        scrollTrigger: {trigger: card, start: 'top 95%', end: 'top 65%', scrub: .35}});
    });
  }
}

export function initBookingDesign() {
  const dock = document.querySelector('.booking-dock');
  const link = dock.querySelector('a');
  const booking = document.querySelector('#booking');
  let heroVisible = true, bookingVisible = false, footerVisible = false;
  const update = () => {
    const hidden = heroVisible || bookingVisible || footerVisible || !!document.querySelector('dialog[open]');
    dock.setAttribute('aria-hidden', String(hidden));
    link.tabIndex = hidden ? -1 : 0;
    dock.inert = hidden;
  };
  const onScroll = () => {heroVisible = scrollY < innerHeight * .55; update();};
  addEventListener('scroll', onScroll, {passive: true});
  // A small visible strip is insufficient: keep the shortcut until the form is reachable.
  const bookingObserver = new IntersectionObserver(entries => {
    bookingVisible = entries[0].isIntersecting; update();
  }, {rootMargin: '-85px 0px -80px 0px', threshold: 0});
  onScroll();
  bookingObserver.observe(booking);
  const endings=new Set();
  const footerObserver = new IntersectionObserver(entries => {
    for(const entry of entries){if(entry.isIntersecting)endings.add(entry.target);else endings.delete(entry.target)}
    footerVisible=endings.size>0;update();
  }, {threshold: .12});
  footerObserver.observe(document.querySelector('.closing-copy'));
  footerObserver.observe(document.querySelector('.editorial-gallery'));
  const dialogs = new MutationObserver(update);
  document.querySelectorAll('dialog').forEach(dialog => dialogs.observe(dialog, {attributes: true, attributeFilter: ['open']}));
  update();
  return {destroy() {removeEventListener('scroll', onScroll); bookingObserver.disconnect(); footerObserver.disconnect(); dialogs.disconnect();}};
}
