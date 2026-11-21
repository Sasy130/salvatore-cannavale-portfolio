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
  gsap.utils.toArray('.image-card').forEach((card, i) => {
    gsap.fromTo(card, {clipPath: 'inset(12% 0 12% 0 round 22% 22% 0 0)', y: 30 + i * 12}, {
      clipPath: 'inset(0% 0 0% 0 round 0% 0% 0 0)', y: 0, ease: 'none',
      scrollTrigger: { trigger: card, start: 'top 95%', end: 'top 45%', scrub: .7 },
    });
    gsap.fromTo(card.querySelector('img'), {yPercent: -4, scale: 1.12}, {
      yPercent: 4, scale: 1.12, ease: 'none',
      scrollTrigger: {trigger: card, start: 'top bottom', end: 'bottom top', scrub: .7},
    });
  });
}

export function initBookingDesign() {
  const dock = document.querySelector('.booking-dock');
  const link = dock.querySelector('a');
  const booking = document.querySelector('#booking');
  let heroVisible = true, bookingVisible = false;
  const update = () => {
    const hidden = heroVisible || bookingVisible || !!document.querySelector('dialog[open]');
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
  const dialogs = new MutationObserver(update);
  document.querySelectorAll('dialog').forEach(dialog => dialogs.observe(dialog, {attributes: true, attributeFilter: ['open']}));
  update();
  return {destroy() {removeEventListener('scroll', onScroll); bookingObserver.disconnect(); dialogs.disconnect();}};
}
