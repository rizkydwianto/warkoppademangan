/**
 * UTILS.JS
 * Fungsi utilitas global — di-load PERTAMA sebelum semua modul lain.
 * Berisi: formatRupiah, throttle, debounce, showToast
 */

/* ---- Format Rupiah ---- */
function formatRupiah(price) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price);
}

/* ---- Debounce ---- */
function debounce(fn, delay = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* ---- Throttle ---- */
function throttle(fn, limit = 100) {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn(...args);
    }
  };
}

/* ---- Toast Notification (global, dipakai cart.js & main.js) ---- */
let _toastTimeout = null;

function showToast(icon, msg, duration = 2800) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  const toastIcon = toast.querySelector('.toast-icon');
  const toastMsg  = toast.querySelector('.toast-msg');

  if (toastIcon) toastIcon.textContent = icon;
  if (toastMsg)  toastMsg.textContent  = msg;

  if (_toastTimeout) clearTimeout(_toastTimeout);
  toast.classList.add('show');

  _toastTimeout = setTimeout(() => toast.classList.remove('show'), duration);
}
