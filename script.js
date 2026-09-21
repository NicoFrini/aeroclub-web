/* =========================================================
   Aeroclub San Juan (CACSJ) — Interactividad
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initDropdown();
  initSmoothScrollClose();
  initScrollSpy();
  initBackToTop();
  initContactForm();
  document.getElementById('year').textContent = new Date().getFullYear();
});

/* ---------- Navbar: sombra al hacer scroll + menú móvil ---------- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');

  const onScroll = () => {
    navbar.classList.toggle('is-scrolled', window.scrollY > 10);
  };
  onScroll();
  window.addEventListener('scroll', onScroll);

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.classList.toggle('is-active', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

/* ---------- Dropdown "Barracas" del menú ---------- */
function initDropdown() {
  const dropdown = document.getElementById('barracasDropdown');
  if (!dropdown) return;

  const trigger = dropdown.querySelector('.nav-link--dropdown');

  const closeDropdown = () => {
    dropdown.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
  };

  trigger.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = dropdown.classList.toggle('is-open');
    trigger.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', (event) => {
    if (!dropdown.contains(event.target)) closeDropdown();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeDropdown();
  });
}

/* ---------- Cierra el menú móvil al elegir un link ---------- */
function initSmoothScrollClose() {
  const menu = document.getElementById('navMenu');
  const toggle = document.getElementById('navToggle');
  const links = document.querySelectorAll('.navbar__links a');

  links.forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.classList.remove('is-active');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------- Resalta el link activo según la sección visible ---------- */
function initScrollSpy() {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const href = link.getAttribute('href') || '';
            link.classList.toggle('is-active', href.endsWith(`#${id}`));
          });
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ---------- Botón "volver arriba" ---------- */
function initBackToTop() {
  const btn = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    btn.classList.toggle('is-visible', window.scrollY > 500);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------- Formulario de contacto: validación e interacción ---------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  if (!form) return;

  const validators = {
    name: (value) => value.trim().length >= 3 || 'Ingresá tu nombre completo.',
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Ingresá un correo electrónico válido.',
    message: (value) => value.trim().length >= 10 || 'Contanos un poco más (mínimo 10 caracteres).',
  };

  const clearError = (fieldName) => {
    const group = form.querySelector(`[name="${fieldName}"]`).closest('.form-group');
    const errorEl = form.querySelector(`[data-error-for="${fieldName}"]`);
    group.classList.remove('has-error');
    if (errorEl) errorEl.textContent = '';
  };

  const setError = (fieldName, message) => {
    const group = form.querySelector(`[name="${fieldName}"]`).closest('.form-group');
    const errorEl = form.querySelector(`[data-error-for="${fieldName}"]`);
    group.classList.add('has-error');
    if (errorEl) errorEl.textContent = message;
  };

  const validateField = (fieldName) => {
    const field = form.querySelector(`[name="${fieldName}"]`);
    const validate = validators[fieldName];
    if (!validate) return true;

    const result = validate(field.value);
    if (result === true) {
      clearError(fieldName);
      return true;
    }
    setError(fieldName, result);
    return false;
  };

  Object.keys(validators).forEach((fieldName) => {
    const field = form.querySelector(`[name="${fieldName}"]`);
    field.addEventListener('blur', () => validateField(fieldName));
    field.addEventListener('input', () => clearError(fieldName));
  });

  // Si volvemos desde FormSubmit tras un envío exitoso, mostramos el mensaje de éxito.
  const params = new URLSearchParams(window.location.search);
  if (params.get('sent') === '1') {
    status.textContent = '¡Gracias! Recibimos tu consulta y te contactaremos pronto.';
    status.className = 'form-status success';
    params.delete('sent');
    const query = params.toString();
    const cleanUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
    window.history.replaceState({}, '', cleanUrl);
  }

  form.addEventListener('submit', (event) => {
    const fieldsValid = Object.keys(validators)
      .map((fieldName) => validateField(fieldName))
      .every(Boolean);

    if (!fieldsValid) {
      event.preventDefault();
      status.textContent = 'Revisá los campos marcados antes de continuar.';
      status.className = 'form-status error';
      return;
    }

    const nextField = form.querySelector('input[name="_next"]');
    if (nextField) {
      nextField.value = `${window.location.origin}${window.location.pathname}?sent=1#contacto`;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    // El formulario continúa su envío normal (sin preventDefault) hacia FormSubmit.
  });
}
