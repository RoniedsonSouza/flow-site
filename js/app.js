// Utils
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

const currency = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const FALLBACK_IMAGE = '/assets/default-card.png';
let lucideReady;
function loadLucide(){
  if (window.lucide) return Promise.resolve();
  if (!lucideReady) {
    lucideReady = new Promise(resolve => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/lucide@latest';
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => resolve();
      document.head.appendChild(script);
    });
  }
  return lucideReady;
}

async function loadJSON(path) {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Falha ao carregar ${path}`);
    return res.json();
}

async function loadProductsData() {
    if (typeof DB !== 'undefined') {
        try {
            return await DB.getProducts();
        } catch (e) {
            console.warn('Erro ao carregar produtos da API, usando JSON', e);
        }
    }
    return await loadJSON('/data/products.json');
}

function renderProductCard(p){
  const image = (p.image && p.image.trim()) ? p.image : FALLBACK_IMAGE;
  const tags = (p.tags||[]).map(
    t=>`<span class="chip"><i data-lucide="tag"></i>${t}</span>`
  ).join('');
  const idAttr = String(p.id).replace(/"/g, '&quot;');
  return `
    <article class="card h-full">
      <img src="${image}" alt="${p.name}" class="w-full aspect-[4/3] object-cover" onerror="this.src='${FALLBACK_IMAGE}';this.onerror=null;">
      <div class="p-4 flex flex-col flex-1">
        <div class="flex items-center justify-between gap-2">
          <h3 class="font-semibold flex items-center gap-2 min-w-0">
            <i data-lucide="${p.category==='Bebida' ? 'cup-soda' : 'sandwich'}"></i><span class="truncate">${p.name}</span>
          </h3>
          <span style="color:var(--pf-blue-dark)" class="font-bold shrink-0">
            ${currency(p.price)}
          </span>
        </div>
        <div class="mt-2 flex flex-wrap gap-2">
          <span class="chip"><i data-lucide="layers"></i>${p.category}</span>
          ${tags}
        </div>
        <button type="button" class="btn mt-auto w-full justify-center text-sm" data-add-to-cart data-product-id="${idAttr}">
          <span class="sm:hidden">Adicionar</span><span class="hidden sm:inline">Adicionar ao carrinho</span>
        </button>
      </div>
    </article>
  `;
}

function initMobileMenu(){
  const toggle = document.getElementById('mobile-menu-toggle');
  const drawer = document.getElementById('mobile-menu');
  if (!toggle || !drawer) return;
  const panel = drawer.querySelector('[data-menu-panel]');
  const overlay = drawer.querySelector('[data-menu-overlay]');
  const closers = drawer.querySelectorAll('[data-menu-close]');
  let isOpen = false;
  let lastFocused = null;
  let closeTimeoutId = null;

  const handleKeydown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
    }
  };

  const openMenu = () => {
    if (isOpen) return;
    if (closeTimeoutId) {
      clearTimeout(closeTimeoutId);
      closeTimeoutId = null;
    }
    isOpen = true;
    lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    drawer.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    toggle.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => {
      if (panel) panel.classList.remove('translate-x-full');
      if (overlay) {
        overlay.classList.remove('opacity-0');
        overlay.classList.add('opacity-100');
      }
    });
    const firstFocusable = panel ? panel.querySelector('a,button') : null;
    if (firstFocusable instanceof HTMLElement) {
      setTimeout(() => firstFocusable.focus(), 150);
    }
    document.addEventListener('keydown', handleKeydown);
  };

  const finalizeClose = () => {
    drawer.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    if (lastFocused instanceof HTMLElement && document.contains(lastFocused)) {
      lastFocused.focus({ preventScroll: true });
    } else {
      toggle.focus({ preventScroll: true });
    }
    lastFocused = null;
    closeTimeoutId = null;
  };

  const closeMenu = () => {
    if (!isOpen) return;
    isOpen = false;
    toggle.setAttribute('aria-expanded', 'false');
    if (panel) panel.classList.add('translate-x-full');
    if (overlay) {
      overlay.classList.remove('opacity-100');
      overlay.classList.add('opacity-0');
    }
    document.removeEventListener('keydown', handleKeydown);

    if (panel) {
      const fallback = setTimeout(() => {
        finalizeClose();
      }, 220);
      closeTimeoutId = fallback;
      const onTransitionEnd = (event) => {
        if (event.propertyName !== 'transform') return;
        clearTimeout(fallback);
        panel.removeEventListener('transitionend', onTransitionEnd);
        finalizeClose();
      };
      panel.addEventListener('transitionend', onTransitionEnd, { once: true });
    } else {
      finalizeClose();
    }
  };
  toggle.addEventListener('click', () => (isOpen ? closeMenu() : openMenu()));
  closers.forEach(el => el.addEventListener('click', closeMenu));
}

function highlightActiveNav(){
  const page = document.body.dataset.page;
  if (!page) return;
  $$('[data-nav]').forEach(link => {
    const isActive = link.dataset.nav === page;
    link.classList.toggle('text-pf-blueDark', isActive);
    link.classList.toggle('font-semibold', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function refreshIcons() {
  loadLucide().then(() => {
    try { window.lucide && window.lucide.createIcons(); } catch (e) { }
  });
}

async function initHome() {
    const box = document.getElementById('home-best');
    if (!box) return;
    const data = await loadProductsData();
    const best = data.filter(p => p.active !== false).slice(0, 4).map(p => p.name).join(' · ');
    box.textContent = best || 'Em breve novidades';
    refreshIcons();
}

async function initMenu() {
    if (document.body.dataset.page !== 'menu') return;
    const grid = document.querySelector('#menu-grid');
    const sel = document.querySelector('#filter-category');
    const search = document.querySelector('#search');

    const data = (await loadProductsData()).filter(p => p.active !== false);

    if (typeof window.ProjetoFlowCart !== 'undefined' && window.ProjetoFlowCart.setCatalog) {
        window.ProjetoFlowCart.setCatalog(data);
    }

    const categories = [...new Set(data.map(p => p.category))];
    categories.forEach(c => {
        sel.insertAdjacentHTML('beforeend', `<option value="${c}">${c}</option>`);
    });

    function apply() {
        const q = (search.value || '').toLowerCase();
        const c = sel.value;
        const list = data.filter(p => {
            const okC = !c || p.category === c;
            const okQ = !q || (p.name + p.category + (p.tags || []).join(' ')).toLowerCase().includes(q);
            return okC && okQ;
        });
        grid.innerHTML = list.map(renderProductCard).join('') || '<p>Nenhum item encontrado.</p>';
        refreshIcons();
    }
    sel.addEventListener('change', apply);
    search.addEventListener('input', apply);
    grid.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-add-to-cart]');
        if (!btn || !grid.contains(btn)) return;
        const id = btn.getAttribute('data-product-id');
        if (id != null && window.ProjetoFlowCart && window.ProjetoFlowCart.addById) {
            window.ProjetoFlowCart.addById(id);
        }
    });
    apply();
}

initMobileMenu(); highlightActiveNav(); initHome(); initMenu(); refreshIcons();
