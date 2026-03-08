/* ========================================
   FreelaPro – script.js
======================================== */

// ── NAVBAR scroll effect ──────────────────────────────────────────
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
  const heroH = document.querySelector('.hero')?.offsetHeight || 500;
  navbar.classList.toggle('nav-dark', window.scrollY < heroH - 80);
}, { passive: true });

// Estado inicial da nav
(function () {
  const heroH = document.querySelector('.hero')?.offsetHeight || 500;
  navbar.classList.toggle('nav-dark', window.scrollY < heroH - 80);
})();


// ── HAMBURGER mobile menu ─────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
});

// Fecha o menu ao clicar em um link
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
  });
});


// ── ACTIVE nav link on scroll ─────────────────────────────────────
const sections = document.querySelectorAll('section[id]');

const observerOptions = { rootMargin: '-40% 0px -55% 0px' };

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const id   = entry.target.getAttribute('id');
    const link = document.querySelector(`.nav-links a[href="#${id}"]`);
    if (link) link.style.color = entry.isIntersecting ? 'var(--primary)' : '';
  });
}, observerOptions);

sections.forEach(s => sectionObserver.observe(s));


// ── SCROLL-IN animations ──────────────────────────────────────────
const animatedEls = document.querySelectorAll(
  '.service-card, .step, .plan-card, .testimonial-card, .contact-wrapper'
);

animatedEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(28px)';
  el.style.transition = 'opacity .55s ease, transform .55s ease';
});

const appearObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry, i) => {
    if (!entry.isIntersecting) return;
    setTimeout(() => {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }, i * 80);
    obs.unobserve(entry.target);
  });
}, { threshold: 0.12 });

animatedEls.forEach(el => appearObserver.observe(el));


// ── FORM VALIDATION & SUBMIT ──────────────────────────────────────
const form      = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const btnText   = document.getElementById('btnText');
const btnLoading= document.getElementById('btnLoading');
const successEl = document.getElementById('formSuccess');

function showError(fieldId, errorId, message) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);
  field.classList.add('error');
  error.textContent = message;
}

function clearError(fieldId, errorId) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);
  field.classList.remove('error');
  error.textContent = '';
}

function validateForm() {
  let valid = true;

  const nome     = document.getElementById('nome').value.trim();
  const email    = document.getElementById('email').value.trim();
  const servico  = document.getElementById('servico').value;
  const mensagem = document.getElementById('mensagem').value.trim();

  // Nome
  if (!nome) {
    showError('nome', 'nomeError', 'Por favor, informe seu nome.');
    valid = false;
  } else {
    clearError('nome', 'nomeError');
  }

  // E-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    showError('email', 'emailError', 'Por favor, informe seu e-mail.');
    valid = false;
  } else if (!emailRegex.test(email)) {
    showError('email', 'emailError', 'E-mail inválido.');
    valid = false;
  } else {
    clearError('email', 'emailError');
  }

  // Serviço
  if (!servico) {
    showError('servico', 'servicoError', 'Selecione um serviço.');
    valid = false;
  } else {
    clearError('servico', 'servicoError');
  }

  // Mensagem
  if (!mensagem || mensagem.length < 10) {
    showError('mensagem', 'mensagemError', 'Descreva seu projeto em pelo menos 10 caracteres.');
    valid = false;
  } else {
    clearError('mensagem', 'mensagemError');
  }

  return valid;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  btnText.style.display    = 'none';
  btnLoading.style.display = 'inline';
  submitBtn.disabled       = true;
  successEl.style.display  = 'none';

  try {
    const data = new FormData(form);
    const res  = await fetch('contato.php', { method: 'POST', body: data });
    const json = await res.json();

    if (json.ok) {
      successEl.textContent   = '\u2705 ' + json.msg;
      successEl.style.display = 'block';
      successEl.style.borderColor = 'rgba(163,230,53,.25)';
      successEl.style.color = '#a3e635';
      form.reset();
      setTimeout(() => { successEl.style.display = 'none'; }, 7000);
    } else {
      successEl.textContent   = '\u274c ' + (json.msg || 'Erro ao enviar. Tente novamente.');
      successEl.style.display = 'block';
      successEl.style.borderColor = 'rgba(239,68,68,.3)';
      successEl.style.color = '#f87171';
    }
  } catch (_) {
    successEl.textContent   = '\u274c Falha na conexão. Tente novamente ou entre em contato pelo WhatsApp.';
    successEl.style.display = 'block';
    successEl.style.borderColor = 'rgba(239,68,68,.3)';
    successEl.style.color = '#f87171';
  } finally {
    btnText.style.display    = 'inline';
    btnLoading.style.display = 'none';
    submitBtn.disabled       = false;
  }
});

// Remove erro ao digitar
['nome', 'email', 'servico', 'mensagem'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    document.getElementById(id).classList.remove('error');
    document.getElementById(id + 'Error').textContent = '';
  });
});


// ── SMOOTH COUNTER (hero stats) ───────────────────────────────────
function animateCounter(el, target, suffix, duration) {
  let start     = 0;
  const step    = target / (duration / 16);
  const isFloat = target % 1 !== 0;

  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      start = target;
      clearInterval(timer);
    }
    el.textContent = (isFloat ? start.toFixed(1) : Math.round(start)).toLocaleString('pt-BR') + suffix;
  }, 16);
}

const statsObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    obs.unobserve(entry.target);

    const stats = entry.target.querySelectorAll('.hstat strong');
    const data  = [
      { target: 80,  suffix: '+' },
      { target: 120, suffix: '+' },
      { target: 100, suffix: '%' },
    ];

    stats.forEach((el, i) => animateCounter(el, data[i].target, data[i].suffix, 1400));
  });
}, { threshold: 0.5 });

const heroStatsEl = document.querySelector('.hero-stats');
if (heroStatsEl) statsObserver.observe(heroStatsEl);
