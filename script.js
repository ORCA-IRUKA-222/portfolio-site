/* ---------- reveal on scroll ----------
   Elements are visible by default. Only what is genuinely below the
   fold gets armed, so the first frame is never blank. */
(function () {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function vh() { return window.innerHeight || document.documentElement.clientHeight || 0; }
  // No viewport yet (hidden tab, prerender): leave every section visible.
  if (!vh()) return;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

  document.querySelectorAll('.rv').forEach(function (el) {
    if (el.getBoundingClientRect().top < vh() * 0.95) return; // already on screen
    el.classList.add('armed');
    io.observe(el);
  });

  // Safety net: images and webfonts can reflow the fold after arming.
  function sweep() {
    document.querySelectorAll('.rv.armed:not(.in)').forEach(function (el) {
      if (el.getBoundingClientRect().top < vh()) { el.classList.add('in'); io.unobserve(el); }
    });
  }
  window.addEventListener('load', sweep);
  setTimeout(sweep, 1500);
})();

/* ---------- click to play GIF ---------- */
(function () {
  document.querySelectorAll('.play').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var img = btn.querySelector('img');
      var gif = btn.dataset.gif;
      if (btn.classList.contains('on')) {
        // pause: swap back to the poster frame
        img.src = btn.dataset.poster;
        btn.classList.remove('on');
        btn.setAttribute('aria-pressed', 'false');
        return;
      }
      btn.dataset.poster = img.getAttribute('src');
      btn.classList.add('on');
      btn.setAttribute('aria-pressed', 'true');
      var pre = new Image();
      pre.onload = function () { img.src = gif; };
      pre.onerror = function () {
        btn.classList.remove('on');
        btn.setAttribute('aria-pressed', 'false');
      };
      pre.src = gif;
    });
  });
})();

/* ---------- responsive grid cell ---------- */
(function () {
  function setCell() {
    var w = window.innerWidth;
    var cell = w < 640 ? Math.round(w / 4) : w < 1024 ? Math.round(w / 8) : Math.round(w / 12);
    document.documentElement.style.setProperty('--cell', cell + 'px');
  }
  setCell();
  var t;
  window.addEventListener('resize', function () {
    clearTimeout(t); t = setTimeout(setCell, 150);
  });
})();

/* ---------- nav active state ---------- */
(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll('.hd-nav a'));
  if (!links.length || !('IntersectionObserver' in window)) return;
  var map = {};
  links.forEach(function (a) {
    var el = document.querySelector(a.getAttribute('href'));
    if (el) map[el.id] = a;
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var a = map[e.target.id];
      if (!a || !e.isIntersecting) return;
      links.forEach(function (l) { l.classList.remove('on'); });
      a.classList.add('on');
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  Object.keys(map).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) io.observe(el);
  });
})();

/* ---------- hamburger menu ---------- */
(function () {
  var btn = document.querySelector('.hd-menu');
  var menu = document.getElementById('menu');
  if (!btn || !menu) return;

  function open() {
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    menu.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  btn.addEventListener('click', function () {
    btn.getAttribute('aria-expanded') === 'true' ? close() : open();
  });
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hidden) { close(); btn.focus(); }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 880 && !menu.hidden) close();
  });
})();
