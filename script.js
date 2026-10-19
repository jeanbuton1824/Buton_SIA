const products = [
  {
    id: 1,
    name: "Matte Lipstick",
    category: "lips",
    categoryName: "Lips",
    price: 350,
    rating: "4.9",
    description: "Velvety color that stays soft from first coffee to last call.",
    details: "A comfortable, richly pigmented matte with a soft-focus finish. Swipe on one layer for a just-bitten tint or build it up for a little more drama.",
    image: "photo-1586495777744-4413f21062fa",
    badge: "BEST LOVED",
    essential: true
  },
  {
    id: 2,
    name: "Liquid Foundation",
    category: "face",
    categoryName: "Face",
    price: 250,
    rating: "4.8",
    description: "A breathable, blendable base for your kind of coverage.",
    details: "A lightweight liquid base designed to blend with your routine. Build coverage where you like it and keep the finish looking like skin.",
    image: "photo-1611930022073-b7a4ba5fcccd",
    badge: "EVERYDAY",
    essential: true
  },
  {
    id: 3,
    name: "Waterproof Mascara",
    category: "eyes",
    categoryName: "Eyes",
    price: 300,
    rating: "4.8",
    description: "Lift, define, and let your lashes do their thing.",
    details: "A defining mascara that adds a lifted look with an easy-to-layer formula. Made for long days and whatever the weather has in mind.",
    image: "photo-1522335789203-aabd1fc54bc9",
    badge: "WATERPROOF",
    essential: true
  },
  {
    id: 4,
    name: "Eyeshadow Palette",
    category: "eyes",
    categoryName: "Eyes",
    price: 200,
    rating: "4.7",
    description: "A mix of easy neutrals for soft days and bold nights.",
    details: "A compact edit of blendable matte and luminous shades. Wear one wash of color or layer a few together to make the look your own.",
    image: "photo-1596462502278-27bfdc403348",
    badge: "COLOR STORY",
    essential: false
  },
  {
    id: 5,
    name: "Blush",
    category: "face",
    categoryName: "Face",
    price: 280,
    rating: "4.9",
    description: "A fresh flush that blends in like the best kind of secret.",
    details: "A buildable cheek color with a soft, skin-like finish. Tap onto the apples of your cheeks and blend out with fingertips or your favorite brush.",
    image: "photo-1512496015851-a90fb38ba796",
    badge: "SOFT FLUSH",
    essential: false
  },
  {
    id: 6,
    name: "Highlighter",
    category: "face",
    categoryName: "Face",
    price: 180,
    rating: "4.6",
    description: "A soft-catching sheen for wherever the light lands.",
    details: "A fine, light-reflecting powder that adds a subtle gleam without overpowering your look. Sweep onto the high points of your face.",
    image: "photo-1608248543803-ba4f8c70ae0b",
    badge: "NEW GLOW",
    essential: false
  },
  {
    id: 7,
    name: "Eyeliner",
    category: "eyes",
    categoryName: "Eyes",
    price: 150,
    rating: "4.7",
    description: "A smooth, precise line to take your look anywhere.",
    details: "A fuss-free liner for a fine definition or a little flick. The smooth tip makes it easy to keep things subtle or turn up the look.",
    image: "photo-1617220374588-9e8b7c91d166",
    badge: "EASY DOES IT",
    essential: false
  },
  {
    id: 8,
    name: "Lip Gloss",
    category: "lips",
    categoryName: "Lips",
    price: 220,
    rating: "4.8",
    description: "A cushiony swipe of shine with a hint of feel-good color.",
    details: "A smooth, non-sticky gloss that adds a comfortable wash of shine. Wear it solo or layer over your favorite lip color.",
    image: "photo-1601049541289-9b1b7bbbfe19",
    badge: "JUICY SHINE",
    essential: true
  }
];

const storageKeys = {
  cart: "glowBeautyCart",
  accounts: "glowBeautyDemoAccounts",
  session: "glowBeautyDemoSession"
};

