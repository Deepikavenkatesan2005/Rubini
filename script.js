const METALS = { Gold: "#e3b94f", "Rose gold": "#e8a598", Silver: "#c9cfdd" };
const products = [
  { id: 1, name: "Pearl Drop Earrings",   cat: "earrings",  price: 1499, g: "#ffffff", g2: "#d9c7b0", m: METALS.Gold },
  { id: 2, name: "Ruby Stud Earrings",    cat: "earrings",  price: 1899, g: "#ff7a8f", g2: "#b3173a", m: METALS.Gold },
  { id: 3, name: "Gold Layered Necklace", cat: "necklaces", price: 2799, g: "#fff1bf", g2: "#d6a62a", m: METALS.Gold },
  { id: 4, name: "Emerald Pendant",       cat: "necklaces", price: 3499, g: "#7cf0b4", g2: "#0f8a57", m: METALS.Gold },
  { id: 5, name: "Velvet Pearl Choker",   cat: "chokers",   price: 1299, g: "#ffffff", g2: "#cfc3d8", m: "#3a2a66" },
  { id: 6, name: "Crystal Choker",        cat: "chokers",   price: 1799, g: "#e6f6ff", g2: "#6aa8ff", m: METALS.Silver },
  { id: 7, name: "Solitaire Ring",        cat: "rings",     price: 4299, g: "#ffffff", g2: "#9fd0ff", m: METALS.Silver },
  { id: 8, name: "Rose Gold Band",        cat: "rings",     price: 2199, g: "#ffe9e2", g2: "#e08c7a", m: METALS["Rose gold"] }
];
const kinds = { earrings: "Earrings", necklaces: "Necklace", chokers: "Choker", rings: "Ring" };
const descs = {
  earrings: "Lightweight drops that catch the light with every turn of your head.",
  necklaces: "A graceful chain with a statement pendant, made for festive evenings.",
  chokers: "A close-fit choker that adds instant elegance to any neckline.",
  rings: "A handcrafted ring with a brilliant centre stone and a comfortable fit."
};
let cart = {}, wish = new Set(), filter = "all", current = null;

const $ = id => document.getElementById(id);
const money = n => "₹" + n.toLocaleString("en-IN");

// ---------- Jewellery illustrations (inline SVG) ----------
function art(p) {
  const i = p.id, m = p.m;
  const mg = `<linearGradient id="m${i}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" style="stop-color:color-mix(in srgb,${m} 45%,white)"/>
      <stop offset=".5" stop-color="${m}"/>
      <stop offset="1" style="stop-color:color-mix(in srgb,${m} 65%,black)"/></linearGradient>
    <radialGradient id="s${i}" cx=".35" cy=".3" r=".8">
      <stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="${p.g}"/><stop offset="1" stop-color="${p.g2}"/></radialGradient>`;
  const M = `url(#m${i})`, S = `url(#s${i})`;
  let body = "";
  if (p.cat === "earrings") {
    [62, 138].forEach(x => body += `
      <circle cx="${x}" cy="32" r="8" fill="none" stroke="${M}" stroke-width="4"/>
      <line x1="${x}" y1="40" x2="${x}" y2="72" stroke="${M}" stroke-width="4"/>
      <circle cx="${x}" cy="102" r="30" fill="${M}"/>
      <circle cx="${x}" cy="102" r="22" fill="${S}"/>
      <ellipse cx="${x - 7}" cy="94" rx="6" ry="4" fill="#fff" opacity=".8"/>`);
  } else if (p.cat === "necklaces") {
    body = `<path d="M28 36 Q100 190 172 36" fill="none" stroke="${M}" stroke-width="5" stroke-dasharray="1 7" stroke-linecap="round"/>
      <path d="M50 36 Q100 130 150 36" fill="none" stroke="${M}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="100" cy="116" r="6" fill="${M}"/>
      <polygon points="100,120 124,146 100,184 76,146" fill="${S}" stroke="${M}" stroke-width="5" stroke-linejoin="round"/>
      <polyline points="76,146 124,146 100,184 100,120 76,146" fill="none" stroke="#fff" stroke-opacity=".6"/>`;
  } else if (p.cat === "chokers") {
    body = `<path d="M22 66 Q100 130 178 66" fill="none" stroke="${M}" stroke-width="12" stroke-linecap="round"/>`;
    for (let t = 0.12; t < 0.9; t += 0.19) {
      const x = (1 - t) ** 2 * 22 + 2 * (1 - t) * t * 100 + t * t * 178;
      const y = (1 - t) ** 2 * 66 + 2 * (1 - t) * t * 130 + t * t * 66;
      body += `<circle cx="${x}" cy="${y}" r="8" fill="${S}"/>`;
    }
    body += `<line x1="100" y1="98" x2="100" y2="116" stroke="${M}" stroke-width="3"/>
      <circle cx="100" cy="130" r="16" fill="${M}"/><circle cx="100" cy="130" r="11" fill="${S}"/>`;
  } else {
    body = `<ellipse cx="100" cy="132" rx="50" ry="42" fill="none" stroke="${M}" stroke-width="14"/>
      <ellipse cx="100" cy="132" rx="50" ry="42" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3" transform="translate(-3 -3)"/>
      <path d="M74 92 L82 76 M126 92 L118 76" stroke="${M}" stroke-width="5" stroke-linecap="round"/>
      <polygon points="100,34 130,58 100,92 70,58" fill="${S}" stroke="${M}" stroke-width="3" stroke-linejoin="round"/>
      <polyline points="70,58 130,58 M100,34 100,92" fill="none" stroke="#fff" stroke-opacity=".7"/>`;
  }
  return `<svg class="art" viewBox="0 0 200 200" role="img" aria-label="${p.name}"><defs>${mg}</defs>${body}</svg>`;
}

