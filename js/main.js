'use strict';

/* ================================================================
   Theme manager - light / dark / system
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
   Logo fallback - if img/logo.png fails to load, show ASFC text
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
   Sponsor ticker - duplicate items within the same list for a
   seamless infinite loop. Animation moves -50% = one full set.
   ================================================================ */
(function () {
  var track = document.getElementById('sponsors-track');
  if (!track) return;

  Array.from(track.children).forEach(function (item) {
    var clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });
})();


/* ================================================================
   Scroll reveal - Intersection Observer
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
   Mobile nav drawer - burger toggle
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
   Bottom nav - highlight active section on scroll
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
   Hero countdown timer — desktop only widget
   Reads fixture data from .fixture-row[data-target] elements so
   the picker stays in sync with the upcoming fixtures section.
   ================================================================ */
(function () {
  var elDays     = document.getElementById('cd-days');
  var elHours    = document.getElementById('cd-hours');
  var elMins     = document.getElementById('cd-mins');
  var elSecs     = document.getElementById('cd-secs');
  var elOpponent = document.querySelector('.countdown-opponent');
  var elDate     = document.getElementById('cd-detail-date');
  var elTime     = document.getElementById('cd-detail-time');
  var elVenue    = document.querySelector('.countdown-venue');
  var pickerEl   = document.querySelector('.countdown-picker');

  if (!elDays) return;

  var fixtureRows = Array.from(document.querySelectorAll('.fixture-row[data-target]'));
  if (!fixtureRows.length) return;

  var target = new Date(fixtureRows[0].dataset.target);

  function pad(n) { return String(n).padStart(2, '0'); }

  function fmtDate(d) {
    return d.toLocaleDateString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/London'
    });
  }

  function fmtTime(d) {
    return d.toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London'
    });
  }

  function tick() {
    var diff = target - Date.now();
    if (diff <= 0) {
      elDays.textContent = elHours.textContent = elMins.textContent = elSecs.textContent = '00';
      return;
    }
    elDays.textContent  = pad(Math.floor(diff / 86400000));
    elHours.textContent = pad(Math.floor((diff % 86400000) / 3600000));
    elMins.textContent  = pad(Math.floor((diff % 3600000)  / 60000));
    elSecs.textContent  = pad(Math.floor((diff % 60000)    / 1000));
  }

  /* Build picker buttons dynamically from fixture rows */
  if (pickerEl) {
    var buttons = [];
    fixtureRows.forEach(function (row, i) {
      var name = row.querySelector('.fixture-home').textContent.trim();
      var btn  = document.createElement('button');
      btn.className = 'cp-btn' + (i === 0 ? ' active' : '');
      btn.textContent = name.slice(0, 3).toUpperCase();
      btn.setAttribute('aria-label', 'Countdown to ' + name);

      btn.addEventListener('click', function () {
        target = new Date(row.dataset.target);
        if (elOpponent) elOpponent.textContent = name;
        if (elDate)     elDate.textContent     = fmtDate(target);
        if (elTime)     elTime.textContent     = fmtTime(target);
        if (elVenue)    elVenue.textContent    = row.dataset.venue || '';
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        tick();
      });

      pickerEl.appendChild(btn);
      buttons.push(btn);
    });
  }

  tick();
  setInterval(tick, 1000);
})();


/* ================================================================
   Hero mouse-move parallax — desktop only
   Pauses the CSS hero-drift animation while the mouse is over the
   hero, drives the bg-image transform directly, then restores the
   animation on mouseleave for a smooth handoff.
   ================================================================ */
(function () {
  if (window.innerWidth < 1024) return;

  var hero  = document.querySelector('.hero');
  var bgImg = document.querySelector('.hero-bg-img');
  if (!hero || !bgImg) return;

  var rafId   = null;
  var targetX = 0;
  var targetY = 0;
  var currentX = 0;
  var currentY = 0;
  var active  = false;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function animate() {
    currentX = lerp(currentX, targetX, 0.06);
    currentY = lerp(currentY, targetY, 0.06);
    bgImg.style.transform = 'scale(1.07) translate(' + currentX + 'px, ' + currentY + 'px)';
    rafId = requestAnimationFrame(animate);
  }

  hero.addEventListener('mouseenter', function () {
    if (window.innerWidth < 1024) return;
    active = true;
    bgImg.style.animation = 'none'; /* remove so inline transform takes precedence */
    if (!rafId) rafId = requestAnimationFrame(animate);
  });

  hero.addEventListener('mousemove', function (e) {
    if (!active) return;
    var rect   = hero.getBoundingClientRect();
    var normX  = (e.clientX - rect.left)  / rect.width  - 0.5; /* -0.5 → 0.5 */
    var normY  = (e.clientY - rect.top)   / rect.height - 0.5;
    targetX = -normX * 18; /* invert: move opposite to cursor */
    targetY = -normY * 10;
  });

  hero.addEventListener('mouseleave', function () {
    active  = false;
    targetX = 0;
    targetY = 0;
    /* Wait for lerp to settle near zero, then restore CSS animation */
    setTimeout(function () {
      if (!active) {
        cancelAnimationFrame(rafId);
        rafId = null;
        bgImg.style.transform = '';
        bgImg.style.animation = ''; /* restore CSS animation */
      }
    }, 700);
  });
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