const productGrid = document.querySelector("#product-grid");
const productCount = document.querySelector("#product-count");
const emptyProducts = document.querySelector("#empty-products");
const cartDialog = document.querySelector("#cart-dialog");
const authDialog = document.querySelector("#auth-dialog");
const productDialog = document.querySelector("#product-dialog");
const checkoutDialog = document.querySelector("#checkout-dialog");
const cartItems = document.querySelector("#cart-items");
const cartCount = document.querySelector("#cart-count");
const toast = document.querySelector("#toast-region");
const searchInput = document.querySelector("#product-search");
const mainNav = document.querySelector("#main-nav");
const menuToggle = document.querySelector("#menu-toggle");
const header = document.querySelector(".site-header");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pageParameters = new URLSearchParams(window.location.search);
const validCategories = ["all", "lips", "face", "eyes", "essentials"];

let selectedCategory = validCategories.includes(pageParameters.get("category")) ? pageParameters.get("category") : "all";
let searchTerm = pageParameters.get("q") || "";
let cart = readCartStorage();
let currentUser = restoreSession();
let toastTimeout;
let revealObserver;

if (searchInput) searchInput.value = searchTerm;

function formatPrice(amount) {
  return `₱${Number(amount).toLocaleString("en-PH")}`;
}

function filterProducts() {
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();

  return products.filter((product) => {
    const matchesCategory = selectedCategory === "all"
      || product.category === selectedCategory
      || (selectedCategory === "essentials" && product.essential);
    const matchesSearch = !normalizedSearch
      || `${product.name} ${product.categoryName} ${product.description}`.toLocaleLowerCase().includes(normalizedSearch);

    return matchesCategory && matchesSearch;
  });
}

function renderProducts() {
  if (!productGrid) return;

  const visibleProducts = filterProducts();

  productGrid.innerHTML = visibleProducts.map((product) => `
    <article class="product-card reveal">
      <div class="product-image">
        <img src="https://images.unsplash.com/${product.image}?auto=format&fit=crop&w=700&q=82" alt="${product.name}" loading="lazy" data-image-fallback>
        <span class="product-badge">${product.badge}</span>
        <button class="quick-view" type="button" data-product-details="${product.id}" aria-label="View details for ${product.name}">Quick view</button>
      </div>
      <div class="product-info">
        <div class="product-meta"><span>${product.categoryName}</span><span class="product-rating" aria-label="Rated ${product.rating} out of 5">★ ${product.rating}</span></div>
        <h3>${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-bottom"><strong class="product-price">${formatPrice(product.price)}</strong><button class="add-button" type="button" data-add-cart="${product.id}" aria-label="Add ${product.name} to bag"><span aria-hidden="true">+</span> Add to bag</button></div>
      </div>
    </article>
  `).join("");

  productCount.textContent = `${visibleProducts.length} ${visibleProducts.length === 1 ? "find" : "finds"}`;
  emptyProducts.hidden = visibleProducts.length !== 0;
  document.querySelectorAll("[data-filter]").forEach((button) => {
    const isActive = button.dataset.filter === selectedCategory;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  observeRevealElements(productGrid);
}

function setCategory(category, shouldScroll = false) {
  selectedCategory = category;
  renderProducts();

  if (shouldScroll && document.querySelector("#shop")) {
    document.querySelector("#shop").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }
}

function readCartStorage() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKeys.cart) || "{}");
    if (!stored || typeof stored !== "object" || Array.isArray(stored)) return {};

    return Object.fromEntries(Object.entries(stored)
      .filter(([id, quantity]) => products.some((product) => product.id === Number(id)) && Number.isSafeInteger(quantity) && quantity > 0)
      .map(([id, quantity]) => [id, Math.min(quantity, 99)]));
  } catch {
    return {};
  }
}

function saveCart() {
  try {
    localStorage.setItem(storageKeys.cart, JSON.stringify(cart));
  } catch {
    showToast("Your bag is available for this visit, but browser storage is unavailable.", "error");
  }
}

