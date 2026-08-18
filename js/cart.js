/**
 * CART.JS
 * Warkop Pademangan
 *
 * Bergantung pada:
 * - utils.js
 * - main.js -> showToast()
 */

/* ========================================
   CART STATE
======================================== */

let cart = [];

/* ========================================
   CART OPERATIONS
======================================== */

function addToCart(item) {
  if (!item || typeof item.id !== "number") {
    console.error("Item menu tidak valid:", item);
    return;
  }

  const existing = cart.find((c) => c.id === item.id);

  if (existing) {
    existing.qty += 1;
    showToast("☕", `${item.name} ditambah lagi!`);
  } else {
    cart.push({
      ...item,
      qty: 1,
    });

    showToast("✅", `${item.name} ditambahkan ke keranjang`);
  }

  updateCartUI();
  saveCartToStorage();
}

function changeQty(id, delta) {
  const item = cart.find((c) => c.id === id);

  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    removeFromCart(id);
    return;
  }

  updateCartUI();
  saveCartToStorage();
}

function removeFromCart(id) {
  const item = cart.find((c) => c.id === id);

  cart = cart.filter((c) => c.id !== id);

  if (item) {
    showToast("🗑️", `${item.name} dihapus dari keranjang`);
  }

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
   CART UI
======================================== */

function updateCartUI() {
  const countEl = document.getElementById("cart-count");
  const cartItemsEl = document.getElementById("cart-items");
  const cartFooter = document.getElementById("cart-footer");
  const totalEl = document.getElementById("cart-total");

  if (!countEl || !cartItemsEl || !cartFooter || !totalEl) {
    console.error("Element cart tidak ditemukan.");
    return;
  }

  const count = getCartCount();

  /* ================================
     CART BADGE
  ================================= */

  countEl.textContent = count;

  if (count > 0) {
    countEl.style.display = "flex";

    countEl.classList.remove("pop");

    // Trigger ulang animasi
    void countEl.offsetWidth;

    countEl.classList.add("pop");

    setTimeout(() => {
      countEl.classList.remove("pop");
    }, 300);
  } else {
    countEl.style.display = "none";
  }

  /* ================================
     EMPTY CART
  ================================= */

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon" aria-hidden="true">
          ☕
        </div>

        <p>
          Keranjangmu masih kosong.<br>
          Yuk pilih menu favoritmu!
        </p>
      </div>
    `;

    cartFooter.style.display = "none";

    return;
  }

  /* ================================
     CART FOOTER
  ================================= */

  cartFooter.style.display = "block";

  /* ================================
     CART ITEMS
  ================================= */

  cartItemsEl.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-item" data-id="${item.id}">

          <img
            class="cart-item-img"
            src="${item.img}"
            alt="${item.name}"
            loading="lazy"
            onerror="
              this.src='https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=100&auto=format&fit=crop&q=60'
            "
          >

          <div class="cart-item-info">

            <div class="cart-item-name">
              ${item.name}
            </div>

            <div class="cart-item-price">
              ${formatRupiah(item.price)}
            </div>

            <div class="cart-item-controls">

              <button
                type="button"
                class="qty-btn qty-minus"
                data-id="${item.id}"
                aria-label="Kurangi ${item.name}"
              >
                −
              </button>

              <span class="qty-num">
                ${item.qty}
              </span>

              <button
                type="button"
                class="qty-btn qty-plus"
                data-id="${item.id}"
                aria-label="Tambah ${item.name}"
              >
                +
              </button>

            </div>

          </div>

          <div class="cart-item-right">

            <div class="cart-item-subtotal">
              ${formatRupiah(item.price * item.qty)}
            </div>

            <button
              type="button"
              class="cart-item-delete"
              data-id="${item.id}"
              aria-label="Hapus ${item.name}"
            >
              ✕
            </button>

          </div>

        </div>
      `,
    )
    .join("");

  /* ================================
     QUANTITY MINUS
  ================================= */

  cartItemsEl.querySelectorAll(".qty-minus").forEach((btn) => {
    btn.addEventListener("click", () => {
      changeQty(Number(btn.dataset.id), -1);
    });
  });

  /* ================================
     QUANTITY PLUS
  ================================= */

  cartItemsEl.querySelectorAll(".qty-plus").forEach((btn) => {
    btn.addEventListener("click", () => {
      changeQty(Number(btn.dataset.id), 1);
    });
  });

  /* ================================
     DELETE
  ================================= */

  cartItemsEl.querySelectorAll(".cart-item-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      removeFromCart(Number(btn.dataset.id));
    });
  });

  /* ================================
     TOTAL
  ================================= */

  totalEl.textContent = formatRupiah(getCartTotal());
}

/* ========================================
   CART OPEN / CLOSE
======================================== */

function openCart() {
  const sidebar = document.getElementById("cart-sidebar");
  const overlay = document.getElementById("cart-overlay");

  if (!sidebar || !overlay) return;

  sidebar.classList.add("open");
  overlay.classList.add("open");

  document.body.style.overflow = "hidden";
}

function closeCart() {
  const sidebar = document.getElementById("cart-sidebar");
  const overlay = document.getElementById("cart-overlay");

  if (!sidebar || !overlay) return;

  sidebar.classList.remove("open");
  overlay.classList.remove("open");

  document.body.style.overflow = "";
}

/* ========================================
   CHECKOUT
======================================== */