// ---------- Rendering ----------
function renderProducts() {
  let list = filter === "all" ? [...products] : products.filter(p => p.cat === filter);
  const s = $("sort").value;
  if (s === "low") list.sort((a, b) => a.price - b.price);
  if (s === "high") list.sort((a, b) => b.price - a.price);
  $("productGrid").innerHTML = list.map(p => `
    <article class="card">
      <div class="pic" data-view="${p.id}" style="--bg:#120d26">
        ${art(p)}<i class="tw"></i><i class="tw"></i><i class="tw"></i>
        <button class="heart ${wish.has(p.id) ? "on" : ""}" data-heart="${p.id}" aria-label="Save to wishlist">♥</button>
        <button class="qv" data-view="${p.id}">Quick view</button>
      </div>
      <div class="info">
        <span class="kind">${kinds[p.cat]}</span>
        <h3>${p.name}</h3>
        <span class="price">${money(p.price)}</span>
        <button class="add" data-id="${p.id}">Add to cart</button>
      </div>
    </article>`).join("");
}

function renderCart() {
  const ids = Object.keys(cart);
  $("cartCount").textContent = ids.reduce((n, id) => n + cart[id], 0);
  $("cartItems").innerHTML = ids.length
    ? ids.map(id => {
        const p = products.find(x => x.id == id);
        return `<li><span>${p.name}<br>${money(p.price * cart[id])}</span>
          <span class="qty"><button data-dec="${id}" aria-label="Remove one">-</button><span>${cart[id]}</span><button data-inc="${id}" aria-label="Add one">+</button></span></li>`;
      }).join("")
    : "<li>Your cart is empty. Add some jewellery from the shop.</li>";
  $("cartTotal").textContent = money(ids.reduce((n, id) => n + products.find(x => x.id == id).price * cart[id], 0));
}

function setFilter(f) {
  filter = f;
  document.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", c.dataset.filter === f));
  renderProducts();
}

function addToCart(id) { cart[id] = (cart[id] || 0) + 1; renderCart(); }

// ---------- Quick view modal ----------
function openModal(id) {
  current = products.find(p => p.id === id);
  $("mArt").innerHTML = art(current);
  $("mKind").textContent = kinds[current.cat];
  $("mName").textContent = current.name;
  $("mDesc").textContent = descs[current.cat];
  $("mPrice").textContent = money(current.price);
  $("mMetals").innerHTML = Object.entries(METALS).map(([n, c]) =>
    `<button class="sw ${c === current.m ? "on" : ""}" data-metal="${c}" title="${n}" aria-label="${n}" style="background:${c}"></button>`).join("");
  $("modal").hidden = false;
}
const closeModal = () => ($("modal").hidden = true);

$("mMetals").addEventListener("click", e => {
  const c = e.target.dataset.metal;
  if (!c) return;
  current.m = c;                       // recolour the piece live
  $("mArt").innerHTML = art(current);
  document.querySelectorAll(".sw").forEach(b => b.classList.toggle("on", b.dataset.metal === c));
  renderProducts();
});
$("mAdd").addEventListener("click", () => {
  addToCart(current.id);
  $("mAdd").textContent = "Added to cart";
  setTimeout(() => ($("mAdd").textContent = "Add to cart"), 1000);
});
$("modalClose").addEventListener("click", closeModal);
$("modal").addEventListener("click", e => { if (e.target.id === "modal") closeModal(); });

// ---------- Events ----------
document.querySelector(".filters").addEventListener("click", e => {
  const chip = e.target.closest(".chip");
  if (chip) setFilter(chip.dataset.filter);
});
$("sort").addEventListener("change", renderProducts);
document.querySelector(".cats").addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b) return;
  setFilter(b.dataset.go);
  $("shop").scrollIntoView({ behavior: "smooth" });
});

$("productGrid").addEventListener("click", e => {
  const add = e.target.closest(".add"), heart = e.target.closest(".heart"), view = e.target.closest("[data-view]");
  if (heart) {
    const id = Number(heart.dataset.heart);
    wish.has(id) ? wish.delete(id) : wish.add(id);
    heart.classList.toggle("on");
  } else if (add) {
    addToCart(add.dataset.id);
    add.textContent = "Added";
    add.closest(".card").classList.add("pop");
    setTimeout(() => { add.textContent = "Add to cart"; add.closest(".card")?.classList.remove("pop"); }, 900);
  } else if (view) {
    openModal(Number(view.dataset.view));
  }
});

$("cartItems").addEventListener("click", e => {
  const inc = e.target.dataset.inc, dec = e.target.dataset.dec;
  if (inc) cart[inc]++;
  if (dec && --cart[dec] <= 0) delete cart[dec];
  renderCart();
});

$("cartBtn").addEventListener("click", () => ($("drawer").hidden = false));
$("closeCart").addEventListener("click", () => ($("drawer").hidden = true));
document.addEventListener("keydown", e => {
  if (e.key === "Escape") { $("drawer").hidden = true; closeModal(); }
});
$("checkout").addEventListener("click", () => {
  if (!Object.keys(cart).length) return alert("Your cart is empty.");
  alert("Order placed! Free shipping, arriving in 2 days.");
  cart = {};
  renderCart();
  $("drawer").hidden = true;
});

$("contactForm").addEventListener("submit", e => {
  e.preventDefault();
  $("formMsg").textContent = `Thanks, ${$("name").value.trim()}. We will reply soon.`;
  e.target.reset();
});

renderProducts();
renderCart();