function addToCart(productId) {
  const product = products.find((item) => item.id === Number(productId));
  if (!product) return;

  cart[product.id] = Math.min((cart[product.id] || 0) + 1, 99);
  saveCart();
  updateCart();
  showToast(`${product.name} added to your bag.`);
}

function removeFromCart(productId) {
  delete cart[productId];
  saveCart();
  updateCart();
}

function clearCart() {
  cart = {};
  saveCart();
  updateCart();
  showToast("Your bag is clear.");
}

function calculateSubtotal() {
  return Object.entries(cart).reduce((total, [productId, quantity]) => {
    const product = products.find((item) => item.id === Number(productId));
    return product ? total + product.price * quantity : total;
  }, 0);
}

function calculateShipping() {
  const subtotal = calculateSubtotal();
  return subtotal === 0 || subtotal > 1500 ? 0 : 80;
}

function calculateTotal() {
  return calculateSubtotal() + calculateShipping();
}

function updateCart() {
  if (!cartCount || !cartItems) return;

  const entries = Object.entries(cart)
    .map(([productId, quantity]) => ({
      product: products.find((item) => item.id === Number(productId)),
      quantity
    }))
    .filter((entry) => entry.product);
  const itemCount = entries.reduce((total, entry) => total + entry.quantity, 0);
  const isEmpty = entries.length === 0;

  cartCount.textContent = String(itemCount);
  document.querySelector("#cart-open").setAttribute("aria-label", `Open shopping bag, ${itemCount} ${itemCount === 1 ? "item" : "items"}`);
  document.querySelector("#cart-title-count").textContent = `(${itemCount})`;
  document.querySelector("#empty-cart").hidden = !isEmpty;
  document.querySelector("#cart-footer").hidden = isEmpty;
  cartItems.hidden = isEmpty;
  cartItems.innerHTML = entries.map(({ product, quantity }) => `
    <article class="cart-item">
      <img src="https://images.unsplash.com/${product.image}?auto=format&fit=crop&w=180&q=75" alt="" loading="lazy" data-image-fallback>
      <div class="cart-item-copy">
        <small>${product.categoryName}</small><strong>${product.name}</strong><span class="item-price">${formatPrice(product.price)}</span>
        <div class="quantity-control" aria-label="Quantity for ${product.name}">
          <button type="button" data-cart-action="decrease" data-product-id="${product.id}" aria-label="Decrease ${product.name} quantity">−</button>
          <span>${quantity}</span>
          <button type="button" data-cart-action="increase" data-product-id="${product.id}" aria-label="Increase ${product.name} quantity">+</button>
        </div>
      </div>
      <div class="cart-item-side"><strong>${formatPrice(product.price * quantity)}</strong><button class="remove-item" type="button" data-cart-action="remove" data-product-id="${product.id}">Remove</button></div>
    </article>
  `).join("");

  document.querySelector("#cart-subtotal").textContent = formatPrice(calculateSubtotal());
  document.querySelector("#cart-shipping").textContent = calculateShipping() === 0 ? "Free" : formatPrice(calculateShipping());
  document.querySelector("#cart-total").textContent = formatPrice(calculateTotal());
  renderCheckoutSummary();
}

function renderCheckoutSummary() {
  const checkoutItems = document.querySelector("#checkout-items");
  if (!checkoutItems) return;

  checkoutItems.innerHTML = Object.entries(cart).map(([productId, quantity]) => {
    const product = products.find((item) => item.id === Number(productId));
    if (!product) return "";
    return `<div class="checkout-line"><span>${product.name} × ${quantity}</span><strong>${formatPrice(product.price * quantity)}</strong></div>`;
  }).join("");
  document.querySelector("#checkout-subtotal").textContent = formatPrice(calculateSubtotal());
  document.querySelector("#checkout-shipping").textContent = calculateShipping() === 0 ? "Free" : formatPrice(calculateShipping());
  document.querySelector("#checkout-total").textContent = formatPrice(calculateTotal());
}

