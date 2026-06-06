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
   Goal Easter Egg — hover "Get Tickets" in the hero on desktop.
   Two-phase rAF bezier: cursor → bounce off countdown widget → goal.
   ================================================================ */
(function () {
  if (window.innerWidth < 1024) return;

  var btn      = document.querySelector('.hero-ctas .btn-ghost');
  var egg      = document.querySelector('.goal-egg');
  if (!btn || !egg) return;

  var hero      = document.querySelector('.hero');
  var countdown = document.getElementById('hero-countdown');
  var rafId  = null;
  var fadeId = null;

  function cubicBezier(t, p0, p1, p2, p3) {
    var mt = 1 - t;
    return mt*mt*mt*p0 + 3*mt*mt*t*p1 + 3*mt*t*t*p2 + t*t*t*p3;
  }
  function easeInOutQuad(t) { return t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t; }

  btn.addEventListener('mouseenter', function (e) {
    if (Math.random() > 0.2) return; /* ~1-in-5 chance — keeps it a surprise */
    if (rafId)  { cancelAnimationFrame(rafId); rafId = null; }
    if (fadeId) { clearTimeout(fadeId);        fadeId = null; }

    var ball     = egg.querySelector('.goal-egg__ball');
    var goalText = egg.querySelector('.goal-egg__text');
    var heroRect = hero.getBoundingClientRect();

    /* Ball starts at cursor */
    var x0 = e.clientX - heroRect.left;
    var y0 = e.clientY - heroRect.top;
    ball.style.left      = x0 + 'px';
    ball.style.top       = y0 + 'px';
    ball.style.opacity   = '1';
    ball.style.transform = 'translate(0,0) rotate(0deg)';

    /* Bounce area: bottom-centre of countdown widget */
    var cdRect  = countdown ? countdown.getBoundingClientRect() : null;
    var bounceX = cdRect ? cdRect.left + cdRect.width / 2 - heroRect.left : heroRect.width * 0.72;
    var bounceY = cdRect ? cdRect.bottom - heroRect.top                   : heroRect.height * 0.55;

    /* Goal net centre */
    var goalX = heroRect.width  * 0.96 - 55;
    var goalY = heroRect.height * 0.88 - 40;

    /*
     * Cubic bezier — two control points shape the arc through the bounce.
     * cp1 pulls the ball upward toward the countdown.
     * cp2 deflects it downward away from the widget toward the goal.
     * Velocity is continuous at the bounce point so there is no stall.
     */
    var cp1X = x0  + (bounceX - x0)  * 0.55;
    var cp1Y = Math.min(y0, bounceY) - 100;
    var cp2X = bounceX + (goalX - bounceX) * 0.25;
    var cp2Y = bounceY + 80;

    egg.classList.add('goal-egg--active');
    goalText.style.animation = '';
    goalText.style.opacity   = '0';
    goalText.style.transform = 'scale(0.4)';

    var duration = 1900;
    var startTs  = null;

    function step(ts) {
      if (!startTs) startTs = ts;
      var raw = Math.min((ts - startTs) / duration, 1);
      var t   = easeInOutQuad(raw);

      var dx = cubicBezier(t, 0, cp1X - x0, cp2X - x0, goalX - x0);
      var dy = cubicBezier(t, 0, cp1Y - y0, cp2Y - y0, goalY - y0);
      ball.style.transform = 'translate(' + dx + 'px,' + dy + 'px) rotate(' + (raw * 560) + 'deg)';

      if (raw < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        goalText.style.animation = 'egg-goal-text 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards';
        rafId = null;
        /* Fade everything out 0.5s after GOAL! finishes appearing (0.4s + 0.5s) */
        fadeId = setTimeout(function () {
          var net = egg.querySelector('.goal-egg__net');
          /* Clear animation fill so inline opacity can take effect */
          goalText.style.animation = 'none';
          goalText.style.opacity   = '1';
          goalText.style.transform = 'scale(1)';
          /* Force reflow before transitioning */
          void goalText.offsetHeight;
          goalText.style.transition = 'opacity 0.4s ease';
          ball.style.transition     = 'opacity 0.4s ease';
          net.style.transition      = 'opacity 0.4s ease';
          goalText.style.opacity    = '0';
          ball.style.opacity        = '0';
          net.style.opacity         = '0';
          fadeId = setTimeout(function () {
            egg.classList.remove('goal-egg--active');
            goalText.style.transition = '';
            goalText.style.animation  = '';
            goalText.style.opacity    = '';
            goalText.style.transform  = '';
            ball.style.transition     = '';
            net.style.transition      = '';
            net.style.opacity         = '';
            fadeId = null;
          }, 400);
        }, 900);
      }
    }

    rafId = requestAnimationFrame(step);
  });

  btn.addEventListener('mouseleave', function () {
    if (rafId)  { cancelAnimationFrame(rafId); rafId = null; }
    if (fadeId) { clearTimeout(fadeId);        fadeId = null; }
    egg.classList.remove('goal-egg--active');

    var ball = egg.querySelector('.goal-egg__ball');
    if (ball) { ball.style.opacity = '0'; ball.style.transform = 'translate(0,0) rotate(0deg)'; }

    var goalText = egg.querySelector('.goal-egg__text');
    if (goalText) { goalText.style.animation = ''; goalText.style.opacity = '0'; goalText.style.transform = 'scale(0.4)'; }
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

// Tickets carousel
(function () {
  var slides = document.querySelectorAll('.tickets-slide');
  var dots   = document.querySelectorAll('.tickets-dot');
  if (!slides.length) return;

  var current = 0;
  var timer;

  function goTo(index) {
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    dots[current].setAttribute('aria-selected', 'false');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
    dots[current].setAttribute('aria-selected', 'true');
  }

  function start() {
    timer = setInterval(function () { goTo(current + 1); }, 6000);
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      clearInterval(timer);
      goTo(i);
      start();
    });
  });

  start();
})();

// Per-fixture countdown timers
(function () {
  var rows = document.querySelectorAll('.fixture-row[data-target]');
  if (!rows.length) return;

  function pad(n) { return String(n).padStart(2, '0'); }

  rows.forEach(function (row) {
    var target = new Date(row.dataset.target);
    var cd = document.createElement('div');
    cd.className = 'fixture-countdown';
    cd.setAttribute('aria-hidden', 'true');

    var keys   = ['days', 'hrs',  'mins', 'secs'];
    var labels = ['Days', 'Hrs',  'Mins', 'Secs'];
    var spans  = {};

    keys.forEach(function (k, i) {
      var unit = document.createElement('div');
      unit.className = 'fc-unit';
      var num = document.createElement('span');
      num.className = 'fc-num';
      num.textContent = '00';
      var lbl = document.createElement('span');
      lbl.className = 'fc-label';
      lbl.textContent = labels[i];
      unit.appendChild(num);
      unit.appendChild(lbl);
      cd.appendChild(unit);
      spans[k] = num;
    });

    var btn = row.querySelector('.btn');
    row.insertBefore(cd, btn);

    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) {
        spans.days.textContent = spans.hrs.textContent = spans.mins.textContent = spans.secs.textContent = '00';
        return;
      }
      spans.days.textContent = pad(Math.floor(diff / 86400000));
      spans.hrs.textContent  = pad(Math.floor((diff % 86400000) / 3600000));
      spans.mins.textContent = pad(Math.floor((diff % 3600000)  / 60000));
      spans.secs.textContent = pad(Math.floor((diff % 60000)    / 1000));
    }

    tick();
    setInterval(tick, 1000);
  });
})();
