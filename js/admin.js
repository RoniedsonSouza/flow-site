// Script da página de administração

let editingProductId = null;

async function loadProducts() {
  if (typeof DB === 'undefined') {
    console.error('DB não está definido');
    const container = document.getElementById('products-list');
    container.innerHTML = '<p class="text-red-600">Erro: Módulo DB não carregado. Recarregue a página.</p>';
    return;
  }
  
  const container = document.getElementById('products-list');
  container.innerHTML = '<p class="text-black/60">Carregando...</p>';

  try {
    const products = await DB.getProducts();

    if (products.length === 0) {
      container.innerHTML = '<p class="text-black/60">Nenhum produto cadastrado. Clique em "Adicionar Produto" para começar.</p>';
      return;
    }

    container.innerHTML = products.map(product => `
      <div class="card">
        <div class="flex items-start justify-between mb-2">
          <h3 class="font-semibold text-lg">${product.name}</h3>
          <span class="text-pf-blueDark font-bold">R$ ${product.price.toFixed(2)}</span>
        </div>
        <p class="text-sm text-black/60 mb-2">ID: ${product.id}</p>
        <p class="text-sm text-black/60 mb-2">Categoria: ${product.category}</p>
        <div class="flex flex-wrap gap-1 mb-3">
          ${(product.tags || []).map(tag => `<span class="chip">${tag}</span>`).join('')}
        </div>
        <div class="flex gap-2">
          <button onclick="editProduct('${product.id}')" class="btn btn-outline" style="padding: 0.5rem 1rem;">
            <i data-lucide="edit"></i> Editar
          </button>
          <button onclick="deleteProduct('${product.id}')" class="btn btn-danger" style="padding: 0.5rem 1rem;">
            <i data-lucide="trash"></i> Excluir
          </button>
        </div>
        ${!product.active ? '<span class="chip" style="background: #fee2e2; color: #dc2626; margin-top: 0.5rem;">Inativo</span>' : ''}
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    container.innerHTML = '<p class="text-red-600">Erro ao carregar produtos. Verifique se o servidor está rodando.</p>';
  }
}

async function openProductModal(productId = null) {
  editingProductId = productId;
  const modal = document.getElementById('product-modal');
  const form = document.getElementById('product-form');
  const title = document.getElementById('product-modal-title');

  if (productId) {
    try {
      const product = await DB.getProduct(productId);
      if (!product) {
        alert('Produto não encontrado');
        return;
      }
      title.textContent = 'Editar Produto';
      document.getElementById('product-id').value = product.id;
      document.getElementById('product-id-input').value = product.id;
      document.getElementById('product-id-input').disabled = true;
      document.getElementById('product-name').value = product.name;
      document.getElementById('product-price').value = product.price;
      document.getElementById('product-category').value = product.category;
      document.getElementById('product-tags').value = (product.tags || []).join(', ');
      document.getElementById('product-image').value = product.image || '';
      document.getElementById('product-active').checked = product.active !== false;
    } catch (error) {
      alert('Erro ao carregar produto: ' + error.message);
      return;
    }
  } else {
    title.textContent = 'Adicionar Produto';
    form.reset();
    document.getElementById('product-id').value = '';
    document.getElementById('product-id-input').disabled = false;
    document.getElementById('product-active').checked = true;
  }

  modal.classList.add('active');
}

function closeProductModal() {
  const modal = document.getElementById('product-modal');
  modal.classList.remove('active');
  editingProductId = null;
}

async function saveProduct(event) {
  event.preventDefault();

  const idInput = document.getElementById('product-id-input');
  const id = editingProductId || idInput.value.trim();
  const name = document.getElementById('product-name').value.trim();
  const price = parseFloat(document.getElementById('product-price').value);
  const category = document.getElementById('product-category').value;
  const tagsInput = document.getElementById('product-tags').value.trim();
  const image = document.getElementById('product-image').value.trim();
  const active = document.getElementById('product-active').checked;

  const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];

  const productData = {
    id,
    name,
    price,
    category,
    tags,
    image: image || undefined,
    active
  };

  try {
    if (editingProductId) {
      await DB.updateProduct(editingProductId, productData);
      alert('Produto atualizado com sucesso!');
    } else {
      await DB.addProduct(productData);
      alert('Produto adicionado com sucesso!');
    }
    closeProductModal();
    await loadProducts();
  } catch (error) {
    if (error.message.includes('401') || error.message.includes('403')) {
      alert('Sessão expirada. Por favor, faça login novamente.');
      if (typeof logout === 'function') logout();
    } else {
      alert('Erro: ' + error.message);
    }
  }
}

function editProduct(id) {
  openProductModal(id);
}

async function deleteProduct(id) {
  if (!confirm('Tem certeza que deseja excluir este produto?')) {
    return;
  }

  try {
    await DB.deleteProduct(id);
    alert('Produto excluído com sucesso!');
    await loadProducts();
  } catch (error) {
    if (error.message.includes('401') || error.message.includes('403')) {
      alert('Sessão expirada. Por favor, faça login novamente.');
      if (typeof logout === 'function') logout();
    } else {
      alert('Erro: ' + error.message);
    }
  }
}