function openProductDetails(productId) {
  const product = products.find((item) => item.id === Number(productId));
  if (!product) return;

  document.querySelector("#product-detail-content").innerHTML = `
    <img src="https://images.unsplash.com/${product.image}?auto=format&fit=crop&w=800&q=85" alt="${product.name}" data-image-fallback>
    <div class="detail-copy">
      <p class="eyebrow"><span class="eyebrow-line"></span> ${product.categoryName.toUpperCase()}</p>
      <h2 id="detail-title">${product.name}</h2>
      <p class="detail-rating">★ ${product.rating} <span>·</span> A GLOW BEAUTY favorite</p>
      <p>${product.details}</p>
      <strong class="detail-price">${formatPrice(product.price)}</strong>
      <button class="button button-primary" type="button" data-detail-add="${product.id}">Add to bag <span aria-hidden="true">↗</span></button>
    </div>
  `;
  productDialog.showModal();
}

function openDialog(dialog) {
  if (dialog && !dialog.open) dialog.showModal();
}

function setAuthView(view) {
  const isSignup = view === "signup";
  document.querySelector("#signin-view").hidden = isSignup;
  document.querySelector("#signup-view").hidden = !isSignup;
  authDialog.setAttribute("aria-labelledby", isSignup ? "signup-title" : "auth-title");

  authDialog.querySelectorAll(".form-feedback").forEach((message) => {
    message.textContent = "";
    message.classList.remove("is-success");
  });
  authDialog.querySelectorAll("[aria-invalid='true']").forEach((field) => field.removeAttribute("aria-invalid"));
}

function showAuth(view = "signin") {
  if (!authDialog) {
    window.location.href = `index.html?auth=${encodeURIComponent(view)}`;
    return;
  }

  setAuthView(view);
  openDialog(authDialog);
  window.setTimeout(() => {
    const field = document.querySelector(view === "signup" ? "#signup-name" : "#signin-email");
    field?.focus();
  }, 50);
}

function validateForm(form) {
  const requiredFields = [...form.querySelectorAll("[required]")];
  let firstInvalid = null;
  let message = "";

  requiredFields.forEach((field) => {
    field.removeAttribute("aria-invalid");
    const value = field.type === "checkbox" ? field.checked : field.value.trim();

    if (!value) {
      field.setAttribute("aria-invalid", "true");
      firstInvalid ||= field;
      message ||= field.type === "checkbox" ? "Please check the required box to continue." : "Please complete all required fields.";
      return;
    }

    if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) {
      field.setAttribute("aria-invalid", "true");
      firstInvalid ||= field;
      message ||= "Enter a valid email address.";
    }

    if (field.type === "password" && field.minLength > 0 && field.value.length < field.minLength) {
      field.setAttribute("aria-invalid", "true");
      firstInvalid ||= field;
      message ||= `Use at least ${field.minLength} characters for your password.`;
    }
  });

  const feedback = form.querySelector(".form-feedback");
  if (firstInvalid) {
    if (feedback) showFormMessage(feedback, message, "error");
    firstInvalid.focus();
    return false;
  }

  if (feedback) {
    feedback.textContent = "";
    feedback.classList.remove("is-success");
  }
  return true;
}

function showFormMessage(element, message, type = "error") {
  element.textContent = message;
  element.classList.toggle("is-success", type === "success");
}

function togglePassword(button) {
  const field = document.getElementById(button.dataset.togglePassword);
  if (!field) return;

  const shouldShow = field.type === "password";
  field.type = shouldShow ? "text" : "password";
  button.textContent = shouldShow ? "Hide" : "Show";
  button.setAttribute("aria-label", `${shouldShow ? "Hide" : "Show"} password`);
}

function loadAccounts() {
  try {
    const accounts = JSON.parse(localStorage.getItem(storageKeys.accounts) || "[]");
    return Array.isArray(accounts) ? accounts : [];
  } catch {
    return [];
  }
}

