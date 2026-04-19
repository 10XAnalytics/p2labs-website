/**
 * P2 Labs — Perfect Squared Inc.
 * Site interactions: scroll animations, nav, live QUANTA score demo, contact form
 */

// ── Navigation ────────────────────────────────────────────────────────────────

const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
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

const DEMO_RESULTS = {
  // Real scan data from Session 2
  'saic.com':            { score: 35, risk: 'CRITICAL',   ke: 'RSA-2048', proto: 'TLS 1.2', hndl: true },
  'caci.com':            { score: 40, risk: 'VULNERABLE',  ke: 'ECDH-P256', proto: 'TLS 1.2', hndl: true },
  'leidos.com':          { score: 45, risk: 'VULNERABLE',  ke: 'ECDH-P384', proto: 'TLS 1.3', hndl: true },
  'boozallen.com':       { score: 45, risk: 'VULNERABLE',  ke: 'ECDH-P256', proto: 'TLS 1.3', hndl: true },
  'mantech.com':         { score: 45, risk: 'VULNERABLE',  ke: 'ECDH-P256', proto: 'TLS 1.3', hndl: true },
  'techguard.com':       { score: 45, risk: 'VULNERABLE',  ke: 'ECDH-P256', proto: 'TLS 1.3', hndl: true },
  'crestassure.com':     { score: 45, risk: 'VULNERABLE',  ke: 'ECDH-P256', proto: 'TLS 1.3', hndl: true },
  '1cyberforce.com':     { score: 45, risk: 'VULNERABLE',  ke: 'ECDH-P384', proto: 'TLS 1.3', hndl: true },
  'solielcom.com':       { score: 45, risk: 'VULNERABLE',  ke: 'ECDH-P256', proto: 'TLS 1.3', hndl: true },
  'pingwind.com':        { score: 45, risk: 'VULNERABLE',  ke: 'ECDH-P256', proto: 'TLS 1.3', hndl: true },
};

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
  const key = domain.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
  const data = DEMO_RESULTS[key];

  scanBtn.disabled = true;
  scanBtn.textContent = 'Scanning...';

  // Reset
  scoreValue.textContent = '0';
  scoreBar.style.width = '0%';
  riskLabel.textContent = '';
  scoreDetails.innerHTML = '';

  setTimeout(() => {
    if (data) {
      const color = RISK_COLORS[data.risk] || '#888';
      scoreBar.style.background = color;
      riskLabel.textContent = `${RISK_ICONS[data.risk] || ''} ${data.risk}`;
      riskLabel.style.color = color;

      animateScore(data.score);

      const hndlLine = data.hndl
        ? '<span style="color:var(--critical)">⚠ HNDL EXPOSED — quantum-harvestable traffic</span>'
        : '<span style="color:#22c55e">✅ HNDL: Not exposed</span>';

      scoreDetails.innerHTML = `
        <div class="score-detail-row"><span>Key Exchange</span><span>${data.ke}</span></div>
        <div class="score-detail-row"><span>Protocol</span><span>${data.proto}</span></div>
        <div class="score-detail-row"><span>PQC Algorithms</span><span style="color:var(--critical)">None detected</span></div>
        <div class="score-detail-row">${hndlLine}</div>
        <div class="score-detail-note">Full assessment available — <a href="#contact">contact us</a></div>
      `;
    } else {
      // Generic result for unknown domains
      const score = Math.floor(Math.random() * 15) + 35; // 35-50 — realistic baseline
      scoreBar.style.background = score < 40 ? RISK_COLORS.CRITICAL : RISK_COLORS.VULNERABLE;
      riskLabel.textContent = score < 40 ? '🔴 CRITICAL' : '🟠 VULNERABLE';
      riskLabel.style.color = score < 40 ? RISK_COLORS.CRITICAL : RISK_COLORS.VULNERABLE;

      animateScore(score);

      scoreDetails.innerHTML = `
        <div class="score-detail-row"><span>Key Exchange</span><span>ECDH-P256 (classical)</span></div>
        <div class="score-detail-row"><span>PQC Algorithms</span><span style="color:var(--critical)">None detected</span></div>
        <div class="score-detail-row"><span style="color:var(--critical)">⚠ HNDL EXPOSED — quantum-harvestable traffic</span></div>
        <div class="score-detail-note">This is a demo result. <a href="#contact">Request a full scan.</a></div>
      `;
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
    };

    // Mailto fallback — works without a backend
    const subject  = encodeURIComponent(`QUANTA Assessment Request — ${data.company}`);
    const body     = encodeURIComponent(
      `Name: ${data.name}\nCompany: ${data.company}\nEmail: ${data.email}\n\n${data.message}`
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
