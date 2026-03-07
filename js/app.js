// ═══════════════════════════════════════════════════════════════
// DZ SHIELDING TACTICAL - MAIN APPLICATION
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
// STATE MANAGEMENT
// ─────────────────────────────────────────────────────────────────

const state = {
    products: [],
    categories: [],
    cart: JSON.parse(localStorage.getItem('dz_cart')) || [],
    currentCategory: 'all',
    searchQuery: '',
    loading: true
};

// ─────────────────────────────────────────────────────────────────
// DOM ELEMENTS
// ─────────────────────────────────────────────────────────────────

const elements = {
    header: document.getElementById('header'),
    nav: document.getElementById('nav'),
    menuToggle: document.getElementById('menuToggle'),
    cartBtn: document.getElementById('cartBtn'),
    cartCount: document.getElementById('cartCount'),
    productsGrid: document.getElementById('productsGrid'),
    categories: document.getElementById('categories'),
    searchInput: document.getElementById('searchInput'),
    loadingState: document.getElementById('loadingState'),
    emptyState: document.getElementById('emptyState'),
    cartOverlay: document.getElementById('cartOverlay'),
    cartSidebar: document.getElementById('cartSidebar'),
    cartClose: document.getElementById('cartClose'),
    cartItems: document.getElementById('cartItems'),
    cartEmpty: document.getElementById('cartEmpty'),
    cartNotes: document.getElementById('cartNotes'),
    cartNotesWrapper: document.getElementById('cartNotesWrapper'),
    clearCart: document.getElementById('clearCart'),
    requestQuote: document.getElementById('requestQuote'),
    cartActions: document.getElementById('cartActions'),
    productModal: document.getElementById('productModal'),
    modalContent: document.getElementById('modalContent'),
    modalClose: document.getElementById('modalClose'),
    toastContainer: document.getElementById('toastContainer')
};

// ─────────────────────────────────────────────────────────────────
// INITIALIZATION
// ─────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    initScrollEffects();
    initNavigation();
    initCart();
    initModal();
    await loadData();
    renderCategories();
    renderProducts();
});

// ─────────────────────────────────────────────────────────────────
// DATA LOADING
// ─────────────────────────────────────────────────────────────────

async function loadData() {
    state.loading = true;
    showLoading(true);
    
    try {
        // Verificar que el cliente esté disponible
        if (!window.db) {
            throw new Error('Cliente Supabase no inicializado');
        }
        
        // Load categories
        const { data: categories, error: catError } = await window.db
            .from('categorias')
            .select('*')
            .eq('activa', true)
            .order('orden', { ascending: true });
        
        if (catError) throw catError;
        state.categories = categories || [];
        
        // Load products
        const { data: products, error: prodError } = await window.db
            .from('productos')
            .select(`
                *,
                categorias (nombre)
            `)
            .eq('activo', true)
            .order('created_at', { ascending: false });
        
        if (prodError) throw prodError;
        state.products = products || [];
        
        console.log('✅ Datos cargados:', state.products.length, 'productos,', state.categories.length, 'categorías');
        
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Error al cargar los datos. Verifica la conexión.', 'error');
        loadDemoData();
    }
    
    state.loading = false;
    showLoading(false);
}

function loadDemoData() {
    console.log('📦 Cargando datos de demostración...');
    
    state.categories = [
        { id: '1', nombre: 'Protección Personal', slug: 'proteccion-personal' },
        { id: '2', nombre: 'Equipamiento Táctico', slug: 'equipamiento-tactico' },
        { id: '3', nombre: 'Accesorios', slug: 'accesorios' }
    ];
    
    state.products = [
        {
            id: '1',
            nombre: 'Chaleco Táctico Profesional',
            descripcion_corta: 'Chaleco de protección con múltiples bolsillos y sistema MOLLE.',
            descripcion_larga: 'Chaleco táctico de alta resistencia diseñado para operaciones profesionales.',
            imagen_url: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=600',
            categoria_id: '2',
            categorias: { nombre: 'Equipamiento Táctico' }
        },
        {
            id: '2',
            nombre: 'Casco de Protección Ballístico',
            descripcion_corta: 'Casco de protección nivel IIIA con sistema de ajuste.',
            descripcion_larga: 'Casco balístico certificado nivel IIIA con protección contra proyectiles.',
            imagen_url: 'https://images.unsplash.com/photo-1595590424252-552d5f0a9a21?w=600',
            categoria_id: '1',
            categorias: { nombre: 'Protección Personal' }
        },
        {
            id: '3',
            nombre: 'Guantes Tácticos Reforzados',
            descripcion_corta: 'Guantes de combate con protección en nudillos.',
            descripcion_larga: 'Guantes tácticos profesionales con refuerzo en nudillos.',
            imagen_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600',
            categoria_id: '3',
            categorias: { nombre: 'Accesorios' }
        },
        {
            id: '4',
            nombre: 'Mochila Táctica 45L',
            descripcion_corta: 'Mochila de assault con sistema hidratación.',
            descripcion_larga: 'Mochila táctica de 45 litros con compartimento para sistema de hidratación.',
            imagen_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
            categoria_id: '2',
            categorias: { nombre: 'Equipamiento Táctico' }
        }
    ];
    
    showToast('Modo demostración - Conecta Supabase para datos reales', 'error');
}