function getSessionFrom(storage) {
  try {
    const session = JSON.parse(storage.getItem(storageKeys.session) || "null");
    return session && typeof session.name === "string" && typeof session.email === "string" ? session : null;
  } catch {
    return null;
  }
}

function restoreSession() {
  return getSessionFrom(sessionStorage) || getSessionFrom(localStorage);
}

function saveSession(user, remember) {
  const storage = remember ? localStorage : sessionStorage;
  const otherStorage = remember ? sessionStorage : localStorage;
  otherStorage.removeItem(storageKeys.session);
  storage.setItem(storageKeys.session, JSON.stringify({ name: user.name, email: user.email }));
}

function updateAuthUI() {
  const guestControls = document.querySelector("#guest-controls");
  const userControls = document.querySelector("#user-controls");
  const welcomeMessage = document.querySelector("#welcome-message");

  if (!guestControls || !userControls) return;
  guestControls.hidden = Boolean(currentUser);
  userControls.hidden = !currentUser;
  if (welcomeMessage) welcomeMessage.hidden = !currentUser;

  if (currentUser) {
    const firstName = currentUser.name.split(/\s+/)[0];
    document.querySelector("#user-greeting").textContent = `Hi, ${firstName}`;
    if (welcomeMessage) welcomeMessage.textContent = `Welcome back, ${firstName}. Your glow is waiting.`;
  }
}

function bytesToHex(bytes) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex) {
  return new Uint8Array(hex.match(/.{1,2}/g).map((byte) => Number.parseInt(byte, 16)));
}

async function hashPassword(password, saltHex) {
  if (!window.crypto?.subtle) {
    throw new Error("This browser does not provide secure password hashing for the demo. Try a current browser.");
  }

  const key = await window.crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const digest = await window.crypto.subtle.deriveBits({
    name: "PBKDF2",
    salt: hexToBytes(saltHex),
    iterations: 120000,
    hash: "SHA-256"
  }, key, 256);
  return bytesToHex(new Uint8Array(digest));
}

