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
    '.prod, .lok-card, .jak-body, .partners, .sponsor-body, .sponsor-fig, .quote blockquote, .k-card, .ft-top'
  );
  targets.forEach(el => { el.classList.add('reveal'); io.observe(el); });

  // Active nav indicator on scroll
  // Film prezentacyjny — YouTube ładuje się dopiero po kliknięciu
  document.querySelectorAll('.film-stage[data-yt]').forEach(stage => {
    const trigger = stage.querySelector('.film-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', () => {
      const id = stage.dataset.yt;
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      iframe.title = 'Film prezentacyjny NAST-BUD';
      iframe.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      stage.replaceChildren(iframe);
    }, { once: true });
  });

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
