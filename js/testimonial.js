/**
 * TESTIMONIAL.JS
 * Render kartu testimoni ke #testi-grid.
 * Animasi scroll dihandle oleh main.js via window 'load'.
 */

const testimonials = [
  {
    name: "Budi Santoso",
    role: "Pelanggan Tetap",
    text: "Sudah 5 tahun jadi langganan. Kopi hitamnya mantap banget, gak ada yang bisa ngalahin! Harganya juga tetap murah meski bertahun-tahun.",
    stars: 5,
    initial: "B"
  },
  {
    name: "Siti Rahayu",
    role: "Ibu Rumah Tangga",
    text: "Suka banget sama suasananya, homey dan nyaman. Roti bakar coklat sama kopi susunya jadi menu favorit keluarga kalau ke sini.",
    stars: 5,
    initial: "S"
  },
  {
    name: "Deni Hermawan",
    role: "Mahasiswa",
    text: "Warkop paling enak buat ngerjain tugas sambil ngopi. WiFi-nya kenceng, kopinya enak, harganya ramah di kantong mahasiswa.",
    stars: 5,
    initial: "D"
  },
  {
    name: "Rina Marlina",
    role: "Karyawan Swasta",
    text: "Sarapan di sini sudah jadi rutinitas sebelum kerja. Nasi goreng + kopi hitamnya bikin semangat. Pelayanan cepat dan ramah.",
    stars: 5,
    initial: "R"
  },
  {
    name: "Agus Prasetyo",
    role: "Driver Ojek Online",
    text: "Tempat nongkrong paling asik se-Pademangan. Murah, enak, dan nggak pernah sepi. Kopi susunya nagih terus!",
    stars: 4,
    initial: "A"
  },
  {
    name: "Maya Kusuma",
    role: "Blogger Kuliner",
    text: "Sudah review banyak warkop, tapi Warkop Pademangan selalu punya tempat khusus di hati. Autentik dan konsisten!",
    stars: 5,
    initial: "M"
  }
];

/**
 * Render bintang ⭐ berdasarkan angka rating
 * @param {number} count  1–5
 * @returns {string}
 */
function renderStars(count) {
  const n = Math.min(Math.max(0, count), 5);
  return '⭐'.repeat(n) + '☆'.repeat(5 - n);
}

/**
 * Render semua kartu testimoni ke #testi-grid
 */
function renderTestimonials() {
  const grid = document.getElementById('testi-grid');
  if (!grid) return;

  grid.innerHTML = testimonials.map(t => `
    <div class="testi-card">
      <div class="testi-stars" aria-label="${t.stars} dari 5 bintang">${renderStars(t.stars)}</div>
      <p class="testi-text">${t.text}</p>
      <div class="testi-author">
        <div class="testi-avatar-placeholder" aria-hidden="true">${t.initial}</div>
        <div>
          <span class="testi-name">${t.name}</span>
          <span class="testi-role">${t.role}</span>
        </div>
      </div>
    </div>`
  ).join('');
}

// Render saat DOM siap — sebelum window 'load' agar kartu sudah ada
// saat initScrollAnimations() di main.js dijalankan
document.addEventListener('DOMContentLoaded', renderTestimonials);
