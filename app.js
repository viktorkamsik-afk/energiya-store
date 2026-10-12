/* Логіка каталогу. Основний перелік товарів зберігається в products.js. */
(() => {
  const names = {
    boilers: 'Котли', generators: 'Генератори', waterheaters: 'Бойлери',
    tanks: 'Акумулюючі баки', parts: 'ТЕНи та комплектуючі'
  };
  let activeCategory = null;
  let activeBrand = null;
  const $ = (id) => document.getElementById(id);
  const grid = $('productGrid');
  const categories = $('categoryTiles');
  const navigation = $('catalogNavigation');
  const brandGrid = $('brandGrid');
  const emptyState = $('emptyState');

  function setContacts() {
    const c = window.CONTACTS || {};
    document.querySelectorAll('[data-contact="telegram"]').forEach(a => a.href = c.telegram || '#');
    document.querySelectorAll('[data-contact="viber"]').forEach(a => a.href = c.viber || '#');
    document.querySelectorAll('[data-contact="phoneLink"]').forEach(a => a.href = 'tel:' + (c.phone || ''));
  }
  function productMatchesSearch(p, q) {
    return [p.name, p.brand, p.category, ...(p.specs || []), p.price].join(' ').toLocaleLowerCase('uk').includes(q);
  }
  function renderBrands(category) {
    activeCategory = category; activeBrand = null;
    categories.hidden = true; navigation.hidden = false; grid.hidden = true; emptyState.hidden = true;
    $('catalogViewTitle').textContent = names[category] || 'Каталог';
    $('catalogViewHint').textContent = 'Оберіть виробника, щоб переглянути моделі.';
    $('backButton').textContent = '← Усі категорії';
    brandGrid.innerHTML = '';
    const products = (window.PRODUCTS || []).filter(p => p.category === category);
    const brands = [...new Set(products.map(p => p.brand))].sort((a,b) => a.localeCompare(b, 'uk'));
    if (!brands.length) {
      emptyState.hidden = false;
      emptyState.textContent = category === 'generators'
        ? 'Моделі генераторів ще не додані до каталогу постачальника. Ми не додаємо неперевірені назви чи ціни.'
        : 'У цій категорії моделі ще додаються. Уточніть наявність у постачальника.';
      return;
    }
    brands.forEach(brand => {
      const count = products.filter(p => p.brand === brand).length;
      const b = document.createElement('button'); b.type = 'button'; b.className = 'brand-button';
      const title = document.createElement('span'); title.textContent = brand;
      const small = document.createElement('small'); small.textContent = 'Моделей: ' + count;
      b.append(title, small); b.addEventListener('click', () => renderProducts(category, brand)); brandGrid.appendChild(b);
    });
    $('catalog').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function productCard(p) {
    const card = document.createElement('article'); card.className = 'card';
    const body = document.createElement('div'); body.className = 'card-body';
    const info = document.createElement('div');
    const category = document.createElement('div'); category.className = 'card-category'; category.textContent = names[p.category] || 'Обладнання';
    const title = document.createElement('h3'); title.className = 'card-title'; title.textContent = p.name;
    const specs = document.createElement('ul'); specs.className = 'card-specs';
    (p.specs || []).forEach(s => { const li = document.createElement('li'); li.textContent = s; specs.appendChild(li); });
    info.append(category,title,specs);
    const bottom = document.createElement('div');
    const priceRow = document.createElement('div'); priceRow.className = 'card-price-row';
    const label = document.createElement('span'); label.className = 'card-price-label'; label.textContent = 'Ціна';
    const price = document.createElement('span'); price.className = 'card-price'; price.textContent = p.price;
    priceRow.append(label,price);
    const actions = document.createElement('div'); actions.className = 'btn-group-social';
    const tg = document.createElement('a'); tg.className = 'btn-action-soc btn-tg-order'; tg.textContent = 'Telegram'; tg.href = orderLink('telegram',p); tg.target='_blank'; tg.rel='noopener';
    const vb = document.createElement('a'); vb.className = 'btn-action-soc btn-viber-order'; vb.textContent = 'Viber'; vb.href = orderLink('viber',p);
    actions.append(tg,vb); bottom.append(priceRow,actions);
    card.append(body); body.append(info,bottom); return card;
  }
  function orderMessage(p) {
    const c = window.CONTACTS || {};
    return 'Доброго дня! Мене цікавить товар: ' + p.name + ' (' + p.price + '). Прошу уточнити актуальну ціну, наявність і характеристики. Контакт: ' + (c.phoneDisplay || '');
  }
  function orderLink(channel,p) {
    const c = window.CONTACTS || {}; const msg = encodeURIComponent(orderMessage(p));
    if (channel === 'telegram') return (c.telegram || 'https://t.me/') + '?text=' + msg;
    return c.viber || 'viber://chat?number=%2B380935654438';
  }
  function renderProducts(category,brand) {
    activeCategory=category; activeBrand=brand; brandGrid.innerHTML=''; grid.innerHTML=''; grid.hidden=false; emptyState.hidden=true;
    $('catalogViewTitle').textContent = (names[category] || 'Каталог') + ' — ' + brand;
    $('catalogViewHint').textContent = 'Модель, характеристики та ціна постачальника.';
    $('backButton').textContent = '← До виробників';
    (window.PRODUCTS || []).filter(p=>p.category===category && p.brand===brand).forEach(p=>grid.appendChild(productCard(p)));
    $('catalog').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function search() {
    const q = $('searchInput').value.trim().toLocaleLowerCase('uk');
    if (!q) { showAll(); return; }
    activeCategory=null; activeBrand=null; categories.hidden=true; navigation.hidden=false; brandGrid.innerHTML=''; grid.innerHTML=''; grid.hidden=false; emptyState.hidden=true;
    $('catalogViewTitle').textContent='Результати пошуку'; $('catalogViewHint').textContent='Пошуковий запит: ' + q; $('backButton').textContent='← Усі категорії';
    const found=(window.PRODUCTS||[]).filter(p=>productMatchesSearch(p,q)); found.forEach(p=>grid.appendChild(productCard(p)));
    if (!found.length) { grid.hidden=true; emptyState.hidden=false; emptyState.textContent='За цим запитом товарів не знайдено.'; }
  }
  function showAll() { activeCategory=null; activeBrand=null; navigation.hidden=true; grid.hidden=true; grid.innerHTML=''; categories.hidden=false; emptyState.hidden=true; }
  $('backButton').addEventListener('click',()=> activeCategory && activeBrand ? renderBrands(activeCategory) : showAll());
  document.querySelectorAll('.category-tile').forEach(b=>b.addEventListener('click',()=>renderBrands(b.dataset.category)));
  $('searchButton').addEventListener('click',search);
  $('searchInput').addEventListener('keydown',e=>{if(e.key==='Enter')search();});
  setContacts();
})();