// ─────────────────────────────────────────────────────────────────
// SCROLL EFFECTS
// ─────────────────────────────────────────────────────────────────

function initScrollEffects() {
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 50) {
            elements.header.classList.add('scrolled');
        } else {
            elements.header.classList.remove('scrolled');
        }
    });
}

// ─────────────────────────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────────────────────────

function initNavigation() {
    elements.menuToggle.addEventListener('click', () => {
        elements.nav.classList.toggle('active');
        elements.menuToggle.classList.toggle('active');
    });
    
    document.querySelectorAll('[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            const target = document.getElementById(section);
            
            if (target) {
                elements.nav.classList.remove('active');
                elements.menuToggle.classList.remove('active');
                
                const headerHeight = elements.header.offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                document.querySelector(`.nav-link[data-section="${section}"]`)?.classList.add('active');
            }
        });
    });
    
    elements.searchInput.addEventListener('input', debounce((e) => {
        state.searchQuery = e.target.value.toLowerCase();
        renderProducts();
    }, 300));
}

// ─────────────────────────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────────────────────────

function renderCategories() {
    const existingBtns = elements.categories.querySelectorAll('.category-btn:not([data-category="all"])');
    existingBtns.forEach(btn => btn.remove());
    
    state.categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.dataset.category = category.id;
        btn.textContent = category.nombre;
        elements.categories.appendChild(btn);
    });
    
    elements.categories.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            elements.categories.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentCategory = btn.dataset.category;
            renderProducts();
        });
    });
}

// ─────────────────────────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────────────────────────

function renderProducts() {
    let filtered = [...state.products];
    
    if (state.currentCategory !== 'all') {
        filtered = filtered.filter(p => p.categoria_id === state.currentCategory);
    }
    
    if (state.searchQuery) {
        filtered = filtered.filter(p => 
            p.nombre.toLowerCase().includes(state.searchQuery) ||
            p.descripcion_corta?.toLowerCase().includes(state.searchQuery)
        );
    }
    
    elements.productsGrid.innerHTML = '';
    
    if (state.loading) {
        elements.emptyState.style.display = 'none';
        return;
    }
    
    if (filtered.length === 0) {
        elements.emptyState.style.display = 'flex';
        return;
    }
    
    elements.emptyState.style.display = 'none';
    
    filtered.forEach((product, index) => {
        const card = createProductCard(product, index);
        elements.productsGrid.appendChild(card);
    });
}

