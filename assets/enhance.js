/* ============================================================
   POINT CLOUD VISUALS · enhance.js
   2026 polish layer, loaded on every page (Home included).
   - Scroll-progress hairline at top
   - View-transitions for same-origin navigation (soft crossfade)
   No conflicts with shared.js or Home's inline scripts.
   ============================================================ */
(function(){
  if (window.__pcvEnhance) return;
  window.__pcvEnhance = true;

  /* ─── Auto-updating copyright year ───
     Footer prints © <current year> via [data-year]; keeps every page
     correct without an annual edit. */
  (function(){
    var y = String(new Date().getFullYear());
    document.querySelectorAll('[data-year]').forEach(function(el){ el.textContent = y; });
  })();

  /* ─── Slide-in mobile menu ───
     The hamburger in the sticky nav had no behaviour before now. Build a
     right-side drawer ONCE per page by cloning the existing nav links +
     "Book a call" CTA, so every page keeps its own correct hrefs and
     active state without editing each page's markup. Opens/closes on the
     hamburger, the close button, the backdrop, Esc, any in-menu tap, and
     any resize back to desktop. Locks background scroll while open and
     keeps a simple focus trap for keyboard users. Drawer is CSS-hidden
     above 810px, so this is a no-op on desktop. */
  (function(){
    var nav = document.querySelector('.nav');
    if(!nav) return;
    var burger = nav.querySelector('.nav-hamburger');
    if(!burger) return;
    if(document.querySelector('.mnav')) return; // already built

    var linkSource = nav.querySelectorAll('.nav-links a');
    var ctaSource  = nav.querySelector('.nav-cta');
    if(!linkSource.length) return;

    var mnav = document.createElement('div');
    mnav.className = 'mnav';

    var backdrop = document.createElement('div');
    backdrop.className = 'mnav__backdrop';
    mnav.appendChild(backdrop);

    var panel = document.createElement('aside');
    panel.className = 'mnav__panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'Site menu');
    mnav.appendChild(panel);

    var top = document.createElement('div');
    top.className = 'mnav__top';
    top.innerHTML = '<span class="mnav__eyebrow"><span class="bar"></span>Menu</span>';
    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'mnav__close';
    closeBtn.setAttribute('aria-label', 'Close menu');
    closeBtn.innerHTML = '<span></span><span></span>';
    top.appendChild(closeBtn);
    panel.appendChild(top);

    var links = document.createElement('nav');
    links.className = 'mnav__links';
    links.setAttribute('aria-label', 'Primary');
    Array.prototype.forEach.call(linkSource, function(a, i){
      var el = document.createElement('a');
      el.href = a.getAttribute('href');
      if(a.classList.contains('is-active')) el.classList.add('is-active');
      var idx = document.createElement('span');
      idx.className = 'idx';
      idx.textContent = ('0' + (i + 1)).slice(-2);
      el.appendChild(idx);
      el.appendChild(document.createTextNode(a.textContent.trim()));
      links.appendChild(el);
    });
    panel.appendChild(links);

    var foot = document.createElement('div');
    foot.className = 'mnav__foot';
    if(ctaSource){
      var cta = document.createElement('a');
      cta.className = 'mnav__cta';
      cta.href = ctaSource.getAttribute('href');
      cta.innerHTML = ctaSource.textContent.trim() + ' <span aria-hidden="true">→</span>';
      foot.appendChild(cta);
    }
    var meta = document.createElement('div');
    meta.className = 'mnav__meta';
    meta.innerHTML =
      '<a href="mailto:projects@pointcloudvisuals.com">projects@pointcloudvisuals.com</a>' +
      '<span>Melbourne · Worldwide</span>';
    foot.appendChild(meta);
    panel.appendChild(foot);

    document.body.appendChild(mnav);

    var lastFocus = null;
    function onKey(e){
      if(e.key === 'Escape'){ close(); return; }
      if(e.key === 'Tab'){
        var f = panel.querySelectorAll('a[href], button');
        if(!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
      }
    }
    function open(){
      lastFocus = document.activeElement;
      mnav.classList.add('is-open');
      burger.classList.add('is-open');
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Close menu');
      document.body.classList.add('mnav-lock');
      document.addEventListener('keydown', onKey);
      setTimeout(function(){ closeBtn.focus(); }, 80);
    }
    function close(){
      mnav.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Open menu');
      document.body.classList.remove('mnav-lock');
      document.removeEventListener('keydown', onKey);
      if(lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function toggle(){ mnav.classList.contains('is-open') ? close() : open(); }

    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-controls', 'mnav');
    mnav.id = 'mnav';
    burger.addEventListener('click', toggle);
    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', close);
    mnav.addEventListener('click', function(e){
      if(e.target.closest && e.target.closest('a')) close();
    });
    window.addEventListener('resize', function(){
      if(window.innerWidth > 810 && mnav.classList.contains('is-open')) close();
    }, { passive: true });
  })();

  /* ─── Lazy, viewport-gated looping videos ───
     Any <video data-src> (Type-2 case-study loops; later Type-3 portfolio
     loops) only attaches its source and plays while near/in the viewport,
     and pauses when scrolled away, so the ~15 clips never all decode at
     once. prefers-reduced-motion shows the poster still only. */
  (function(){
    const vids = [].slice.call(document.querySelectorAll('video[data-src]'));
    if (!vids.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const attach = (v) => {
      if (v.dataset.loaded) return;
      v.dataset.loaded = '1';
      // Loop posters must ALWAYS be silent. The `muted` content attribute is
      // unreliable when the element is created via innerHTML (Chrome ignores it),
      // so force the IDL property too before the source is attached.
      v.muted = true;
      v.defaultMuted = true;
      v.setAttribute('muted', '');
      v.src = v.dataset.src;
      v.load();
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const v = e.target;
        if (e.isIntersecting) {
          attach(v);
          const p = v.play();
          if (p && p.catch) p.catch(() => {});
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { rootMargin: '200px 0px', threshold: 0.1 });
    vids.forEach((v) => io.observe(v));
  })();

  /* Cross-document view transitions (CSS @view-transition: navigation auto)
     reject their promise with "Transition was skipped" when a navigation
     interrupts them, a benign UA-level rejection we don't own. Swallow it. */
  window.addEventListener('unhandledrejection', (e) => {
    const msg = (e && e.reason && (e.reason.message || e.reason)) || '';
    if (/transition was skipped/i.test(String(msg))) e.preventDefault();
  });

  /* ─── Scroll progress hairline ─── */
  let bar = document.querySelector('.scroll-progress');
  if (!bar) {
    bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);
  }
  const updateProgress = () => {
    const h = document.documentElement;
    const max = (h.scrollHeight - h.clientHeight) || 1;
    const p = Math.min(1, Math.max(0, window.scrollY / max));
    bar.style.width = (p * 100).toFixed(2) + '%';
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });

  /* ─── Custom dot cursor ───
     Brass dot + soft ring. Ring lags slightly; dot tracks 1:1.
     Grows on hover over links, buttons, posters and FAQ headers.
     Hidden entirely on coarse pointers (touch). ZERO impact on layout.
     To disable site-wide: remove this block.
  */
  if (!window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('has-dot-cursor');
    const ring = document.createElement('div');
    ring.className = 'dot-cursor-ring';
    const dot = document.createElement('div');
    dot.className = 'dot-cursor-dot';
    document.body.appendChild(ring);
    document.body.appendChild(dot);

    let mx = window.innerWidth/2, my = window.innerHeight/2;
    let rx = mx, ry = my;
    let active = false;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      if (!active){ active = true; requestAnimationFrame(loop); }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      ring.style.opacity = '0';
      dot.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      ring.style.opacity = '';
      dot.style.opacity = '';
    });

    function loop(){
      // Easing, the ring chases the dot with a lag
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      if (Math.abs(mx - rx) < 0.1 && Math.abs(my - ry) < 0.1){ active = false; return; }
      requestAnimationFrame(loop);
    }

    // Grow on interactive targets
    const hoverSel = 'a, button, [role="button"], .case-poster, .play, .faq-q, .case-card, .hover-grow';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest && e.target.closest(hoverSel)) {
        ring.classList.add('is-hover');
        dot.classList.add('is-hover');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest && e.target.closest(hoverSel)) {
        ring.classList.remove('is-hover');
        dot.classList.remove('is-hover');
      }
    });
  }

  /* ─── "Now [verb]" HUD chip ───
     Bottom-left fixed chip. Rotates verb every 4s through a
     studio-state list. Shows live Melbourne time, picks AEDT/AEST
     automatically. Click-through (pointer-events: none on the chip
     itself; only the dot tooltip is interactive).
     To disable: remove this block + .pcv-hud styles in shared.css.
  */
  (function(){
    if (document.querySelector('.pcv-hud')) return;
    const hud = document.createElement('div');
    hud.className = 'pcv-hud';
    hud.innerHTML = `
      <span class="pcv-hud-dot" aria-hidden="true"></span>
      <span class="pcv-hud-verb" data-verb>RENDERING</span>
      <span class="pcv-hud-sep">·</span>
      <span class="pcv-hud-loc">MELBOURNE</span>
      <span class="pcv-hud-sep">·</span>
      <span class="pcv-hud-time" data-time>00:00</span>
      <span class="pcv-hud-tz" data-tz>AEDT</span>
    `;
    document.body.appendChild(hud);

    const activeVerbs = ['SCANNING','REGISTERING','TRAINING 3DGS','CONCEPTUALISING','STORYBOARDING','COMPOSING','CALIBRATING','RENDERING'];
    const verbEl = hud.querySelector('[data-verb]');
    const timeEl = hud.querySelector('[data-time]');
    const tzEl   = hud.querySelector('[data-tz]');

    // Melbourne wall-clock hour:minute, independent of the viewer's timezone.
    function melbHM(){
      const [h, m] = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Australia/Melbourne', hour: '2-digit', minute: '2-digit', hour12: false
      }).format(new Date()).split(':').map(Number);
      return { h, m };
    }
    // Studio is offline 00:00-07:00 Melbourne, every day (weekends included).
    function isAsleep(){ return melbHM().h < 7; }
    function sleepVerbs(){
      const { h, m } = melbHM();
      const hrs = Math.max(1, Math.ceil((7 * 60 - (h * 60 + m)) / 60));
      return ['OFFLINE', 'ASLEEP', 'BACK IN ' + hrs + 'H'];
    }
    function currentVerbs(){ return isAsleep() ? sleepVerbs() : activeVerbs; }

    function setVerb(next){
      if (verbEl.textContent === next) return;
      verbEl.classList.add('is-fade');
      setTimeout(() => {
        verbEl.textContent = next;
        verbEl.classList.remove('is-fade');
      }, 220);
    }

    let vi = 0;
    // Paint the correct state immediately on load (no fade).
    hud.classList.toggle('is-asleep', isAsleep());
    verbEl.textContent = currentVerbs()[0];

    setInterval(() => {
      vi++;
      hud.classList.toggle('is-asleep', isAsleep());
      const list = currentVerbs();
      setVerb(list[vi % list.length]);
    }, 4200);

    function updateTime(){
      try{
        const now = new Date();
        // Time in Melbourne, 12-hour format with AM/PM suffix
        const t = new Intl.DateTimeFormat('en-AU', {
          timeZone: 'Australia/Melbourne',
          hour: 'numeric', minute: '2-digit', hour12: true
        }).format(now)
          // Intl outputs e.g. "8:24 pm", normalise to uppercase + tight spacing
          .replace(/\s*(am|pm)/i, (m, p) => '\u202F' + p.toUpperCase());
        timeEl.textContent = t;
        // Timezone short code (AEDT in DST, AEST otherwise)
        const parts = new Intl.DateTimeFormat('en-AU', {
          timeZone: 'Australia/Melbourne', timeZoneName: 'short'
        }).formatToParts(now);
        const tz = parts.find(p => p.type === 'timeZoneName');
        if (tz) tzEl.textContent = tz.value.replace('GMT','UTC');
      }catch(_){
        timeEl.textContent = '--:--';
      }
    }
    updateTime();
    setInterval(updateTime, 15000);

    /* ─── HUD stays above the footer ───
       The chip is bottom-fixed. When the page footer scrolls into view
       it would otherwise sit on top of the legal/nav-mini row. This
       lifts the chip by the visible overlap (minus a small breathing
       gap) so the footer always reads cleanly. requestAnimationFrame
       throttled, barely measurable in the profiler. */
    (function liftAboveFooter(){
      const footer = document.querySelector('.footer');
      if (!footer) return;
      const GAP = 18; // px of clear space we want between HUD and footer top
      let ticking = false;
      function update(){
        ticking = false;
        const rect = footer.getBoundingClientRect();
        const vh = window.innerHeight;
        const overlap = Math.max(0, vh - rect.top);
        const lift = overlap > 0 ? Math.round(overlap + GAP) : 0;
        hud.style.transform = `translateY(${-lift}px)`;
      }
      function onScroll(){
        if (!ticking){ requestAnimationFrame(update); ticking = true; }
      }
      update();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
    })();
  })();

  /* First-visit loader removed (was assets/pcv-loader.gif). */

  /* ─── View Transitions for same-origin nav ───
     Cross-document crossfade is handled at the CSS layer via
     `@view-transition{ navigation: auto }` (shared.css) on modern
     browsers. No JS interception needed, a same-document
     startViewTransition here would double up and get skipped. */
})();
