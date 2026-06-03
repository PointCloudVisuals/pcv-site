/* ============================================================
   POINT CLOUD VISUALS · shared interactions
   Used on Work / About / Approach / Contact (Home has its own).
   ============================================================ */
(function(){
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────── NAV SCROLLED STATE ─────────────────────── */
  const nav = document.querySelector('.nav-wrap');
  if(nav){
    const onScroll = () => {
      if(window.scrollY > 40) nav.classList.add('is-scrolled');
      else nav.classList.remove('is-scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if(reduced) return;

  /* ─────────────────────── SECTION INTRO ─────────────────────── */
  /* Auto-tag sections with .has-intro so the hairline animates in
     when the section enters viewport. */
  document.querySelectorAll('.section, .page-hero, .contact-foot, .featured, .work-section, .index-section, .final-section, .story-section, .principles-section, .credentials-grid, .also-section, .reach-section, .process-section, .deliv-section, .pricing-section, .addons-section, .recurring-section, .approach-faq').forEach(sec => {
    sec.classList.add('has-intro');
  });

  /* ─────────────────────── WORD-BY-WORD TITLE REVEAL ─────────────────────── */
  /* Wrap words of every section-title and h1 into spans so each
     fades/rises with a small stagger. */
  document.querySelectorAll('h2.section-title, .page-hero h1, h2.final-title, .intro-body h1').forEach(title => {
    if(title.classList.contains('word-reveal')) return; // already wrapped
    const out = [];
    let idx = 0;
    title.childNodes.forEach(node => {
      if(node.nodeType === 3){
        node.textContent.split(/(\s+)/).forEach(w => {
          if(/^\s+$/.test(w)){
            out.push(document.createTextNode(' '));
          } else if(w.length){
            const span = document.createElement('span');
            span.className = 'w';
            span.style.setProperty('--i', idx++);
            span.textContent = w;
            out.push(span);
          }
        });
      } else if(node.nodeType === 1){
        const span = document.createElement('span');
        span.className = 'w';
        span.style.setProperty('--i', idx++);
        span.appendChild(node.cloneNode(true));
        out.push(span);
      }
    });
    title.innerHTML = '';
    out.forEach(n => title.appendChild(n));
    title.classList.add('word-reveal');
  });

  /* ─────────────────────── SCROLL REVEAL OBSERVER ─────────────────────── */
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-zoom, .reveal-blur, .stagger, .has-intro, .word-reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.classList.add('is-in');
        // section also reveals its word-reveal titles
        e.target.querySelectorAll('.word-reveal').forEach(t => t.classList.add('is-in'));
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
  reveals.forEach(t => io.observe(t));

  /* ─────────────────────── MAGNETIC PRIMARY BUTTONS ─────────────────────── */
  if(!window.matchMedia('(pointer: coarse)').matches){
    document.querySelectorAll('.btn-primary, .nav-cta').forEach(btn => {
      const strength = 8;
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width  - 0.5) * 2;
        const y = ((e.clientY - r.top)  / r.height - 0.5) * 2;
        btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ─────────────────────── GLOW HOST CURSOR TRACK ─────────────────────── */
  /* Cards with .glow-host get a radial glow that follows the cursor. */
  if(!window.matchMedia('(pointer: coarse)').matches){
    document.querySelectorAll('.glow-host').forEach(host => {
      host.addEventListener('mousemove', (e) => {
        const r = host.getBoundingClientRect();
        const mx = ((e.clientX - r.left) / r.width) * 100;
        const my = ((e.clientY - r.top) / r.height) * 100;
        host.style.setProperty('--mx', mx + '%');
        host.style.setProperty('--my', my + '%');
      });
    });
  }

  /* ─────────────────────── COUNT-UP NUMBERS ─────────────────────── */
  /* Any element with [data-count] animates to its target when in view.
     Optional [data-prefix] and [data-suffix] are preserved. */
  const counters = document.querySelectorAll('[data-count]');
  if(counters.length){
    const countIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if(!e.isIntersecting) return;
        const el = e.target;
        const target = parseFloat(el.dataset.count);
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        const duration = parseInt(el.dataset.duration || 1400, 10);
        const start = performance.now();
        const step = (now) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          const val = target * eased;
          const display = Number.isInteger(target) ? Math.round(val) : val.toFixed(1);
          el.textContent = prefix + display.toLocaleString('en-US') + suffix;
          if(t < 1) requestAnimationFrame(step);
          else el.textContent = prefix + target.toLocaleString('en-US') + suffix;
        };
        requestAnimationFrame(step);
        countIO.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(c => countIO.observe(c));
  }

  /* ─────────────────────── POSTER CURSOR PARALLAX ─────────────────────── */
  /* Subtle 3D-ish pull on dot fields inside any [data-parallax] element. */
  if(!window.matchMedia('(pointer: coarse)').matches){
    document.querySelectorAll('[data-parallax]').forEach(host => {
      const layers = host.querySelectorAll('[data-parallax-layer]');
      host.addEventListener('mousemove', (e) => {
        const r = host.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width  - 0.5) * 2;
        const y = ((e.clientY - r.top)  / r.height - 0.5) * 2;
        layers.forEach(l => {
          const d = parseFloat(l.dataset.parallaxLayer) || 6;
          l.style.transform = `translate3d(${x * d}px, ${y * d}px, 0)`;
        });
      });
      host.addEventListener('mouseleave', () => {
        layers.forEach(l => l.style.transform = '');
      });
    });
  }
})();
