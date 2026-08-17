/**
 * OPEN-STATUS.JS
 * FIX: Logika pengecekan jam buka/tutup diperbaiki.
 * Kasus yang diperbaiki:
 *   - openIn bisa negatif jika sudah lewat jam buka tapi belum tutup (= sedang buka)
 *   - close: 24 dikonversi agar tidak melewati tengah malam dengan benar
 */

const operationalHours = {
  0: { open: 7,  close: 24 }, // Minggu
  1: { open: 6,  close: 23 }, // Senin
  2: { open: 6,  close: 23 }, // Selasa
  3: { open: 6,  close: 23 }, // Rabu
  4: { open: 6,  close: 23 }, // Kamis
  5: { open: 6,  close: 23 }, // Jumat
  6: { open: 7,  close: 24 }  // Sabtu
};

/**
 * FIX: jam dinyatakan sebagai desimal (misal 14.5 = 14:30)
 * close: 24 artinya tengah malam, aman untuk < 24 check
 * @returns {{ isOpen: boolean, message: string }}
 */
function checkOpenStatus() {
  const now    = new Date();
  const day    = now.getDay();
  const hour   = now.getHours() + now.getMinutes() / 60; // desimal jam sekarang
  const hours  = operationalHours[day];

  // FIX: isOpen benar — hour >= open DAN hour < close
  const isOpen   = hour >= hours.open && hour < hours.close;
  const closeIn  = hours.close - hour; // sisa jam sampai tutup (hanya valid saat buka)

  let message = '';

  if (isOpen) {
    if (closeIn <= 1) {
      // Hampir tutup — tampilkan menit
      message = `🟡 Segera tutup (${Math.round(closeIn * 60)} menit lagi)`;
    } else {
      const closeHour = String(hours.close === 24 ? 0 : hours.close).padStart(2, '0');
      message = `🟢 Sedang Buka · Tutup pukul ${closeHour}.00`;
    }
  } else {
    // FIX: cukup cek apakah jam buka hari ini masih di depan
    if (hour < hours.open) {
      // Belum buka hari ini
      message = `🔴 Tutup · Buka pukul ${String(hours.open).padStart(2, '0')}.00`;
    } else {
      // Sudah tutup, tampilkan jam buka besok
      const tomorrowDay   = (day + 1) % 7;
      const tomorrowHours = operationalHours[tomorrowDay];
      message = `🔴 Sudah Tutup · Buka besok pukul ${String(tomorrowHours.open).padStart(2, '0')}.00`;
    }
  }

  return { isOpen, message };
}

function updateOpenStatus() {
  const el = document.getElementById('open-status');
  if (!el) return;
  const { message } = checkOpenStatus();
  el.textContent = message;
}

document.addEventListener('DOMContentLoaded', () => {
  updateOpenStatus();
  setInterval(updateOpenStatus, 60 * 1000);
});
