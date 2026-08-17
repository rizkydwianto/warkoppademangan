/**
 * MENU.JS
 * FIX: Tidak memanggil initScrollAnimations() sendiri.
 * Animasi dihandle oleh main.js setelah DOMContentLoaded.
 * Bergantung pada: utils.js, data.js, cart.js
 */

/**
 * Buat HTML card untuk satu item menu
 * @param {Object} item
 * @returns {string}
 */
function createMenuCard(item) {
  return `
    <div class="menu-card" data-category="${item.category}" data-id="${item.id}" role="listitem">
      <div class="menu-card-img">
        <img
          src="${item.img}"
          alt="${item.name}"
          loading="lazy"
          width="400" height="210"
          onerror="this.src='https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&auto=format&fit=crop&q=60'"
        />
        <span class="menu-card-badge">${item.badge}</span>
      </div>
      <div class="menu-card-body">
        <h3 class="menu-card-name">${item.name}</h3>
        <p class="menu-card-desc">${item.desc}</p>
        <div class="menu-card-footer">
          <span class="menu-card-price">${formatRupiah(item.price)}</span>
          <button
            class="add-to-cart"
            data-id="${item.id}"
            aria-label="Tambah ${item.name} ke keranjang"
          >+ Tambah</button>
        </div>
      </div>
    </div>`;
}

/**
 * Pasang event listener tombol "Tambah ke Keranjang"
 * Dipanggil setelah grid di-render.
 */
function bindAddToCartButtons() {
  const grid = document.getElementById('menu-grid');
  if (!grid) return;

  grid.querySelectorAll('.add-to-cart').forEach(btn => {
    // Hapus listener lama jika ada (cegah double-bind)
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', () => {
      const id   = parseInt(newBtn.dataset.id);
      const item = menuItems.find(m => m.id === id);
      if (!item) return;

      addToCart(item);

      // Feedback visual tombol
      newBtn.textContent = '✓ Ditambah!';
      newBtn.style.background = '#4caf50';
      newBtn.disabled = true;
      setTimeout(() => {
        newBtn.textContent = '+ Tambah';
        newBtn.style.background = '';
        newBtn.disabled = false;
      }, 1200);
    });
  });
}

/**
 * Render semua kartu menu ke #menu-grid
 */
function renderMenuCards() {
  const grid = document.getElementById('menu-grid');
  if (!grid) return;

  grid.innerHTML = menuItems.map(item => createMenuCard(item)).join('');
  bindAddToCartButtons();
}

/**
 * Inisialisasi filter tombol kategori
 */
function initFilterButtons() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const menuGrid   = document.getElementById('menu-grid');
  if (!menuGrid) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      const cards  = menuGrid.querySelectorAll('.menu-card');

      cards.forEach((card, i) => {
        const match = filter === 'all' || card.dataset.category === filter;

        if (match) {
          card.classList.remove('hidden');
          // Re-trigger animasi masuk dengan stagger
          card.style.animation = 'none';
          void card.offsetHeight; // force reflow
          card.style.animationDelay = `${i * 40}ms`;
          card.style.animation = 'fadeInUp .35s ease forwards';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderMenuCards();
  initFilterButtons();
});
