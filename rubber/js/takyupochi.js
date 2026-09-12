const DATA_URL = '/rubber/data/rubbers.json';

const brandColors = {
  nittaku: '#C8281F',
  butterfly: '#E0568C',
  andro: '#3E6FD9',
  victas: '#D4A017'
};

let products = [];
let currentBrand = 'all';

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

function createProductCard(product) {
  const panelId = `product-${product.id}`;
  const links = product.links || {};

  const prices = [
    links.amazon?.price,
    links.rakuten?.price,
    links.yahoo?.price
  ].filter(price => Number.isFinite(price));
  
  const minPrice = prices.length ? Math.min(...prices) : null;
  
  const createShopLink = (label, shop) => {
    if (!shop?.url) return '';
  
    const isCheapest = minPrice !== null && shop.price === minPrice;
  
    return `
      <a class="shop-link ${isCheapest ? 'is-cheapest' : ''}"
         href="${escapeHtml(shop.url)}"
         rel="sponsored nofollow">
        <span class="shop-link__name">${escapeHtml(label)}</span>
  
        ${Number.isFinite(shop.price) ? `
          <span class="shop-link__price">
            ¥${shop.price.toLocaleString()}
          </span>
        ` : ''}
  
        ${isCheapest ? `
          <span class="shop-link__badge">最安</span>
        ` : ''}
      </a>
    `;
  };

  return `
    <article class="rubber-card" data-brand="${escapeHtml(product.brand)}">
      <div class="rubber-card__main">
        <div class="rubber-card__image-wrap">
          <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" class="rubber-card__image" loading="lazy">
        </div>
        <div class="rubber-card__body">
          <p class="rubber-card__brand">${escapeHtml(product.brandLabel)}</p>
          <h2 class="rubber-card__title">${escapeHtml(product.name)}</h2>
          <div class="rubber-card__meta">
            <div class="rubber-card__rating">
              <span class="rubber-card__stars" aria-label="5点満点中${escapeHtml(product.rating)}点">${escapeHtml(product.stars)}</span>
              <span>${escapeHtml(product.rating)}</span>
            </div>
            <p class="rubber-card__level">${escapeHtml(product.level)}</p>
          </div>
          <button type="button" class="rubber-card__toggle" aria-expanded="false" aria-controls="${panelId}">
            <span class="rubber-card__toggle-label">購入先を見る</span>
            <span class="rubber-card__toggle-icon" aria-hidden="true"></span>
          </button>
        </div>
      </div>
      <div class="rubber-card__panel" id="${panelId}">
        <div class="rubber-card__panel-inner">
          <div class="rubber-card__details">
            <p class="rubber-card__note">${escapeHtml(product.note)}</p>
            <div class="shop-links">
  ${createShopLink('Amazon', links.amazon)}
  ${createShopLink('楽天市場', links.rakuten)}
  ${createShopLink('Yahoo!', links.yahoo)}
</div>
          </div>
        </div>
      </div>
    </article>`;
}

function renderProducts() {
  const grid = document.getElementById('tkpGrid');
  if (!grid) return;
  grid.innerHTML = products.map(createProductCard).join('');
  bindProductToggles();
  applyFilter(currentBrand);
}

function bindProductToggles() {
  document.querySelectorAll('.rubber-card__toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const panel = document.getElementById(toggle.getAttribute('aria-controls'));
      if (!panel) return;
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      panel.classList.toggle('is-open', !isOpen);
    });
  });
}

function applyFilter(brand) {
  currentBrand = brand;
  const cards = document.querySelectorAll('#tkpGrid .rubber-card');
  const empty = document.getElementById('tkpEmpty');
  const activeBar = document.getElementById('tkpActiveFilter');
  const activeText = document.getElementById('tkpActiveFilterText');
  let visible = 0;

  cards.forEach(card => {
    const match = brand === 'all' || card.dataset.brand === brand;
    card.classList.toggle('is-hidden', !match);
    if (match) visible++;
  });

  if (empty) empty.classList.toggle('is-visible', visible === 0);

  if (!activeBar || !activeText) return;
  if (brand === 'all') {
    activeBar.classList.remove('is-visible');
  } else {
    const chip = document.querySelector(`.tkp-chip[data-brand="${brand}"]`);
    const label = chip?.textContent || brand;
    activeText.textContent = `絞り込み中：${label}`;
    activeText.style.color = brandColors[brand] || '#C8281F';
    activeText.style.fontWeight = '700';
    activeBar.classList.add('is-visible');
  }
}

function initMenuAndFilter() {
  const hamburger = document.getElementById('tkpHamburger');
  const menu = document.getElementById('tkpFilterMenu');
  const closeBtn = document.getElementById('tkpFilterClose');
  const chips = document.querySelectorAll('.tkp-chip');
  const clearBtn = document.getElementById('tkpClearFilter');

  const closeMenu = () => {
    hamburger?.classList.remove('is-active');
    menu?.classList.remove('is-active');
    hamburger?.setAttribute('aria-expanded', 'false');
  };

  hamburger?.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('is-active');
    menu?.classList.toggle('is-active');
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  closeBtn?.addEventListener('click', closeMenu);

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(item => item.classList.remove('is-active'));
      chip.classList.add('is-active');
      applyFilter(chip.dataset.brand);
      setTimeout(closeMenu, 250);
    });
  });

  clearBtn?.addEventListener('click', () => {
    chips.forEach(item => item.classList.remove('is-active'));
    document.querySelector('.tkp-chip[data-brand="all"]')?.classList.add('is-active');
    applyFilter('all');
  });
}

async function loadProducts() {
  const grid = document.getElementById('tkpGrid');
  try {
    const response = await fetch(DATA_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    products = await response.json();
    renderProducts();
  } catch (error) {
    console.error('商品データの読み込みに失敗しました:', error);
    if (grid) {
      grid.innerHTML = '<p>商品データを読み込めませんでした。</p>';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initMenuAndFilter();
  loadProducts();
});
