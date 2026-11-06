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

// ── Free website check request ───────────────────────────────────────────────
// Fills the domain into the contact form. Nothing is scanned or scored in the browser.

const domainInput  = document.getElementById('domain-input');
const scanBtn      = document.getElementById('scan-btn');
const scoreDetails = document.getElementById('score-details');

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function requestCheck(domain) {
  const key = domain.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  const field = document.querySelector('#contact-form input[name="domain"]');
  const interest = document.querySelector('#contact-form select[name="interest"]');
  if (field) field.value = key;
  if (interest) interest.value = 'Free website check';
  if (scoreDetails) {
    scoreDetails.innerHTML = `<div class="score-detail-note">Added <b>${esc(key)}</b> to the form below. Add your name and email and we'll send your QUANTA Score with every point explained.</div>`;
  }
  const contact = document.getElementById('contact');
  if (contact) contact.scrollIntoView({ behavior: 'smooth' });
}

if (scanBtn) {
  scanBtn.addEventListener('click', () => {
    const val = domainInput.value.trim();
    if (val) requestCheck(val);
  });
  domainInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const val = domainInput.value.trim();
      if (val) requestCheck(val);
    }
  });
}
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