function handleCheckout() {
  if (cart.length === 0) {
    showToast("🛒", "Keranjang masih kosong.");
    return;
  }

  const formContainer = document.getElementById("checkout-form-container");

  if (!formContainer) {
    console.error("Form checkout tidak ditemukan.");
    return;
  }

  formContainer.style.display = "block";

  formContainer.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

/* ========================================
   SUBMIT CHECKOUT
======================================== */

function handleCheckoutSubmit(event) {
  event.preventDefault();

  if (cart.length === 0) {
    showToast("🛒", "Keranjang masih kosong.");
    return;
  }

  const name = document.getElementById("customerName")?.value.trim();

  const phone = document.getElementById("customerPhone")?.value.trim();

  const address = document.getElementById("customerAddress")?.value.trim();

  /* ================================
     VALIDATION
  ================================= */

  if (!name) {
    showToast("⚠️", "Nama pelanggan wajib diisi.");
    return;
  }

  if (!phone) {
    showToast("⚠️", "Nomor WhatsApp wajib diisi.");
    return;
  }

  if (!address) {
    showToast("⚠️", "Alamat pengiriman wajib diisi.");
    return;
  }

  /* ================================
     BUAT DETAIL PESANAN
  ================================= */

  const orderItems = cart
    .map(
      (item, index) =>
        `${index + 1}. ${item.name} x${item.qty} = ${formatRupiah(
          item.price * item.qty,
        )}`,
    )
    .join("\n");

  const total = getCartTotal();

  /* ================================
     NOMOR WHATSAPP ADMIN
     GANTI DENGAN NOMOR ASLI
  ================================= */

  const adminWhatsApp = "6288212815533";

  const message = `
Halo Warkop Pademangan 👋

Saya ingin melakukan pemesanan.

*DATA PELANGGAN*
Nama: ${name}
No. WhatsApp: ${phone}

*ALAMAT PENGIRIMAN*
${address}

*DETAIL PESANAN*
${orderItems}

*TOTAL*
${formatRupiah(total)}

Mohon konfirmasi pesanan saya.

Terima kasih ☕
`.trim();

  /* ================================
     BUKA WHATSAPP
  ================================= */

  const whatsappURL = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(
    message,
  )}`;

  window.open(whatsappURL, "_blank", "noopener,noreferrer");

  /* ================================
     RESET CART
  ================================= */

  cart = [];

  updateCartUI();
  saveCartToStorage();

  /* ================================
     RESET FORM
  ================================= */

  event.target.reset();

  const formContainer = document.getElementById("checkout-form-container");

  if (formContainer) {
    formContainer.style.display = "none";
  }

  showToast("🎉", "Pesanan siap dikirim ke WhatsApp!");
}

/* ========================================
   LOCAL STORAGE
======================================== */

function saveCartToStorage() {
  try {
    localStorage.setItem("warkop_cart", JSON.stringify(cart));
  } catch (error) {
    console.warn("Gagal menyimpan keranjang:", error);
  }
}

function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem("warkop_cart");

    if (!saved) {
      updateCartUI();
      return;
    }

    const parsed = JSON.parse(saved);

    if (Array.isArray(parsed)) {
      cart = parsed.filter(
        (item) =>
          item &&
          typeof item.id === "number" &&
          typeof item.price === "number" &&
          typeof item.qty === "number" &&
          item.qty > 0,
      );
    } else {
      cart = [];
    }

    updateCartUI();
  } catch (error) {
    console.warn("Data keranjang rusak, keranjang dikosongkan.");

    cart = [];
    updateCartUI();
    saveCartToStorage();
  }
}

/* ========================================
   BACK TO CART
======================================== */

function backToCart() {
  const formContainer = document.getElementById("checkout-form-container");

  if (!formContainer) return;

  // Sembunyikan formulir checkout
  formContainer.style.display = "none";

  // Pastikan daftar keranjang ditampilkan
  const cartItemsEl = document.getElementById("cart-items");

  if (cartItemsEl) {
    cartItemsEl.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

/* ========================================
   INIT
======================================== */

document.addEventListener("DOMContentLoaded", () => {
  const cartBtn = document.getElementById("cart-btn");

  const cartClose = document.getElementById("cart-close");

  const cartOverlay = document.getElementById("cart-overlay");

  const checkoutBtn = document.getElementById("checkout-btn");

  const checkoutForm = document.getElementById("checkoutForm");

  const backToCartBtn = document.getElementById("back-to-cart");

  /* ================================
       CART BUTTON
    ================================= */

  if (cartBtn) {
    cartBtn.addEventListener("click", openCart);
  }

  /* ================================
       CLOSE BUTTON
    ================================= */

  if (cartClose) {
    cartClose.addEventListener("click", closeCart);
  }

  /* ================================
       OVERLAY
    ================================= */

  if (cartOverlay) {
    cartOverlay.addEventListener("click", closeCart);
  }

  /* ================================
       ESCAPE
    ================================= */

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCart();
    }
  });

  /* ================================
       CHECKOUT BUTTON
    ================================= */

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", handleCheckout);
  }

  /* ================================
       BACK TO CART
    ================================= */

  if (backToCartBtn) {
    backToCartBtn.addEventListener("click", backToCart);
  }

  /* ================================
       CHECKOUT FORM
    ================================= */

  if (checkoutForm) {
    checkoutForm.addEventListener("submit", handleCheckoutSubmit);
  }

  /* ================================
       LOAD CART
    ================================= */

  loadCartFromStorage();
});
