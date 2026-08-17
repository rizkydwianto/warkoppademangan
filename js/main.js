/**
 * MAIN.JS
 * Orkestrasi utama website Warkop Pademangan.
 *
 * URUTAN EKSEKUSI:
 *   utils.js → data.js → menu.js → cart.js → main.js → testimonial.js → open-status.js
 *
 * PENTING:
 *   - showToast()          : global, dipanggil cart.js & main.js
 *   - initScrollAnimations : dipanggil di window 'load' BUKAN DOMContentLoaded
 *     agar semua elemen (menu cards + testi cards) sudah ada di DOM dulu
 */

/* ============================================================
   PRELOADER
   ============================================================ */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('fade-out');
      setTimeout(() => preloader.remove(), 500);
    }, 500);
  });
}

/* ============================================================
   NAVBAR — Scroll shrink & Active link highlight
   ============================================================ */
function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');

  if (!navbar) return;

  const onScroll = throttle(() => {
    // Shrink
    navbar.classList.toggle('scrolled', window.scrollY > 60);

    // Active link
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 130) {
        current = sec.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }, 100);

  window.addEventListener('scroll', onScroll, { passive: true });
  // Jalankan sekali supaya aktif saat halaman dimuat
  onScroll();
}

/* ============================================================
   HAMBURGER (Mobile)
   ============================================================ */
function initHamburger() {
  const navbar     = document.getElementById('navbar');
  const hamburger  = document.getElementById('hamburger');
  const navLinksEl = document.getElementById('nav-links');

  if (!hamburger || !navLinksEl) return;

  function openMenu() {
    hamburger.classList.add('open');
    navLinksEl.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    navLinksEl.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    hamburger.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Tutup saat link diklik
  navLinksEl.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Tutup saat klik di luar navbar
  document.addEventListener('click', (e) => {
    if (navbar && !navbar.contains(e.target)) {
      closeMenu();
    }
  });

  // Tutup saat ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

/* ============================================================
   HERO STATS — Counter animasi angka
   ============================================================ */
function initStatsCounter() {
  const stats = document.querySelectorAll('.stat-num');
  if (!stats.length) return;

  function animateCount(el, target, suffix) {
    const duration   = 1600;
    const stepMs     = 16;
    const totalSteps = duration / stepMs;
    const increment  = target / totalSteps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current) + suffix;
    }, stepMs);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      // Simpan nilai asli pertama kali
      if (!el.dataset.original) {
        el.dataset.original = el.textContent.trim();
      }
      const text   = el.dataset.original;
      const num    = parseInt(text);
      const suffix = text.replace(String(num), '');
      animateCount(el, num, suffix);
      observer.unobserve(el);
    });
  }, { threshold: 0.6 });

  stats.forEach(el => observer.observe(el));
}

/* ============================================================
   CONTACT FORM — Validasi + simulasi kirim
   ============================================================ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  // Helper: tampilkan error pada field
  function setFieldError(field, hasError) {
    if (hasError) {
      field.classList.add('error');
    } else {
      field.classList.remove('error');
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const namaEl  = document.getElementById('nama');
    const emailEl = document.getElementById('email');
    const pesanEl = document.getElementById('pesan');

    const nama  = namaEl.value.trim();
    const email = emailEl.value.trim();
    const pesan = pesanEl.value.trim();

    // Reset error
    [namaEl, emailEl, pesanEl].forEach(el => setFieldError(el, false));

    let hasError = false;

    if (!nama)  { setFieldError(namaEl,  true); hasError = true; }
    if (!email) { setFieldError(emailEl, true); hasError = true; }
    if (!pesan) { setFieldError(pesanEl, true); hasError = true; }

    if (hasError) {
      showToast('⚠️', 'Mohon lengkapi semua field yang wajib diisi!');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFieldError(emailEl, true);
      showToast('⚠️', 'Format email tidak valid!');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const originalHTML = btn.innerHTML;
    btn.textContent = '⏳ Mengirim...';
    btn.disabled = true;

    setTimeout(() => {
      showToast('✉️', `Pesan dari ${nama} berhasil dikirim!`, 3500);
      form.reset();
      btn.innerHTML = originalHTML;
      btn.disabled  = false;
    }, 1400);
  });

  // Hapus class error saat user mulai mengetik
  form.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => el.classList.remove('error'));
  });
}

/* ============================================================
   SCROLL ANIMATIONS (Fade-in-up)
   FIX: Dipanggil di window 'load' agar semua elemen JS-rendered sudah ada
   ============================================================ */
function initScrollAnimations() {
  const selectors = [
    '.menu-card',
    '.about-feature',
    '.contact-card',
    '.footer-col',
    '.testi-card',
    '.promo-card'
  ];

  // Pilih elemen yang belum punya .fade-in-up
  const targets = document.querySelectorAll(
    selectors.map(s => `${s}:not(.fade-in-up)`).join(', ')
  );

  if (!targets.length) return;

  targets.forEach(el => el.classList.add('fade-in-up'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 65);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  targets.forEach(el => observer.observe(el));
}

/* ============================================================
   BACK TO TOP
   ============================================================ */
function initBackToTop() {
  if (document.getElementById('back-to-top')) return;

  const btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.innerHTML = '↑';
  btn.setAttribute('aria-label', 'Kembali ke atas');
  document.body.appendChild(btn);

  window.addEventListener('scroll', throttle(() => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, 100), { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   PROMO BANNER MARQUEE — duplikasi untuk loop mulus
   ============================================================ */
function initPromoBanner() {
  const track = document.querySelector('#promo-banner .promo-track');
  if (!track || track.dataset.duplicated) return;

  track.innerHTML += track.innerHTML;
  track.dataset.duplicated = 'true';
}

/* ============================================================
   INIT — DOMContentLoaded untuk setup UI
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initNavbar();
  initHamburger();
  initStatsCounter();
  initContactForm();
  initBackToTop();
  initPromoBanner();

  console.log('%c☕ Warkop Pademangan', 'color:#D4A373;font-size:20px;font-weight:800;');
  console.log('%cWebsite siap. Selamat ngopi! 🙌', 'color:#E07A5F;font-size:13px;');
});

/* ============================================================
   INIT SCROLL ANIMATIONS — window 'load'
   HARUS setelah DOMContentLoaded agar menu.js & testimonial.js
   sudah selesai merender kartu ke DOM
   ============================================================ */
window.addEventListener('load', () => {
  initScrollAnimations();
});
