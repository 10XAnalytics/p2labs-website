/**
 * P2 Labs — Perfect Squared Inc.
 * Site interactions: scroll animations, nav, live QUANTA score demo, contact form
 */

// ── Navigation ────────────────────────────────────────────────────────────────

const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
});

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = nav.offsetHeight + 16;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ── Scroll Reveal ─────────────────────────────────────────────────────────────

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Live QUANTA Score Demo ────────────────────────────────────────────────────

const domainInput   = document.getElementById('domain-input');
const scanBtn       = document.getElementById('scan-btn');
const scoreValue    = document.getElementById('score-value');
const scoreBar      = document.getElementById('score-bar');
const riskLabel     = document.getElementById('risk-label');
const scoreDetails  = document.getElementById('score-details');

// Real results from the latest QUANTA Threat Index run (p2labs-intel/export_index.py).
let INDEX = null;
fetch('data/quanta-index.json')
  .then(r => r.ok ? r.json() : null)
  .then(d => { INDEX = d; })
  .catch(() => {});

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const RISK_COLORS = {
  'CRITICAL':      '#ef4444',
  'VULNERABLE':    '#f97316',
  'TRANSITIONING': '#eab308',
  'QUANTUM-READY': '#22c55e',
};

const RISK_ICONS = {
  'CRITICAL':      '🔴',
  'VULNERABLE':    '🟠',
  'TRANSITIONING': '🟡',
  'QUANTUM-READY': '✅',
};

function animateScore(target) {
  let current = 0;
  const step = Math.max(1, Math.floor(target / 40));
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    scoreValue.textContent = current;
    scoreBar.style.width = current + '%';
    if (current >= target) clearInterval(timer);
  }, 20);
}

function runDemo(domain) {
  const key = domain.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  const data = INDEX && INDEX.domains ? INDEX.domains[key] : null;

  scanBtn.disabled = true;
  scanBtn.textContent = 'Looking up...';

  // Reset
  scoreValue.textContent = '0';
  scoreBar.style.width = '0%';
  riskLabel.textContent = '';
  scoreDetails.innerHTML = '';

  setTimeout(() => {
    if (data) {
      const color = RISK_COLORS[data.rating] || '#888';
      scoreBar.style.background = color;
      riskLabel.textContent = `${RISK_ICONS[data.rating] || ''} ${data.rating}`;
      riskLabel.style.color = color;

      animateScore(data.score);

      const pqLine = data.pq
        ? '<span style="color:#22c55e">✅ Post-quantum key exchange in use</span>'
        : '<span style="color:var(--critical)">⚠ No post-quantum key exchange — recorded traffic could be decrypted later</span>';
      const why = (data.reasons || []).map(r => `<div class="score-detail-row"><span>${esc(r)}</span></div>`).join('');

      scoreDetails.innerHTML = `
        <div class="score-detail-row"><span>Key Exchange</span><span>${esc(data.key_exchange)}</span></div>
        <div class="score-detail-row"><span>Protocol</span><span>${esc(data.tls)}</span></div>
        <div class="score-detail-row">${pqLine}</div>
        ${why}
        <div class="score-detail-note">Website only, scanned ${esc(INDEX.date)}. Internal systems need a full assessment — <a href="#contact">contact us</a>.</div>
      `;
    } else {
      // Not in the index: never show a made-up score.
      scoreBar.style.background = '#888';
      riskLabel.textContent = '';
      scoreValue.textContent = '—';
      scoreDetails.innerHTML = `
        <div class="score-detail-row"><span>${esc(key)} isn't in the published index yet.</span></div>
        <div class="score-detail-note">We'll check it for free and send you the real result. <a href="#contact">Request a free website check.</a></div>
      `;
      const d = document.querySelector('#contact-form input[name="domain"]');
      if (d) d.value = key;
    }

    scanBtn.disabled = false;
    scanBtn.textContent = 'Scan';
  }, 1800);
}

if (scanBtn) {
  scanBtn.addEventListener('click', () => {
    const val = domainInput.value.trim();
    if (val) runDemo(val);
  });

  domainInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const val = domainInput.value.trim();
      if (val) runDemo(val);
    }
  });
}

// ── Contact Form ──────────────────────────────────────────────────────────────

const contactForm = document.getElementById('contact-form');
const formStatus  = document.getElementById('form-status');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = contactForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending...';

    const data = {
      name:    contactForm.name.value,
      email:   contactForm.email.value,
      company: contactForm.company.value,
      message: contactForm.message.value,
      domain:  contactForm.domain.value,
      interest: contactForm.interest.value,
    };

    // Mailto fallback — works without a backend
    const subject  = encodeURIComponent(`QUANTA Assessment Request — ${data.company}`);
    const body     = encodeURIComponent(
      `Name: ${data.name}\nCompany: ${data.company}\nEmail: ${data.email}\nDomain: ${data.domain}\nInterest: ${data.interest}\n\n${data.message}`
    );
    const mailto   = `mailto:eric.butler@10xanalyticsworldwide.io?subject=${subject}&body=${body}`;

    window.location.href = mailto;

    formStatus.textContent = 'Opening your email client...';
    formStatus.style.color = '#22c55e';

    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = 'Send Message';
      formStatus.textContent = '';
      contactForm.reset();
    }, 3000);
  });
}

// ── Threat counter animation ──────────────────────────────────────────────────

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  if (isNaN(target)) return;
  let current = 0;
  const step  = Math.max(1, Math.floor(target / 60));
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current.toLocaleString() + (el.dataset.suffix || '');
    if (current >= target) clearInterval(timer);
  }, 20);
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

// ── Active nav link on scroll ─────────────────────────────────────────────────

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  },
  { threshold: 0.4 }
);

sections.forEach(s => sectionObserver.observe(s));
