'use strict';

/* ================================================================
   Theme manager — light / dark / system
   Cycles: light → dark → system → light
   Persists to localStorage. Defaults to 'light'.
   ================================================================ */
(function () {
  var STORAGE_KEY = 'asfc-theme';
  var THEMES      = ['light', 'dark', 'system'];
  var root        = document.documentElement;
  var btn         = document.getElementById('theme-toggle');

  var LABELS = {
    light:  'Theme: light',
    dark:   'Theme: dark',
    system: 'Theme: follow device',
  };

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (btn) btn.setAttribute('aria-label', LABELS[theme]);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  function nextTheme(current) {
    var idx = THEMES.indexOf(current);
    return THEMES[(idx + 1) % THEMES.length];
  }

  /* Read saved preference, fall back to 'light' */
  var saved = localStorage.getItem(STORAGE_KEY);
  applyTheme(THEMES.includes(saved) ? saved : 'light');

  if (btn) {
    btn.addEventListener('click', function () {
      applyTheme(nextTheme(root.getAttribute('data-theme') || 'light'));
    });
  }
})();


/* ================================================================
   Logo fallback — if img/logo.png fails to load, show ASFC text
   ================================================================ */
(function () {
  var img      = document.getElementById('logo-img');
  var fallback = document.getElementById('logo-fallback');

  if (!img || !fallback) return;

  img.addEventListener('error', function () {
    img.style.display = 'none';
    fallback.classList.add('visible');
  });
})();


/* ================================================================
   Sponsor ticker — duplicate list for seamless infinite loop
   ================================================================ */
(function () {
  var track = document.getElementById('sponsors-track');
  if (!track) return;

  var clone = track.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  clone.removeAttribute('id');
  track.parentElement.appendChild(clone);
})();


/* ================================================================
   Scroll reveal — Intersection Observer
   ================================================================ */
(function () {
  var reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });

  reveals.forEach(function (el) { observer.observe(el); });
})();


/* ================================================================
   Sticky header shrink on scroll
   ================================================================ */
(function () {
  var header = document.getElementById('site-header');
  if (!header) return;

  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 80);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ================================================================
   Mobile nav drawer — burger toggle
   ================================================================ */
(function () {
  var burgerBtn = document.getElementById('burger-btn');
  var drawer    = document.getElementById('mobile-drawer');
  var overlay   = document.getElementById('drawer-overlay');

  if (!burgerBtn || !drawer) return;

  function openNav() {
    document.body.classList.add('nav-open');
    burgerBtn.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
  }

  function closeNav() {
    document.body.classList.remove('nav-open');
    burgerBtn.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
  }

  burgerBtn.addEventListener('click', function () {
    if (document.body.classList.contains('nav-open')) {
      closeNav();
    } else {
      openNav();
    }
  });

  if (overlay) {
    overlay.addEventListener('click', closeNav);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
      closeNav();
      burgerBtn.focus();
    }
  });

  /* Close when a drawer link is tapped */
  drawer.querySelectorAll('.drawer-link').forEach(function (link) {
    link.addEventListener('click', closeNav);
  });
})();


/* ================================================================
   Bottom nav — highlight active section on scroll
   ================================================================ */
(function () {
  var navItems = document.querySelectorAll('.bottom-nav-item');
  if (!navItems.length) return;

  var sectionMap = [];
  navItems.forEach(function (item) {
    var href = item.getAttribute('href');
    if (!href || href === '#') return;
    var id = href.replace('#', '');
    var section = document.getElementById(id);
    if (section) sectionMap.push({ section: section, item: item });
  });

  if (!sectionMap.length) return;

  function onScroll() {
    var scrollY = window.scrollY;
    var active  = null;

    sectionMap.forEach(function (pair) {
      if (pair.section.offsetTop - 100 <= scrollY) {
        active = pair.item;
      }
    });

    navItems.forEach(function (i) { i.classList.remove('active'); });
    if (active) active.classList.add('active');
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ================================================================
   Smooth scroll polyfill for anchor links (Safari fallback)
   ================================================================ */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var id = anchor.getAttribute('href').replace('#', '');
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
