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

// Background music — autoplay on first interaction + floating toggle
(function() {
  const audio = document.getElementById('bgm');
  const btn = document.getElementById('music-toggle');
  if (!audio || !btn) return;

  audio.volume = 0.35; // gentle background level

  function reflect() {
    if (audio.paused) {
      btn.classList.add('paused');
      btn.classList.remove('playing');
      btn.title = '播放背景音乐';
    } else {
      btn.classList.add('playing');
      btn.classList.remove('paused');
      btn.title = '暂停背景音乐';
    }
  }
  audio.addEventListener('play', reflect);
  audio.addEventListener('pause', reflect);

  // Manual toggle via the floating button
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (audio.paused) {
      audio.play().catch(function() {});
    } else {
      audio.pause();
    }
  });

  // Browsers block autoplay until a user gesture — start on first interaction
  const gestures = ['click', 'scroll', 'keydown', 'touchstart'];
  function autoStart() {
    gestures.forEach(function(ev) { document.removeEventListener(ev, autoStart); });
    if (audio.paused) audio.play().catch(function() {});
  }
  gestures.forEach(function(ev) {
    document.addEventListener(ev, autoStart, { passive: true });
  });

  // Optimistic attempt — most browsers will block this, which is fine
  audio.play().catch(function() {});

  reflect();
})();
