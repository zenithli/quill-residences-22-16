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

// Background music — inline player + floating toggle, synced
(function() {
  const audio = document.getElementById('bgm');
  if (!audio) return;

  const fab = document.getElementById('music-toggle');
  const player = document.getElementById('music-player');
  const playBtn = document.getElementById('mp-btn');
  const trackEl = document.getElementById('mp-track');
  const fillEl = document.getElementById('mp-fill');
  const thumbEl = document.getElementById('mp-thumb');
  const timeEl = document.getElementById('mp-time');

  audio.volume = 0.35; // gentle background level

  function fmt(t) {
    if (!isFinite(t) || t < 0) t = 0;
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  // Sync the play/pause visual state across both controls
  function reflect() {
    const playing = !audio.paused;
    if (player) player.classList.toggle('playing', playing);
    if (fab) {
      fab.classList.toggle('playing', playing);
      fab.classList.toggle('paused', !playing);
      fab.title = playing ? '暂停背景音乐' : '播放背景音乐';
    }
  }

  // Update the progress bar + time readout
  function updateProgress() {
    const dur = audio.duration || 0;
    const pct = dur ? (audio.currentTime / dur) * 100 : 0;
    if (fillEl) fillEl.style.width = pct + '%';
    if (thumbEl) thumbEl.style.left = pct + '%';
    if (timeEl) timeEl.textContent = fmt(audio.currentTime) + ' / ' + fmt(dur);
    if (trackEl) trackEl.setAttribute('aria-valuenow', Math.round(pct));
  }

  audio.addEventListener('play', reflect);
  audio.addEventListener('pause', reflect);
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('loadedmetadata', updateProgress);
  audio.addEventListener('durationchange', updateProgress);

  // Play/pause toggle — shared by inline button and floating button
  function toggle(e) {
    if (e) e.stopPropagation();
    if (audio.paused) audio.play().catch(function() {});
    else audio.pause();
  }
  if (playBtn) playBtn.addEventListener('click', toggle);
  if (fab) fab.addEventListener('click', toggle);

  // Seek by clicking or dragging the progress track
  if (trackEl) {
    let dragging = false;
    function seek(e) {
      const rect = trackEl.getBoundingClientRect();
      const x = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
      let ratio = (x - rect.left) / rect.width;
      ratio = Math.max(0, Math.min(1, ratio));
      if (audio.duration) audio.currentTime = ratio * audio.duration;
      updateProgress();
    }
    trackEl.addEventListener('mousedown', function(e) {
      dragging = true; seek(e); e.preventDefault();
    });
    document.addEventListener('mousemove', function(e) {
      if (dragging) seek(e);
    });
    document.addEventListener('mouseup', function() { dragging = false; });
    trackEl.addEventListener('touchstart', seek, { passive: true });
    trackEl.addEventListener('touchmove', seek, { passive: true });
    // Keyboard seeking (arrow keys) for accessibility
    trackEl.addEventListener('keydown', function(e) {
      if (!audio.duration) return;
      if (e.key === 'ArrowRight') { audio.currentTime = Math.min(audio.duration, audio.currentTime + 5); }
      else if (e.key === 'ArrowLeft') { audio.currentTime = Math.max(0, audio.currentTime - 5); }
      else return;
      e.preventDefault();
      updateProgress();
    });
  }

  // Entry overlay — the click that enters the report also starts the music
  // (a user gesture, so playback is permitted by the browser autoplay policy)
  const overlay = document.getElementById('enter-overlay');
  if (overlay) {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    let entered = false;
    function enterReport() {
      if (entered) return;
      entered = true;
      overlay.classList.add('hidden');
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      audio.play().catch(function() {});
      setTimeout(function() { overlay.style.display = 'none'; }, 650);
    }
    overlay.addEventListener('click', enterReport);
    overlay.addEventListener('keydown', enterReport);
  }

  // Browsers block autoplay until a user gesture — start on first interaction
  const gestures = ['click', 'scroll', 'keydown', 'touchstart'];
  function autoStart() {
    gestures.forEach(function(ev) { document.removeEventListener(ev, autoStart); });
    if (audio.paused) audio.play().catch(function() {});
  }
  gestures.forEach(function(ev) {
    document.addEventListener(ev, autoStart, { passive: true });
  });

  // Optimistic attempt — most browsers will block this until a gesture
  audio.play().catch(function() {});

  reflect();
  updateProgress();
})();
