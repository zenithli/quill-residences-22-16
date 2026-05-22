// Active TOC highlighting on scroll
(function() {
  const sections = Array.from(document.querySelectorAll('.part'));
  const tocLinks = Array.from(document.querySelectorAll('.toc a'));
  if (!sections.length || !tocLinks.length) return;

  const linkById = {};
  tocLinks.forEach(a => {
    const id = a.getAttribute('href').replace('#', '');
    linkById[id] = a;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const link = linkById[id];
      if (!link) return;
      if (entry.isIntersecting) {
        tocLinks.forEach(a => a.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });

  sections.forEach(s => observer.observe(s));
})();