function hashesMatch(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

async function signUp(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const feedback = form.querySelector(".form-feedback");
  if (!validateForm(form)) return;

  const name = form.elements.name.value.trim();
  const email = form.elements.email.value.trim().toLowerCase();
  const password = form.elements.password.value;
  const confirmation = form.elements.confirmPassword.value;

  if (password !== confirmation) {
    form.elements.confirmPassword.setAttribute("aria-invalid", "true");
    showFormMessage(feedback, "Those passwords don’t match yet.");
    form.elements.confirmPassword.focus();
    return;
  }

  const accounts = loadAccounts();
  if (accounts.some((account) => account.email === email)) {
    form.elements.email.setAttribute("aria-invalid", "true");
    showFormMessage(feedback, "An account with this email already exists. Sign in instead.");
    form.elements.email.focus();
    return;
  }

  const submitButton = form.querySelector("[type='submit']");
  submitButton.disabled = true;
  submitButton.textContent = "Creating your account...";

  try {
    const salt = bytesToHex(window.crypto.getRandomValues(new Uint8Array(16)));
    const passwordHash = await hashPassword(password, salt);
    const account = { name, email, salt, passwordHash };
    localStorage.setItem(storageKeys.accounts, JSON.stringify([...accounts, account]));
    currentUser = { name, email };
    saveSession(currentUser, true);
    updateAuthUI();
    authDialog.close();
    form.reset();
    showToast(`Welcome to GLOW BEAUTY, ${name.split(/\s+/)[0]}.`);
  } catch (error) {
    showFormMessage(feedback, error.message || "We couldn’t create your demo account. Please try again.");
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = "Create account <span aria-hidden='true'>↗</span>";
  }
}

async function signIn(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const feedback = form.querySelector(".form-feedback");
  if (!validateForm(form)) return;

  const email = form.elements.email.value.trim().toLowerCase();
  const password = form.elements.password.value;
  const account = loadAccounts().find((savedAccount) => savedAccount.email === email);

  if (!account) {
    showFormMessage(feedback, "We couldn’t find that demo account. Check your email or create an account.");
    return;
  }

  const submitButton = form.querySelector("[type='submit']");
  submitButton.disabled = true;
  submitButton.textContent = "Signing in...";

  try {
    const enteredHash = await hashPassword(password, account.salt);
    if (!hashesMatch(enteredHash, account.passwordHash)) {
      showFormMessage(feedback, "That password doesn’t match this demo account.");
      return;
    }

    currentUser = { name: account.name, email: account.email };
    saveSession(currentUser, form.elements.remember.checked);
    updateAuthUI();
    authDialog?.close();
    form.reset();
    if (form.hasAttribute("data-redirect-on-success")) {
      window.location.href = "index.html";
      return;
    }
    showToast(`Welcome back, ${account.name.split(/\s+/)[0]}.`);
  } catch (error) {
    showFormMessage(feedback, error.message || "We couldn’t sign in. Please try again.");
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = "Sign in <span aria-hidden='true'>↗</span>";
  }
}

function logout() {
  if (!currentUser || !window.confirm("Log out of your GLOW BEAUTY demo account?")) return;

  localStorage.removeItem(storageKeys.session);
  sessionStorage.removeItem(storageKeys.session);
  currentUser = null;
  updateAuthUI();
  showToast("You have successfully logged out.");
}

function showToast(message, type = "success") {
  if (!toast) return;

  window.clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.classList.toggle("is-error", type === "error");
  toast.classList.add("is-visible");
  toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

function closeMobileNavigation() {
  if (!mainNav || !menuToggle) return;
  mainNav.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
}

function updateNavigation() {
  if (!header || !mainNav) return;
  header.classList.toggle("is-scrolled", window.scrollY > 16);
  const currentPage = document.body.dataset.page;

  mainNav.querySelectorAll("[data-page-link]").forEach((link) => {
    const isActive = link.dataset.pageLink === currentPage;
    link.classList.toggle("is-active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function observeRevealElements(root = document) {
  const revealItems = root.querySelectorAll(".reveal:not(.is-visible)");
  if (!revealObserver) {
    revealItems.forEach((element) => element.classList.add("is-visible"));
    return;
  }
  revealItems.forEach((element) => {
    const bounds = element.getBoundingClientRect();
    if (bounds.top < window.innerHeight && bounds.bottom > 0) {
      element.classList.add("is-visible");
      return;
    }
    revealObserver.observe(element);
  });
}

const searchForm = document.querySelector("#search-form");
if (searchForm) {
  searchForm.addEventListener("input", (event) => {
    if (event.target !== searchInput || !productGrid) return;
    searchTerm = searchInput.value;
    renderProducts();
  });

  searchForm.addEventListener("submit", (event) => {
    if (!productGrid) return;
    event.preventDefault();
    searchTerm = searchInput.value.trim();
    renderProducts();
    const parameters = new URLSearchParams();
    if (searchTerm) parameters.set("q", searchTerm);
    if (selectedCategory !== "all") parameters.set("category", selectedCategory);
    const query = parameters.toString();
    history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}#shop`);
    document.querySelector("#product-search").blur();
  });
}

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => setCategory(button.dataset.filter));
});

if (productGrid) {
  productGrid.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-cart]");
    const detailsButton = event.target.closest("[data-product-details]");
    if (addButton) addToCart(addButton.dataset.addCart);
    if (detailsButton) openProductDetails(detailsButton.dataset.productDetails);
  });
}

const productDetailContent = document.querySelector("#product-detail-content");
if (productDetailContent) {
  productDetailContent.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-detail-add]");
    if (addButton) addToCart(addButton.dataset.detailAdd);
  });
}

