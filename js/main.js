/* ═══════════════════════════════════════════════════════
   TETIFY — interactions
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var lerp = function (a, b, n) { return a + (b - a) * n; };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ─── SPLIT TEXT ────────────────────────────────────── */
  function splitText (el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';

    var walk = function (node, out) {
      Array.prototype.forEach.call(node.childNodes, function (n) {
        if (n.nodeType === 3) out.push({ text: n.nodeValue, em: node.tagName === 'EM' });
        else if (n.nodeType === 1) walk(n, out);
      });
      return out;
    };

    var parts = walk(el, []);
    var html = '', idx = 0;

    parts.forEach(function (part) {
      var chunk = '';
      part.text.split(/(\s+)/).forEach(function (word) {
        if (!word) return;
        if (/^\s+$/.test(word)) { chunk += ' '; return; }
        var inner = '';
        word.split('').forEach(function (ch) {
          // kaskádu stropuju — u dlouhého nadpisu by poslední písmeno čekalo přes půl sekundy
          inner += '<span class="split__i" style="transition-delay:' + Math.min(idx * 10, 260) + 'ms">' + ch + '</span>';
          idx++;
        });
        chunk += '<span class="split">' + inner + '</span>';
      });
      // one <em> per highlighted run keeps the gradient continuous across its words
      html += part.em ? '<em>' + chunk + '</em>' : chunk;
    });

    el.innerHTML = html;
  }

  /* ─── REVEAL ON SCROLL ──────────────────────────────── */
  function initReveal () {
    var targets = $$('.reveal, [data-split]');

    if (!('IntersectionObserver' in window) || reduced) {
      targets.forEach(function (t) { t.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var d = parseInt(el.dataset.delay || '0', 10);
        setTimeout(function () {
          el.classList.add('is-in');
          // scéna se jednou sama přehraje — jinak by ji na dotyku (bez hoveru) nikdo neviděl
          if (el.classList.contains('card--scene')) {
            setTimeout(function () { el.classList.add('is-demo'); }, 260);
            setTimeout(function () { el.classList.remove('is-demo'); }, 2500);
          }
        }, d);
        io.unobserve(el);
      });
      // spouštíme ještě než prvek vjede do obrazu, jinak to při rychlém scrollu působí opožděně
    }, { threshold: 0.05, rootMargin: '0px 0px 14% 0px' });

    targets.forEach(function (t) { io.observe(t); });
  }

  /* ─── HEADER + SCROLL PROGRESS + ACTIVE NAV ─────────── */
  function initScrollUI () {
    var header = $('#header'), bar = $('#scrollBar');
    var links  = $$('.nav__link');
    var secs   = links.map(function (l) { return $(l.getAttribute('href')); });
    var last = 0, ticking = false;

    function update () {
      var y = window.pageYOffset;
      var h = document.documentElement.scrollHeight - innerHeight;

      if (bar) bar.style.width = clamp(y / Math.max(h, 1), 0, 1) * 100 + '%';

      if (header) {
        header.classList.toggle('is-stuck', y > 40);
        var menuOpen = $('#menu') && $('#menu').classList.contains('is-open');
        header.classList.toggle('is-hidden', y > 420 && y > last && !menuOpen);
      }

      var active = -1;
      secs.forEach(function (s, i) {
        if (s && s.getBoundingClientRect().top <= innerHeight * 0.35) active = i;
      });
      links.forEach(function (l, i) { l.classList.toggle('is-active', i === active); });

      last = y;
      ticking = false;
    }

    addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ─── MOBILE MENU ───────────────────────────────────── */
  function initMenu () {
    var burger = $('#burger'), menu = $('#menu');
    if (!burger || !menu) return;

    function toggle (force) {
      var open = force !== undefined ? force : !menu.classList.contains('is-open');
      menu.classList.toggle('is-open', open);
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Zavřít menu' : 'Otevřít menu');
      document.body.classList.toggle('is-locked', open);
    }

    burger.addEventListener('click', function () { toggle(); });
    addEventListener('resize', function () {
      if (innerWidth > 1080 && menu.classList.contains('is-open')) toggle(false);
    });
    $$('.menu__link', menu).forEach(function (a) {
      a.addEventListener('click', function () { toggle(false); });
    });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });
  }

  /* ─── CUSTOM CURSOR ─────────────────────────────────── */
  function initCursor () {
    var cur = $('#cursor');
    if (!cur || matchMedia('(hover:none)').matches || reduced) return;

    var dot = $('.cursor__dot', cur), ring = $('.cursor__ring', cur);
    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

    addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      cur.classList.add('is-on');
    }, { passive: true });

    addEventListener('pointerdown', function () { cur.classList.add('is-hover'); });
    addEventListener('pointerup',   function () { cur.classList.remove('is-hover'); });
    document.addEventListener('mouseleave', function () { cur.classList.remove('is-on'); });

    $$('a, button, .card, .product, .work, .chip, input, textarea').forEach(function (el) {
      el.addEventListener('pointerenter', function () { cur.classList.add('is-hover'); });
      el.addEventListener('pointerleave', function () { cur.classList.remove('is-hover'); });
    });

    (function loop () {
      rx = lerp(rx, mx, 0.16); ry = lerp(ry, my, 0.16);
      dot.style.transform  = 'translate(' + mx + 'px,' + my + 'px)';
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      requestAnimationFrame(loop);
    })();
  }

  /* ─── MAGNETIC BUTTONS ──────────────────────────────── */
  function initMagnetic () {
    if (matchMedia('(hover:none)').matches || reduced) return;

    $$('.magnetic').forEach(function (el) {
      var raf, tx = 0, ty = 0, cx = 0, cy = 0, active = false;

      function run () {
        cx = lerp(cx, tx, 0.18); cy = lerp(cy, ty, 0.18);
        el.style.transform = 'translate(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px)';
        if (active || Math.abs(cx - tx) > 0.1 || Math.abs(cy - ty) > 0.1) raf = requestAnimationFrame(run);
        else { el.style.transform = ''; raf = null; }
      }

      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        tx = (e.clientX - (r.left + r.width / 2)) * 0.28;
        ty = (e.clientY - (r.top + r.height / 2)) * 0.42;
        active = true;
        if (!raf) raf = requestAnimationFrame(run);
      });

      el.addEventListener('pointerleave', function () {
        tx = 0; ty = 0; active = false;
        if (!raf) raf = requestAnimationFrame(run);
      });
    });
  }

  /* ─── SPOTLIGHT HOVER ───────────────────────────────── */
  function initSpotlight () {
    $$('.spotlight').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ─── COUNTERS ──────────────────────────────────────── */
  function initCounters () {
    var nums = $$('[data-count]');
    if (!nums.length) return;

    if (!('IntersectionObserver' in window) || reduced) {
      nums.forEach(function (n) { n.textContent = n.dataset.count + (n.dataset.suffix || ''); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        io.unobserve(el);

        var target = parseFloat(el.dataset.count);
        var suffix = el.dataset.suffix || '';
        var dur = 1500, t0 = performance.now();

        (function step (now) {
          var p = clamp((now - t0) / dur, 0, 1);
          var e2 = 1 - Math.pow(1 - p, 4);
          el.textContent = Math.round(target * e2) + (p === 1 ? suffix : '');
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.5 });

    nums.forEach(function (n) { io.observe(n); });
  }

  /* ─── PROCESS TIMELINE PROGRESS ─────────────────────── */
  function initSteps () {
    var wrap = $('#steps'), bar = $('#stepsProgress');
    if (!wrap || !bar) return;
    var ticking = false;

    function update () {
      var r = wrap.getBoundingClientRect();
      var start = innerHeight * 0.85;
      var p = clamp((start - r.top) / (r.height + start - innerHeight * 0.35), 0, 1);
      bar.style.height = (p * 100) + '%';
      ticking = false;
    }

    addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    addEventListener('resize', update);
    update();
  }

  /* ─── FAQ ACCORDION ─────────────────────────────────── */
  function initFaq () {
    $$('.faq__item').forEach(function (item) {
      var btn = $('.faq__q', item), panel = $('.faq__a', item);
      if (!btn || !panel) return;

      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';

        $$('.faq__item').forEach(function (other) {
          if (other === item) return;
          var b = $('.faq__q', other), p = $('.faq__a', other);
          b.setAttribute('aria-expanded', 'false');
          p.style.height = '0px';
        });

        btn.setAttribute('aria-expanded', String(!open));
        panel.style.height = open ? '0px' : panel.scrollHeight + 'px';
      });
    });

    addEventListener('resize', function () {
      $$('.faq__item').forEach(function (item) {
        var btn = $('.faq__q', item), panel = $('.faq__a', item);
        if (btn.getAttribute('aria-expanded') === 'true') panel.style.height = panel.scrollHeight + 'px';
      });
    });
  }

  /* ─── FORM ──────────────────────────────────────────── */
  function initForm () {
    var form = $('#form'), note = $('#formNote');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;

      $$('input[required], textarea[required]', form).forEach(function (input) {
        var valid = input.value.trim() !== '' &&
          (input.type !== 'email' || /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(input.value.trim()));
        input.parentElement.classList.toggle('is-error', !valid);
        if (!valid && ok) { input.focus(); ok = false; }
      });

      if (!ok) {
        note.textContent = 'Zkontrolujte prosím vyplněná pole.';
        note.className = 'form__note is-bad';
        return;
      }

      // TODO: napojit na backend / e-mailovou službu (Formspree, vlastní API…)
      var data = new FormData(form);
      var topics = data.getAll('topic').join(', ');
      var body = 'Jméno: ' + data.get('name') + '\n' +
                 'E-mail: ' + data.get('email') + '\n' +
                 'Firma: ' + (data.get('company') || '—') + '\n' +
                 'Oblast: ' + (topics || '—') + '\n\n' +
                 data.get('message');

      note.textContent = 'Otevíráme váš e-mailový klient s předvyplněnou zprávou…';
      note.className = 'form__note is-ok';

      window.location.href = 'mailto:info@tetify.cz?subject=' +
        encodeURIComponent('Poptávka z webu — ' + data.get('name')) +
        '&body=' + encodeURIComponent(body);

      setTimeout(function () {
        note.textContent = 'Díky! Pokud se e-mail neotevřel, napište nám na info@tetify.cz.';
      }, 2200);
    });

    $$('input, textarea', form).forEach(function (i) {
      i.addEventListener('input', function () { i.parentElement.classList.remove('is-error'); });
    });
  }

  /* Cíl odkazu odhalíme okamžitě — jinak uživatel doscrolluje na prázdné
     místo a musí kliknout znovu, než se text vůbec objeví. */
  function revealNow (root) {
    var els = $$('.reveal, [data-split]', root);
    if (root.classList.contains('reveal') || root.hasAttribute('data-split')) els.push(root);
    els.forEach(function (el) {
      if (el.hasAttribute('data-split')) splitText(el);
      el.classList.add('is-in');
    });
  }

  /* ─── MISC ──────────────────────────────────────────── */
  function initMisc () {
    var y = $('#year');
    if (y) y.textContent = new Date().getFullYear();

    // otevření rovnou s #kotvou v adrese
    if (location.hash.length > 1) {
      var target = $(location.hash);
      if (target) setTimeout(function () { revealNow(target); }, 60);
    }

    // smooth anchors with header offset
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id === '#' || id.length < 2) return;
        var t = $(id);
        if (!t) return;
        e.preventDefault();
        revealNow(t);
        var top = t.getBoundingClientRect().top + window.pageYOffset - 74;
        window.scrollTo({ top: top, behavior: reduced ? 'auto' : 'smooth' });
      });
    });
  }

  /* ─── BOOT ──────────────────────────────────────────── */
  var booted = false;
  function boot () {
    if (booted) return;
    booted = true;
    $$('[data-split]').forEach(splitText);
    initReveal();
    initCounters();
    initSteps();
  }

  function early () {
    initScrollUI();
    initMenu();
    initCursor();
    initMagnetic();
    initSpotlight();
    initFaq();
    initForm();
    initMisc();
  }

  function start () {
    early();
    // animaci nadpisů pustíme až s načtenými fonty, ať písmena nenaskočí náhradním
    // fontem a pak neposkočí — ale nejdéle 500 ms, pomalé fonty nesmí držet stránku
    var fontsReady = (document.fonts && document.fonts.ready) || Promise.resolve();
    Promise.race([fontsReady, new Promise(function (r) { setTimeout(r, 500); })]).then(boot);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
