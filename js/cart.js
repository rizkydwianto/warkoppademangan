/**
 * CART.JS
 * Bug fixes:
 * 1. showCheckoutModal — klik overlay untuk tutup sekarang benar
 * 2. updateCartUI — badge display conflict dengan CSS diatasi
 * Bergantung pada: utils.js
 */

let cart = [];

/* ========================================
   CART OPERATIONS
   ======================================== */

function addToCart(item) {
  const existing = cart.find(c => c.id === item.id);
  if (existing) {
    existing.qty += 1;
    showToast('☕', `${item.name} ditambah lagi!`);
  } else {
    cart.push({ ...item, qty: 1 });
    showToast('✅', `${item.name} ditambahkan ke keranjang`);
  }
  updateCartUI();
  saveCartToStorage();
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id);
  } else {
    updateCartUI();
    saveCartToStorage();
  }
}

function removeFromCart(id) {
  const item = cart.find(c => c.id === id);
  cart = cart.filter(c => c.id !== id);
  if (item) showToast('🗑️', `${item.name} dihapus dari keranjang`);
  updateCartUI();
  saveCartToStorage();
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

/* ========================================
   CART UI RENDER
   ======================================== */
function updateCartUI() {
  const countEl     = document.getElementById('cart-count');
  const cartItemsEl = document.getElementById('cart-items');
  const cartFooter  = document.getElementById('cart-footer');
  const count       = getCartCount();

  // FIX: gunakan visibility lewat class, bukan inline style conflict
  countEl.textContent = count;
  if (count > 0) {
    countEl.style.display = 'flex';
    countEl.classList.add('pop');
    setTimeout(() => countEl.classList.remove('pop'), 300);
  } else {
    countEl.style.display = 'none';
  }

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">☕</div>
        <p>Keranjangmu masih kosong.<br/>Yuk pilih menu favoritmu!</p>
      </div>`;
    cartFooter.style.display = 'none';
    return;
  }

  cartFooter.style.display = 'block';

  cartItemsEl.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <img
        class="cart-item-img"
        src="${item.img}"
        alt="${item.name}"
        loading="lazy"
        onerror="this.src='https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=100&auto=format&fit=crop&q=60'"
      />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatRupiah(item.price)}</div>
        <div class="cart-item-controls">
          <button class="qty-btn qty-minus" data-id="${item.id}" aria-label="Kurangi ${item.name}">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn qty-plus" data-id="${item.id}" aria-label="Tambah ${item.name}">+</button>
        </div>
      </div>
      <div class="cart-item-right">
        <div class="cart-item-subtotal">${formatRupiah(item.price * item.qty)}</div>
        <button class="cart-item-delete" data-id="${item.id}" aria-label="Hapus ${item.name}">✕</button>
      </div>
    </div>`
  ).join('');

  // Event listeners
  cartItemsEl.querySelectorAll('.qty-minus').forEach(btn =>
    btn.addEventListener('click', () => changeQty(parseInt(btn.dataset.id), -1))
  );
  cartItemsEl.querySelectorAll('.qty-plus').forEach(btn =>
    btn.addEventListener('click', () => changeQty(parseInt(btn.dataset.id), +1))
  );
  cartItemsEl.querySelectorAll('.cart-item-delete').forEach(btn =>
    btn.addEventListener('click', () => removeFromCart(parseInt(btn.dataset.id)))
  );

  document.getElementById('cart-total').textContent = formatRupiah(getCartTotal());
}

/* ========================================
   CART OPEN / CLOSE
   ======================================== */
function openCart() {
  document.getElementById('cart-sidebar').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-sidebar').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* ========================================
   CHECKOUT MODAL
   ======================================== */
function handleCheckout() {
  if (cart.length === 0) return;
  const total     = formatRupiah(getCartTotal());
  const count     = getCartCount();
  const itemNames = cart.map(c => `${c.name} x${c.qty}`).join(', ');
  showCheckoutModal(count, total, itemNames);
}

function showCheckoutModal(count, total, items) {
  const existing = document.getElementById('checkout-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'checkout-modal';
  modal.innerHTML = `
    <div class="checkout-modal-overlay" id="checkout-overlay-bg">
      <div class="checkout-modal-box">
        <div class="checkout-modal-icon">🎉</div>
        <h3>Konfirmasi Pesanan</h3>
        <p class="checkout-modal-items">${items}</p>
        <div class="checkout-modal-total">
          <span>Total Pembayaran</span>
          <strong>${total}</strong>
        </div>
        <div class="checkout-modal-actions">
          <button class="btn-cancel-order" id="modal-cancel">Batalkan</button>
          <button class="btn-confirm-order" id="modal-confirm">✓ Konfirmasi Pesanan</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);

  // Animasi masuk (butuh 1 frame agar transition aktif)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      modal.querySelector('.checkout-modal-overlay').classList.add('visible');
    });
  });

  const closeModal = () => modal.remove();

  modal.querySelector('#modal-cancel').addEventListener('click', closeModal);

  // FIX: klik di luar box (pada overlay bg) untuk menutup
  modal.querySelector('#checkout-overlay-bg').addEventListener('click', (e) => {
    if (e.target.id === 'checkout-overlay-bg') closeModal();
  });

  modal.querySelector('#modal-confirm').addEventListener('click', () => {
    cart = [];
    updateCartUI();
    saveCartToStorage();
    closeCart();
    closeModal();
    showToast('🎉', `${count} item berhasil dipesan! Total: ${total}`, 4500);
  });
}

/* ========================================
   LOCAL STORAGE
   ======================================== */
function saveCartToStorage() {
  try {
    localStorage.setItem('warkop_cart', JSON.stringify(cart));
  } catch (e) { /* storage penuh atau private mode */ }
}

function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem('warkop_cart');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validasi: pastikan data array dan setiap item punya field wajib
      if (Array.isArray(parsed)) {
        cart = parsed.filter(item =>
          item && typeof item.id === 'number' &&
          typeof item.price === 'number' &&
          typeof item.qty === 'number' && item.qty > 0
        );
      }
      updateCartUI();
    }
  } catch (e) {
    cart = [];
  }
}

/* ========================================
   INIT
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('cart-btn').addEventListener('click', openCart);
  document.getElementById('cart-close').addEventListener('click', closeCart);
  document.getElementById('cart-overlay').addEventListener('click', closeCart);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });
  document.getElementById('checkout-btn').addEventListener('click', handleCheckout);
  loadCartFromStorage();
});