cartItems?.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-cart-action]");
  if (!actionButton) return;

  const productId = actionButton.dataset.productId;
  const quantity = cart[productId] || 0;
  if (actionButton.dataset.cartAction === "remove") {
    removeFromCart(productId);
  } else if (actionButton.dataset.cartAction === "decrease") {
    if (quantity <= 1) removeFromCart(productId);
    else {
      cart[productId] = quantity - 1;
      saveCart();
      updateCart();
    }
  } else if (actionButton.dataset.cartAction === "increase" && quantity < 99) {
    cart[productId] = quantity + 1;
    saveCart();
    updateCart();
  }
});

document.querySelector("#cart-open")?.addEventListener("click", () => openDialog(cartDialog));
document.querySelector("#clear-cart")?.addEventListener("click", clearCart);
document.querySelector("#checkout-button")?.addEventListener("click", () => {
  renderCheckoutSummary();
  cartDialog.close();
  openDialog(checkoutDialog);
});

document.querySelectorAll("[data-open-auth]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.openAuth === "signin") {
      window.location.href = "login.html";
      return;
    }

    showAuth(button.dataset.openAuth);
  });
});

document.querySelectorAll("[data-switch-auth]").forEach((button) => {
  button.addEventListener("click", () => setAuthView(button.dataset.switchAuth));
});

document.querySelectorAll("[data-toggle-password]").forEach((button) => {
  button.addEventListener("click", () => togglePassword(button));
});

document.querySelector("#signin-form")?.addEventListener("submit", signIn);
document.querySelector("#signup-form")?.addEventListener("submit", signUp);
document.querySelector("#logout-button")?.addEventListener("click", logout);

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => document.getElementById(button.dataset.closeDialog)?.close());
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

document.querySelector("#forgot-password")?.addEventListener("click", (event) => {
  event.preventDefault();
  showToast("Password recovery needs a real authentication service. This is a local demo.", "error");
});

document.querySelector("#terms-link")?.addEventListener("click", (event) => {
  event.preventDefault();
  showToast("Demo account details stay in this browser only. No real service or payment is connected.");
});

const contactForm = document.querySelector("#contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const feedback = document.querySelector("#contact-feedback");
    if (!validateForm(contactForm)) return;

    showFormMessage(feedback, "Thanks for your note. This demo doesn’t send messages to a server.", "success");
    contactForm.reset();
  });

  contactForm.addEventListener("input", (event) => {
    event.target.removeAttribute("aria-invalid");
  });
}

document.querySelectorAll(".auth-form").forEach((form) => {
  form.addEventListener("input", (event) => {
    event.target.removeAttribute("aria-invalid");
    const feedback = form.querySelector(".form-feedback");
    feedback.textContent = "";
    feedback.classList.remove("is-success");
  });
});

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  mainNav.classList.toggle("is-open", !isOpen);
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
});

mainNav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMobileNavigation));

document.querySelector("#mobile-search-toggle")?.addEventListener("click", (event) => {
  const button = event.currentTarget;
  const searchForm = document.querySelector("#search-form");
  const isOpen = button.getAttribute("aria-expanded") === "true";
  searchForm.classList.toggle("is-open", !isOpen);
  button.setAttribute("aria-expanded", String(!isOpen));
  button.setAttribute("aria-label", isOpen ? "Open product search" : "Close product search");
  if (!isOpen) searchInput.focus();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMobileNavigation();
});

document.addEventListener("error", (event) => {
  const image = event.target;
  if (!(image instanceof HTMLImageElement) || !image.hasAttribute("data-image-fallback") || image.dataset.fallbackUsed) return;
  image.dataset.fallbackUsed = "true";
  image.src = "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=700&q=80";
}, true);

window.addEventListener("scroll", updateNavigation, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth > 820) closeMobileNavigation();
});

if ("IntersectionObserver" in window && !reduceMotion) {
  revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -24px 0px" });
}

if (productGrid) renderProducts();
updateCart();
updateAuthUI();
updateNavigation();
observeRevealElements();

if (authDialog && ["signin", "signup"].includes(pageParameters.get("auth"))) {
  showAuth(pageParameters.get("auth"));
}