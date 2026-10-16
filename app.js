/* ЕНЕРГІЯ — логіка каталогу та кошика покупок */
(() => {
'use strict';

const names = {
boilers: 'Котли',
generators: 'Генератори',
waterheaters: 'Бойлери',
tanks: 'Акумулюючі баки',
parts: 'ТЕНи та комплектуючі'
};

let activeCategory = null;
let activeBrand = null;
let cart = loadCart();

const $ = id => document.getElementById(id);
const grid = $('productGrid');
const categories = $('categoryTiles');
const navigation = $('catalogNavigation');
const brandGrid = $('brandGrid');
const emptyState = $('emptyState');

function loadCart() {
try {
const saved = JSON.parse(localStorage.getItem('energiyaCart') || '[]');
return Array.isArray(saved) ? saved : [];
} catch {
return [];
}
}

function saveCart() {
try {
localStorage.setItem('energiyaCart', JSON.stringify(cart));
} catch {
// Кошик залишиться доступним до перезавантаження сторінки.
}
updateCartButton();
renderCart();
}

function getProducts() {
return Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];
}

function findProduct(id) {
return getProducts().find(p => String(p.id) === String(id));
}

function money(value) {
return String(value || 'Уточнюйте');
}

function setContacts() {
const c = window.CONTACTS || {};

document.querySelectorAll('[data-contact="telegram"]').forEach(a => {
  a.href = c.telegram || 'https://t.me/';
});

document.querySelectorAll('[data-contact="viber"]').forEach(a => {
  a.href = c.viber || '#';
});

document.querySelectorAll('[data-contact="phoneLink"]').forEach(a => {
  a.href = 'tel:' + (c.phone || '');
});

}

/* Стилі кошика */
function addCartStyles() {
if ($('cartStyles')) return;

const style = document.createElement('style');
style.id = 'cartStyles';
style.textContent = `
  .cart-toolbar{display:flex;align-items:center;gap:8px}
  .cart-toggle{position:relative;border:1px solid var(--gold);border-radius:9px;
    background:var(--panel2);color:var(--gold2);padding:9px 13px;
    font-weight:800;cursor:pointer;white-space:nowrap}
  .cart-count{display:inline-flex;align-items:center;justify-content:center;
    min-width:22px;height:22px;margin-left:5px;padding:0 5px;border-radius:20px;
    background:var(--gold);color:#171512;font-size:.8rem}
  .cart-panel{margin:20px 0;padding:20px;border:1px solid var(--line);
    border-radius:15px;background:var(--panel)}
  .cart-panel h3{margin:0 0 14px;color:var(--gold2)}
  .cart-item{display:grid;grid-template-columns:minmax(0,1fr) auto;
    gap:12px;padding:13px 0;border-bottom:1px solid var(--line)}
  .cart-item-name{font-weight:800;overflow-wrap:anywhere}
  .cart-item-price{color:var(--gold2);font-weight:800;margin-top:4px}
  .cart-item-controls{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
  .cart-qty{min-width:25px;text-align:center}
  .cart-small-button{border:1px solid var(--line);border-radius:7px;
    padding:5px 9px;background:var(--panel2);color:var(--text);cursor:pointer}
  .cart-remove{color:#ffb5a9}
  .cart-total{display:flex;justify-content:space-between;gap:12px;
    margin:18px 0;font-size:1.1rem;font-weight:900}
  .cart-total strong{color:var(--gold2)}
  .cart-actions{display:flex;gap:10px;flex-wrap:wrap}
  .cart-actions button{border:0;border-radius:8px;padding:11px 15px;
    background:var(--gold);color:#171512;font-weight:800;cursor:pointer}
  .cart-actions .cart-clear{background:transparent;color:var(--gold2);
    border:1px solid var(--line)}
  .cart-empty{color:var(--muted);padding:10px 0}
  .add-to-cart{flex:1;text-align:center;padding:9px;border-radius:8px;
    background:var(--gold);color:#171512;font-size:.85rem;font-weight:800;
    border:0;cursor:pointer}
  .card-links{flex-wrap:wrap}
  @media(max-width:600px){
    .cart-panel{padding:14px}
    .cart-item{grid-template-columns:1fr}
    .cart-toolbar{margin-left:auto}
  }
`;
document.head.appendChild(style);

}

/* Кнопка кошика у верхньому меню */
function createCartInterface() {
addCartStyles();

const nav = document.querySelector('.nav-links');
if (nav && !$('cartToggle')) {
  const wrapper = document.createElement('div');
  wrapper.className = 'cart-toolbar';

  const button = document.createElement('button');
  button.id = 'cartToggle';
  button.className = 'cart-toggle';
  button.type = 'button';
  button.setAttribute('aria-expanded', 'false');
  button.innerHTML = 'Кошик <span class="cart-count" id="cartCount">0</span>';
  button.addEventListener('click', () => {
    const panel = $('cartPanel');
    panel.hidden = !panel.hidden;
    button.setAttribute('aria-expanded', String(!panel.hidden));
    if (!panel.hidden) {
      renderCart();
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  wrapper.appendChild(button);
  nav.appendChild(wrapper);
}

if (!$('cartPanel')) {
  const panel = document.createElement('section');
  panel.id = 'cartPanel';
  panel.className = 'cart-panel';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Кошик покупок');
  panel.innerHTML = `
    <h3>Ваш кошик</h3>
    <div id="cartItems"></div>
    <div class="cart-total">
      <span>Разом за каталогом:</span>
      <strong id="cartTotal">0 грн</strong>
    </div>
    <div class="cart-actions">
      <button type="button" id="checkoutButton">Сформувати замовлення</button>
      <button type="button" id="clearCartButton" class="cart-clear">Очистити кошик</button>
    </div>
    <p class="catalog-note">Ціни та наявність потрібно підтвердити перед замовленням.</p>
  `;

  const catalog = $('catalog');
  if (catalog) {
    catalog.appendChild(panel);
  } else {
    document.body.appendChild(panel);
  }

  $('clearCartButton').addEventListener('click', () => {
    if (!cart.length) return;
    cart = [];
    saveCart();
  });

  $('checkoutButton').addEventListener('click', checkout);
}

updateCartButton();
renderCart();

}

function updateCartButton() {
const count = cart.reduce((sum, item) => sum + item.qty, 0);
const badge = $('cartCount');
if (badge) badge.textContent = count;
}

function addToCart(id) {
const product = findProduct(id);
if (!product) return;

const existing = cart.find(item => String(item.id) === String(id));
if (existing) {
  existing.qty += 1;
} else {
  cart.push({ id: product.id, qty: 1 });
}

saveCart();

const panel = $('cartPanel');
if (panel) panel.hidden = false;

const toggle = $('cartToggle');
if (toggle) toggle.setAttribute('aria-expanded', 'true');

renderCart();

}

function changeQuantity(id, delta) {
const item = cart.find(row => String(row.id) === String(id));
if (!item) return;

item.qty += delta;

if (item.qty <= 0) {
  cart = cart.filter(row => String(row.id) !== String(id));
}

saveCart();

}

function removeFromCart(id) {
cart = cart.filter(item => String(item.id) !== String(id));
saveCart();
}

function numericPrice(value) {
const normalized = String(value || '')
.replace(/\s/g, '')
.replace(/[^\d,.-]/g, '')
.replace(',', '.');

const result = Number.parseFloat(normalized);
return Number.isFinite(result) ? result : null;

}

function formatPrice(value) {
return Math.round(value).toLocaleString('uk-UA') + ' грн';
}

function renderCart() {
const container = $('cartItems');
const totalNode = $('cartTotal');
if (!container || !totalNode) return;

container.replaceChildren();

if (!cart.length) {
  const message = document.createElement('p');
  message.className = 'cart-empty';
  message.textContent = 'Кошик порожній. Додайте товари з каталогу.';
  container.appendChild(message);
  totalNode.textContent = '0 грн';
  updateCartButton();
  return;
}

let total = 0;
let allPricesKnown = true;

cart.forEach(item => {
  const product = findProduct(item.id);
  if (!product) return;

  const row = document.createElement('div');
  row.className = 'cart-item';

  const info = document.createElement('div');
  const name = document.createElement('div');
  name.className = 'cart-item-name';
  name.textContent = `${product.brand || ''} ${product.model || product.name || ''}`.trim();

  const price = document.createElement('div');
  price.className = 'cart-item-price';
  const unitPrice = numericPrice(product.price);

  if (unitPrice === null) {
    price.textContent = 'Ціна: уточнюйте';
    allPricesKnown = false;
  } else {
    price.textContent = `${formatPrice(unitPrice)} × ${item.qty}`;
    total += unitPrice * item.qty;
  }

  info.append(name, price);

  const controls = document.createElement('div');
  controls.className = 'cart-item-controls';

  const minus = document.createElement('button');
  minus.type = 'button';
  minus.className = 'cart-small-button';
  minus.textContent = '−';
  minus.setAttribute('aria-label', 'Зменшити кількість');
  minus.addEventListener('click', () => changeQuantity(item.id, -1));

  const quantity = document.createElement('span');
  quantity.className = 'cart-qty';
  quantity.textContent = item.qty;

  const plus = document.createElement('button');
  plus.type = 'button';
  plus.className = 'cart-small-button';
  plus.textContent = '+';
  plus.setAttribute('aria-label', 'Збільшити кількість');
  plus.addEventListener('click', () => changeQuantity(item.id, 1));

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'cart-small-button cart-remove';
  remove.textContent = 'Видалити';
  remove.addEventListener('click', () => removeFromCart(item.id));

  controls.append(minus, quantity, plus, remove);
  row.append(info, controls);
  container.appendChild(row);
});

totalNode.textContent = allPricesKnown
  ? formatPrice(total)
  : formatPrice(total) + ' + товари з ціною за запитом';

updateCartButton();

}

function checkout() {
if (!cart.length) {
alert('Ваш кошик порожній.');
return;
}

const c = window.CONTACTS || {};
const lines = ['Доброго дня! Хочу уточнити замовлення із сайту ЕНЕРГІЯ:', ''];

let total = 0;
let allPricesKnown = true;

cart.forEach(item => {
  const p = findProduct(item.id);
  if (!p) return;

  lines.push(
    `• ${p.brand || ''} ${p.model || p.name || ''} — ${item.qty} шт.; ціна в каталозі: ${p.price || 'уточнити'}`
  );

  const price = numericPrice(p.price);
  if (price === null) {
    allPricesKnown = false;
  } else {
    total += price * item.qty;
  }
});

lines.push('');

if (allPricesKnown) {
  lines.push('Сума за цінами каталогу: ' + formatPrice(total));
} else {
  lines.push('Остаточну суму прошу уточнити.');
}

lines.push('Прошу підтвердити актуальні ціни, наявність і строки постачання.');
if (c.phoneDisplay) lines.push('Контактний телефон: ' + c.phoneDisplay);

const message = lines.join('\n');

/*
  Telegram share відкриває вікно надсилання підготовленого тексту.
  Користувач обирає чат самостійно.
*/
const telegramUrl = 'https://t.me/share/url?url=' +
  encodeURIComponent('https://viktorkamsik-afk.github.io/energiya-store/') +
  '&text=' + encodeURIComponent(message);

window.open(telegramUrl, '_blank', 'noopener,noreferrer');

}

function renderBrands(category) {
activeCategory = category;
activeBrand = null;
categories.hidden = true;
navigation.hidden = false;
grid.hidden = true;
grid.replaceChildren();
emptyState.hidden = true;

$('catalogViewTitle').textContent = names[category] || 'Каталог';
$('catalogViewHint').textContent = 'Оберіть виробника, щоб переглянути моделі.';
$('backButton').textContent = '← Усі категорії';

brandGrid.replaceChildren();

const products = getProducts().filter(p => p.category === category);
const brands = [...new Set(products.map(p => p.brand).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b, 'uk'));

if (!brands.length) {
  emptyState.hidden = false;
  emptyState.textContent = category === 'generators'
    ? 'У каталозі поки немає перевірених генераторів. Неперевірені товари та ціни не додано.'
    : 'У цій категорії поки немає товарів. Каталог можна доповнити після перевірки асортименту.';
  return;
}

brands.forEach(brandName => {
  const count = products.filter(p => p.brand === brandName).length;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'brand-button';

  const title = document.createElement('span');
  title.textContent = brandName;

  const small = document.createElement('small');
  small.textContent = 'Моделей: ' + count;

  button.append(title, small);
  button.addEventListener('click', () => renderProducts(category, brandName));
  brandGrid.appendChild(button);
});

$('catalog').scrollIntoView({ behavior: 'smooth', block: 'start' });

}

function productCard(p) {
const card = document.createElement('article');
card.className = 'card';

const body = document.createElement('div');
body.className = 'card-body';

const info = document.createElement('div');

const category = document.createElement('div');
category.className = 'card-category';
category.textContent = names[p.category] || 'Обладнання';

const brand = document.createElement('div');
brand.className = 'card-brand';
brand.textContent = p.brand || '';

const title = document.createElement('h3');
title.className = 'card-title';
title.textContent = p.model || p.name || 'Модель';

const specs = document.createElement('ul');
specs.className = 'card-specs';

(Array.isArray(p.specs) ? p.specs : []).forEach(spec => {
  const li = document.createElement('li');
  li.textContent = spec;
  specs.appendChild(li);
});

info.append(category, brand, title, specs);

const bottom = document.createElement('div');
const priceRow = document.createElement('div');
priceRow.className = 'card-price-row';

const label = document.createElement('span');
label.className = 'card-price-label';
label.textContent = 'Ціна постачальника';

const price = document.createElement('span');
price.className = 'card-price';
price.textContent = money(p.price);

priceRow.append(label, price);

const links = document.createElement('div');
links.className = 'card-links';

const addButton = document.createElement('button');
addButton.type = 'button';
addButton.className = 'add-to-cart';
addButton.textContent = 'До кошика';
addButton.addEventListener('click', () => addToCart(p.id));

const askButton = document.createElement('a');
askButton.className = 'card-link secondary';
askButton.textContent = 'Запитати';
askButton.href = 'https://t.me/share/url?url=' +
  encodeURIComponent('https://viktorkamsik-afk.github.io/energiya-store/') +
  '&text=' + encodeURIComponent(
    `Доброго дня! Мене цікавить товар: ${p.brand || ''} ${p.model || p.name || ''}. Ціна в каталозі: ${money(p.price)}. Прошу уточнити актуальну ціну та наявність.`
  );
askButton.target = '_blank';
askButton.rel = 'noopener noreferrer';

links.append(addButton, askButton);
bottom.append(priceRow, links);
body.append(info, bottom);
card.appendChild(body);

return card;

}

function renderProducts(category, brandName) {
activeCategory = category;
activeBrand = brandName;
brandGrid.replaceChildren();
grid.replaceChildren();
grid.hidden = false;
emptyState.hidden = true;

$('catalogViewTitle').textContent = (names[category] || 'Каталог') + ' — ' + brandName;
$('catalogViewHint').textContent = 'Оберіть модель і додайте потрібні товари до кошика.';
$('backButton').textContent = '← До виробників';

const products = getProducts().filter(
  p => p.category === category && p.brand === brandName
);

products.forEach(product => grid.appendChild(productCard(product)));

if (!products.length) {
  grid.hidden = true;
  emptyState.hidden = false;
  emptyState.textContent = 'У цього виробника поки немає моделей.';
}

$('catalog').scrollIntoView({ behavior: 'smooth', block: 'start' });

}

function search() {
const input = $('searchInput');
const q = input.value.trim().toLocaleLowerCase('uk');

if (!q) {
  showAll();
  return;
}

activeCategory = null;
activeBrand = null;
categories.hidden = true;
navigation.hidden = false;
brandGrid.replaceChildren();
grid.replaceChildren();
grid.hidden = false;
emptyState.hidden = true;

$('catalogViewTitle').textContent = 'Результати пошуку';
$('catalogViewHint').textContent = 'Пошуковий запит: ' + q;
$('backButton').textContent = '← Усі категорії';

const found = getProducts().filter(p => {
  const searchable = [
    p.name,
    p.model,
    p.brand,
    names[p.category],
    ...(Array.isArray(p.specs) ? p.specs : []),
    p.price
  ].join(' ').toLocaleLowerCase('uk');

  return searchable.includes(q);
});

found.forEach(product => grid.appendChild(productCard(product)));

if (!found.length) {
  grid.hidden = true;
  emptyState.hidden = false;
  emptyState.textContent = 'За цим запитом товарів не знайдено.';
}

$('catalog').scrollIntoView({ behavior: 'smooth', block: 'start' });

}

function showAll() {
activeCategory = null;
activeBrand = null;
navigation.hidden = true;
grid.hidden = true;
grid.replaceChildren();
categories.hidden = false;
emptyState.hidden = true;
}

$('backButton').addEventListener('click', () => {
if (activeCategory && activeBrand) {
renderBrands(activeCategory);
} else {
showAll();
}
});

document.querySelectorAll('.category-tile').forEach(button => {
button.addEventListener('click', () => renderBrands(button.dataset.category));
});

$('searchButton').addEventListener('click', search);

$('searchInput').addEventListener('keydown', event => {
if (event.key === 'Enter') search();
});

setContacts();
createCartInterface();
})();
