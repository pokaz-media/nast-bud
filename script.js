// NAST-BUD — reveal on scroll + small polish
(() => {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    }
  }, { rootMargin: '-10% 0px -5% 0px' });

  const targets = document.querySelectorAll(
    '.firma-body, .firma-card, .prod, .lok-card, .jak-body, .partners, .quote blockquote, .k-card, .k-form, .ft-top'
  );
  targets.forEach(el => { el.classList.add('reveal'); io.observe(el); });

  // Active nav indicator on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  const setActive = (id) => {
    navLinks.forEach(a => {
      const isActive = a.getAttribute('href') === '#' + id;
      a.style.color = isActive ? 'var(--red)' : '';
    });
  };
  const navIo = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => navIo.observe(s));
})();