function createProductCard(product, index) {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.style.animationDelay = `${index * 0.05}s`;
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.imagen_url || 'https://via.placeholder.com/400x300?text=Sin+Imagen'}" 
                 alt="${product.nombre}" 
                 loading="lazy">
            ${product.destacado ? '<span class="product-badge">Destacado</span>' : ''}
        </div>
        <div class="product-content">
            <h3 class="product-name">${product.nombre}</h3>
            <p class="product-desc">${product.descripcion_corta || ''}</p>
            <div class="product-actions">
                <button class="btn btn-ghost view-details">Ver Detalles</button>
                <button class="btn btn-primary add-to-cart">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Agregar
                </button>
            </div>
        </div>
    `;
    
    card.querySelector('.view-details').addEventListener('click', () => openProductModal(product));
    card.querySelector('.add-to-cart').addEventListener('click', () => addToCart(product));
    card.querySelector('.product-image').addEventListener('click', () => openProductModal(product));
    
    return card;
}

function showLoading(show) {
    elements.loadingState.style.display = show ? 'flex' : 'none';
    elements.productsGrid.style.display = show ? 'none' : 'grid';
}

// ─────────────────────────────────────────────────────────────────
// CART
// ─────────────────────────────────────────────────────────────────

function initCart() {
    elements.cartBtn.addEventListener('click', openCart);
    elements.cartClose.addEventListener('click', closeCart);
    elements.cartOverlay.addEventListener('click', closeCart);
    
    elements.clearCart.addEventListener('click', () => {
        state.cart = [];
        saveCart();
        renderCart();
        showToast('Carrito vaciado', 'success');
    });
    
    elements.requestQuote.addEventListener('click', requestQuote);
    
    updateCartCount();
    renderCart();
}

function openCart() {
    elements.cartOverlay.classList.add('active');
    elements.cartSidebar.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    elements.cartOverlay.classList.remove('active');
    elements.cartSidebar.classList.remove('active');
    document.body.style.overflow = '';
}

function addToCart(product) {
    const existingItem = state.cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        state.cart.push({
            id: product.id,
            nombre: product.nombre,
            imagen_url: product.imagen_url,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartCount();
    renderCart();
    showToast('Producto agregado al carrito', 'success');
}

function removeFromCart(productId) {
    state.cart = state.cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    renderCart();
}

function updateQuantity(productId, delta) {
    const item = state.cart.find(i => i.id === productId);
    if (item) {
        item.quantity = Math.max(1, item.quantity + delta);
        saveCart();
        renderCart();
    }
}

function saveCart() {
    localStorage.setItem('dz_cart', JSON.stringify(state.cart));
}

function updateCartCount() {
    const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    elements.cartCount.textContent = count;
    elements.cartCount.classList.toggle('visible', count > 0);
}

function renderCart() {
    if (state.cart.length === 0) {
        elements.cartItems.innerHTML = '';
        elements.cartEmpty.style.display = 'flex';
        elements.cartNotesWrapper.style.display = 'none';
        elements.cartActions.style.display = 'none';
        return;
    }
    
    elements.cartEmpty.style.display = 'none';
    elements.cartNotesWrapper.style.display = 'block';
    elements.cartActions.style.display = 'flex';
    
    elements.cartItems.innerHTML = state.cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.imagen_url || 'https://via.placeholder.com/100'}" alt="${item.nombre}">
            </div>
            <div class="cart-item-info">
                <span class="cart-item-name">${item.nombre}</span>
                <div class="cart-item-quantity">
                    <button class="qty-btn" data-action="decrease" data-id="${item.id}">−</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
                </div>
            </div>
            <button class="cart-item-remove" data-id="${item.id}">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                </svg>
            </button>
        </div>
    `).join('');
    
    elements.cartItems.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const action = btn.dataset.action;
            updateQuantity(id, action === 'increase' ? 1 : -1);
        });
    });
    
    elements.cartItems.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            removeFromCart(btn.dataset.id);
        });
    });
}

function requestQuote() {
    const notes = document.getElementById('cartNotes').value;
    const items = state.cart.map(item => `• ${item.nombre} (x${item.quantity})`).join('\n');
    
    const message = `Hola, solicito cotización para los siguientes productos:\n\n${items}\n\n${notes ? 'Notas: ' + notes : ''}`;
    const phone = '51999999999';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    
    window.open(url, '_blank');
}

// ─────────────────────────────────────────────────────────────────
// PRODUCT MODAL
// ─────────────────────────────────────────────────────────────────

function initModal() {
    elements.modalClose.addEventListener('click', closeModal);
    elements.productModal.addEventListener('click', (e) => {
        if (e.target === elements.productModal) closeModal();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

function openProductModal(product) {
    elements.modalContent.innerHTML = `
        <div class="modal-image">
            <img src="${product.imagen_url || 'https://via.placeholder.com/600x600?text=Sin+Imagen'}" 
                 alt="${product.nombre}">
        </div>
        <div class="modal-details">
            ${product.categorias?.nombre ? `<span class="modal-category">${product.categorias.nombre}</span>` : ''}
            <h2 class="modal-title">${product.nombre}</h2>
            <p class="modal-description">${product.descripcion_larga || product.descripcion_corta || ''}</p>
            <div class="modal-actions">
                <button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
                <button class="btn btn-primary modal-add-cart">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Agregar al Carrito
                </button>
            </div>
        </div>
    `;
    
    elements.modalContent.querySelector('.modal-add-cart').addEventListener('click', () => {
        addToCart(product);
        closeModal();
    });
    
    elements.productModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    elements.productModal.classList.remove('active');
    document.body.style.overflow = '';
}

window.closeModal = closeModal;

// ─────────────────────────────────────────────────────────────────
// TOAST NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            ${type === 'success' 
                ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
                : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
            }
        </div>
        <span class="toast-message">${message}</span>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ─────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}