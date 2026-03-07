// ═════════════════════════════════════════════════════════════════
// DZ SHIELDING TACTICAL - ADMIN PANEL
// ═════════════════════════════════════════════════════════════════

const adminState = {
    user: null,
    products: [],
    categories: [],
    currentTab: 'dashboard',
    editingProduct: null,
    editingCategory: null
};

const adminElements = {};

// ═══════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Admin Panel Initializing...');
    
    initElements();
    initAuth();
    initMobileNavigation();
    initNavigation();
    initModals();
    initForms();
    initQuickActions();
    
    console.log('✅ Admin Panel Ready');
});

// ═══════════════════════════════════════════════════════════════
// ELEMENTS
// ═══════════════════════════════════════════════════════════════

function initElements() {
    adminElements.loginScreen = document.getElementById('loginScreen');
    adminElements.loginForm = document.getElementById('loginForm');
    adminElements.loginEmail = document.getElementById('loginEmail');
    adminElements.loginPassword = document.getElementById('loginPassword');
    adminElements.loginError = document.getElementById('loginError');
    adminElements.adminDashboard = document.getElementById('adminDashboard');
    adminElements.logoutBtn = document.getElementById('logoutBtn');
    adminElements.menuToggleAdmin = document.getElementById('menuToggleAdmin');
    adminElements.sidebarOverlay = document.getElementById('sidebarOverlay');
    adminElements.adminSidebar = document.getElementById('adminSidebar');
    adminElements.navItems = document.querySelectorAll('.nav-item');
    adminElements.tabs = document.querySelectorAll('.admin-tab');
    adminElements.totalProducts = document.getElementById('totalProducts');
    adminElements.totalCategories = document.getElementById('totalCategories');
    adminElements.addProductBtn = document.getElementById('addProductBtn');
    adminElements.productsTableBody = document.getElementById('productsTableBody');
    adminElements.productsMobile = document.getElementById('productsMobile');
    adminElements.productModal = document.getElementById('productModal');
    adminElements.productForm = document.getElementById('productForm');
    adminElements.productModalTitle = document.getElementById('productModalTitle');
    adminElements.productId = document.getElementById('productId');
    adminElements.productName = document.getElementById('productName');
    adminElements.productCategory = document.getElementById('productCategory');
    adminElements.productShortDesc = document.getElementById('productShortDesc');
    adminElements.productLongDesc = document.getElementById('productLongDesc');
    adminElements.productImage = document.getElementById('productImage');
    adminElements.imagePreview = document.getElementById('imagePreview');
    adminElements.uploadArea = document.getElementById('uploadArea');
    adminElements.productFeatured = document.getElementById('productFeatured');
    adminElements.productActive = document.getElementById('productActive');
    adminElements.addCategoryBtn = document.getElementById('addCategoryBtn');
    adminElements.categoriesGrid = document.getElementById('categoriesGrid');
    adminElements.categoryModal = document.getElementById('categoryModal');
    adminElements.categoryForm = document.getElementById('categoryForm');
    adminElements.categoryModalTitle = document.getElementById('categoryModalTitle');
    adminElements.categoryId = document.getElementById('categoryId');
    adminElements.categoryName = document.getElementById('categoryName');
    adminElements.categoryDesc = document.getElementById('categoryDesc');
    adminElements.categoryOrder = document.getElementById('categoryOrder');
    adminElements.confirmModal = document.getElementById('confirmModal');
    adminElements.confirmMessage = document.getElementById('confirmMessage');
    adminElements.confirmBtn = document.getElementById('confirmBtn');
    adminElements.toastContainer = document.getElementById('toastContainer');
    
    console.log('📦 Elements loaded:', Object.keys(adminElements).length);
}

// ═══════════════════════════════════════════════════════════════
// MOBILE NAVIGATION
// ═══════════════════════════════════════════════════════════════

function initMobileNavigation() {
    console.log('📱 Initializing mobile navigation...');
    
    if (adminElements.menuToggleAdmin) {
        adminElements.menuToggleAdmin.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🍔 Menu toggle clicked');
            toggleSidebar();
        });
    } else {
        console.warn('⚠️ menuToggleAdmin not found');
    }
    
    if (adminElements.sidebarOverlay) {
        adminElements.sidebarOverlay.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🌫️ Overlay clicked');
            closeSidebar();
        });
    } else {
        console.warn('⚠️ sidebarOverlay not found');
    }
}

function toggleSidebar() {
    console.log('🔄 Toggling sidebar...');
    
    if (adminElements.adminSidebar) {
        adminElements.adminSidebar.classList.toggle('active');
    }
    if (adminElements.sidebarOverlay) {
        adminElements.sidebarOverlay.classList.toggle('active');
    }
}

function closeSidebar() {
    console.log('❌ Closing sidebar...');
    
    if (adminElements.adminSidebar) {
        adminElements.adminSidebar.classList.remove('active');
    }
    if (adminElements.sidebarOverlay) {
        adminElements.sidebarOverlay.classList.remove('active');
    }
}

// ═══════════════════════════════════════════════════════════════
// AUTHENTICATION
// ═══════════════════════════════════════════════════════════════

function initAuth() {
    console.log('🔐 Initializing auth...');
    
    if (!window.supabaseClient) {
        console.error('❌ Supabase client not found!');
        showToast('Error: Supabase no está configurado', 'error');
        return;
    }
    
    window.supabaseClient.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            adminState.user = session.user;
            showDashboard();
        }
    });
    
    window.supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('🔐 Auth event:', event);
        if (event === 'SIGNED_IN' && session) {
            adminState.user = session.user;
            showDashboard();
        } else if (event === 'SIGNED_OUT') {
            adminState.user = null;
            showLogin();
        }
    });
    
    if (adminElements.loginForm) {
        adminElements.loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleLogin();
        });
    }
    
    if (adminElements.logoutBtn) {
        adminElements.logoutBtn.addEventListener('click', handleLogout);
    }
}

async function handleLogin() {
    const email = adminElements.loginEmail?.value;
    const password = adminElements.loginPassword?.value;
    
    console.log('🔑 Attempting login:', email);
    
    try {
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        adminState.user = data.user;
        showDashboard();
        showToast('Sesión iniciada correctamente', 'success');
        
    } catch (error) {
        console.error('❌ Login error:', error);
        if (adminElements.loginError) {
            adminElements.loginError.textContent = error.message;
        }
    }
}

async function handleLogout() {
    await window.supabaseClient.auth.signOut();
    showLogin();
    showToast('Sesión cerrada', 'success');
}

function showLogin() {
    if (adminElements.loginScreen) {
        adminElements.loginScreen.style.display = 'flex';
    }
    if (adminElements.adminDashboard) {
        adminElements.adminDashboard.style.display = 'none';
    }
}

function showDashboard() {
    if (adminElements.loginScreen) {
        adminElements.loginScreen.style.display = 'none';
    }
    if (adminElements.adminDashboard) {
        adminElements.adminDashboard.style.display = 'flex';
    }
    loadData();
}

// ═══════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════

function initNavigation() {
    console.log('🧭 Initializing navigation...');
    
    adminElements.navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const tab = this.dataset.tab;
            console.log('📍 Tab clicked:', tab);
            switchTab(tab);
            
            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    });
}

function switchTab(tab) {
    adminState.currentTab = tab;
    
    adminElements.navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tab);
    });
    
    adminElements.tabs.forEach(t => {
        t.classList.toggle('active', t.id === `tab-${tab}`);
    });
}

// ═══════════════════════════════════════════════════════════════
// DATA LOADING
// ═══════════════════════════════════════════════════════════════

async function loadData() {
    console.log('📊 Loading data...');
    await Promise.all([loadProducts(), loadCategories()]);
    updateStats();
}

async function loadProducts() {
    try {
        const { data, error } = await window.supabaseClient
            .from('productos')
            .select(`*, categorias (nombre)`)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        adminState.products = data || [];
        renderProducts();
        console.log('✅ Products loaded:', adminState.products.length);
    } catch (error) {
        console.error('❌ Error loading products:', error);
        loadDemoProducts();
    }
}

function loadDemoProducts() {
    adminState.products = [
        {
            id: '1',
            nombre: 'Chaleco Táctico Profesional',
            descripcion_corta: 'Chaleco de protección con múltiples bolsillos',
            imagen_url: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=200',
            activo: true,
            destacado: true,
            categorias: { nombre: 'Equipamiento Táctico' }
        },
        {
            id: '2',
            nombre: 'Casco de Protección',
            descripcion_corta: 'Casco nivel IIIA',
            imagen_url: 'https://images.unsplash.com/photo-1595590424252-552d5f0a9a21?w=200',
            activo: true,
            destacado: false,
            categorias: { nombre: 'Protección Personal' }
        }
    ];
    renderProducts();
}
async function loadCategories() {
    try {
        const { data, error } = await window.supabaseClient
            .from('categorias')
            .select('*')
            .order('orden', { ascending: true });
        
        if (error) throw error;
        adminState.categories = data || [];
        renderCategories();
        updateCategorySelect();
        console.log('✅ Categories loaded:', adminState.categories.length);
    } catch (error) {
        console.error('❌ Error loading categories:', error);
        loadDemoCategories();
    }
}

function loadDemoCategories() {
    adminState.categories = [
        { id: '1', nombre: 'Categoría Demo', descripcion: 'Descripción demo' }
    ];
    renderCategories();
    updateCategorySelect();
}

function updateStats() {
    if (adminElements.totalProducts) {
        adminElements.totalProducts.textContent = adminState.products.length;
    }
    if (adminElements.totalCategories) {
        adminElements.totalCategories.textContent = adminState.categories.length;
    }
}

// ═══════════════════════════════════════════════════════════════
// PRODUCTS RENDERING
// ═══════════════════════════════════════════════════════════════

function renderProducts() {
    // Desktop Table
    if (adminElements.productsTableBody) {
        adminElements.productsTableBody.innerHTML = adminState.products.map(product => `
            <tr>
                <td>
                    <div class="table-image">
                        <img src="${product.imagen_url || 'https://via.placeholder.com/100'}" alt="${product.nombre}">
                    </div>
                </td>
                <td>${product.nombre}</td>
                <td>${product.categorias?.nombre || '-'}</td>
                <td>
                    <span class="status-badge ${product.activo ? 'active' : 'inactive'}">
                        ${product.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="table-btn edit-product" data-id="${product.id}" type="button">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="table-btn delete delete-product" data-id="${product.id}" type="button">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    // Mobile Cards
    if (adminElements.productsMobile) {
        adminElements.productsMobile.innerHTML = adminState.products.map(product => `
            <div class="product-mobile-card">
                <div class="product-mobile-card-header">
                    <div class="product-mobile-card-image">
                        <img src="${product.imagen_url || 'https://via.placeholder.com/100'}" alt="${product.nombre}">
                    </div>
                    <div class="product-mobile-card-info">
                        <div class="product-mobile-card-name">${product.nombre}</div>
                        <div class="product-mobile-card-category">${product.categorias?.nombre || 'Sin categoría'}</div>
                        <span class="product-mobile-card-status ${product.activo ? 'active' : 'inactive'}">
                            ${product.activo ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                </div>
                <div class="product-mobile-card-actions">
                    <button class="edit-product" data-id="${product.id}" type="button">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Editar
                    </button>
                    <button class="delete delete-product" data-id="${product.id}" type="button">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                        Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Event listeners
    document.querySelectorAll('.edit-product').forEach(btn => {
        btn.addEventListener('click', () => editProduct(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-product').forEach(btn => {
        btn.addEventListener('click', () => confirmDeleteProduct(btn.dataset.id));
    });
}

function editProduct(id) {
    const product = adminState.products.find(p => p.id === id);
    if (!product) return;
    
    adminState.editingProduct = product;
    
    if (adminElements.productModalTitle) {
        adminElements.productModalTitle.textContent = 'Editar Producto';
    }
    if (adminElements.productId) {
        adminElements.productId.value = product.id;
    }
    if (adminElements.productName) {
        adminElements.productName.value = product.nombre;
    }
    if (adminElements.productCategory) {
        adminElements.productCategory.value = product.categoria_id || '';
    }
    if (adminElements.productShortDesc) {
        adminElements.productShortDesc.value = product.descripcion_corta || '';
    }
    if (adminElements.productLongDesc) {
        adminElements.productLongDesc.value = product.descripcion_larga || '';
    }
    if (adminElements.productFeatured) {
        adminElements.productFeatured.checked = product.destacado || false;
    }
    if (adminElements.productActive) {
        adminElements.productActive.checked = product.activo !== false;
    }
    
    if (product.imagen_url && adminElements.imagePreview) {
        adminElements.imagePreview.innerHTML = `<img src="${product.imagen_url}" alt="Preview">`;
        adminElements.imagePreview.classList.add('has-image');
    }
    
    openModal('productModal');
}

function confirmDeleteProduct(id) {
    if (adminElements.confirmMessage) {
        adminElements.confirmMessage.textContent = '¿Estás seguro de eliminar este producto?';
    }
    if (adminElements.confirmBtn) {
        adminElements.confirmBtn.onclick = () => deleteProduct(id);
    }
    openModal('confirmModal');
}

async function deleteProduct(id) {
    try {
        const { error } = await window.supabaseClient
            .from('productos')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        adminState.products = adminState.products.filter(p => p.id !== id);
        renderProducts();
        updateStats();
        closeModal('confirmModal');
        showToast('Producto eliminado', 'success');
    } catch (error) {
        console.error('Error deleting product:', error);
        showToast('Error al eliminar', 'error');
    }
}

// ═══════════════════════════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════════════════════════

function renderCategories() {
    if (!adminElements.categoriesGrid) return;
    
    adminElements.categoriesGrid.innerHTML = adminState.categories.map(category => `
        <div class="category-card">
            <div class="category-card-header">
                <h4>${category.nombre}</h4>
                <span class="status-badge ${category.activa !== false ? 'active' : 'inactive'}">
                    ${category.activa !== false ? 'Activa' : 'Inactiva'}
                </span>
            </div>
            <p>${category.descripcion || 'Sin descripción'}</p>
            <div class="category-card-footer">
                <button class="table-btn edit-category" data-id="${category.id}" type="button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </button>
                <button class="table-btn delete delete-category" data-id="${category.id}" type="button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.edit-category').forEach(btn => {
        btn.addEventListener('click', () => editCategory(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-category').forEach(btn => {
        btn.addEventListener('click', () => confirmDeleteCategory(btn.dataset.id));
    });
}

function updateCategorySelect() {
    if (!adminElements.productCategory) return;
    
    adminElements.productCategory.innerHTML = '<option value="">Seleccionar categoría</option>';
    
    adminState.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.nombre;
        adminElements.productCategory.appendChild(option);
    });
}

function editCategory(id) {
    const category = adminState.categories.find(c => c.id === id);
    if (!category) return;
    
    adminState.editingCategory = category;
    
    if (adminElements.categoryModalTitle) {
        adminElements.categoryModalTitle.textContent = 'Editar Categoría';
    }
    if (adminElements.categoryId) {
        adminElements.categoryId.value = category.id;
    }
    if (adminElements.categoryName) {
        adminElements.categoryName.value = category.nombre;
    }
    if (adminElements.categoryDesc) {
        adminElements.categoryDesc.value = category.descripcion || '';
    }
    if (adminElements.categoryOrder) {
        adminElements.categoryOrder.value = category.orden || 0;
    }
    
    openModal('categoryModal');
}

function confirmDeleteCategory(id) {
    if (adminElements.confirmMessage) {
        adminElements.confirmMessage.textContent = '¿Estás seguro de eliminar esta categoría?';
    }
    if (adminElements.confirmBtn) {
        adminElements.confirmBtn.onclick = () => deleteCategory(id);
    }
    openModal('confirmModal');
}

async function deleteCategory(id) {
    try {
        const { error } = await window.supabaseClient
            .from('categorias')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        adminState.categories = adminState.categories.filter(c => c.id !== id);
        renderCategories();
        updateCategorySelect();
        updateStats();
        closeModal('confirmModal');
        showToast('Categoría eliminada', 'success');
    } catch (error) {
        console.error('Error deleting category:', error);
        showToast('Error al eliminar', 'error');
    }
}

// ═══════════════════════════════════════════════════════════════
// MODALS
// ═══════════════════════════════════════════════════════════════

function initModals() {
    console.log('🔲 Initializing modals...');
    
    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', function() {
            closeModal(this.dataset.close);
        });
    });
    
    document.querySelectorAll('.admin-modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    if (modalId === 'productModal') {
        resetProductForm();
    } else if (modalId === 'categoryModal') {
        resetCategoryForm();
    }
}

function resetProductForm() {
    adminState.editingProduct = null;
    if (adminElements.productForm) {
        adminElements.productForm.reset();
    }
    if (adminElements.productModalTitle) {
        adminElements.productModalTitle.textContent = 'Nuevo Producto';
    }
    if (adminElements.productId) {
        adminElements.productId.value = '';
    }
    if (adminElements.productActive) {
        adminElements.productActive.checked = true;
    }
    if (adminElements.imagePreview) {
        adminElements.imagePreview.innerHTML = `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>Click o arrastra una imagen</span>
        `;
        adminElements.imagePreview.classList.remove('has-image');
    }
}

function resetCategoryForm() {
    adminState.editingCategory = null;
    if (adminElements.categoryForm) {
        adminElements.categoryForm.reset();
    }
    if (adminElements.categoryModalTitle) {
        adminElements.categoryModalTitle.textContent = 'Nueva Categoría';
    }
    if (adminElements.categoryId) {
        adminElements.categoryId.value = '';
    }
    if (adminElements.categoryOrder) {
        adminElements.categoryOrder.value = '0';
    }
}

// ═══════════════════════════════════════════════════════════════
// FORMS
// ═══════════════════════════════════════════════════════════════

function initForms() {
    console.log('📝 Initializing forms...');
    
    if (adminElements.productForm) {
        adminElements.productForm.addEventListener('submit', handleProductSubmit);
    }
    
    if (adminElements.categoryForm) {
        adminElements.categoryForm.addEventListener('submit', handleCategorySubmit);
    }
    
    // Image upload
    const uploadArea = adminElements.uploadArea || adminElements.imagePreview;
    const fileInput = adminElements.productImage;
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--accent-tactical)';
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = '';
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '';
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                handleImagePreview(e.dataTransfer.files[0]);
            }
        });
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleImagePreview(e.target.files[0]);
            }
        });
    }
    
    // Add buttons
    if (adminElements.addProductBtn) {
        adminElements.addProductBtn.addEventListener('click', () => {
            resetProductForm();
            openModal('productModal');
        });
    }
    
    if (adminElements.addCategoryBtn) {
        adminElements.addCategoryBtn.addEventListener('click', () => {
            resetCategoryForm();
            openModal('categoryModal');
        });
    }
}

function handleImagePreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        if (adminElements.imagePreview) {
            adminElements.imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            adminElements.imagePreview.classList.add('has-image');
        }
    };
    reader.readAsDataURL(file);
}

async function handleProductSubmit(e) {
    e.preventDefault();
    
    const formData = {
        nombre: adminElements.productName?.value,
        slug: generateSlug(adminElements.productName?.value || ''),
        descripcion_corta: adminElements.productShortDesc?.value,
        descripcion_larga: adminElements.productLongDesc?.value,
        categoria_id: adminElements.productCategory?.value || null,
        destacado: adminElements.productFeatured?.checked || false,
        activo: adminElements.productActive?.checked !== false,
        updated_at: new Date().toISOString()
    };
    
    try {
        const imageFile = adminElements.productImage?.files[0];
        if (imageFile) {
            const imagePath = `productos/${Date.now()}_${imageFile.name}`;
            const { error: uploadError } = await window.supabaseClient.storage
                .from('productos')
                .upload(imagePath, imageFile);
            
            if (uploadError) throw uploadError;
            
            const { data: urlData } = window.supabaseClient.storage
                .from('productos')
                .getPublicUrl(imagePath);
            
            formData.imagen_url = urlData.publicUrl;
        }
        
        let result;
        if (adminState.editingProduct) {
            result = await window.supabaseClient
                .from('productos')
                .update(formData)
                .eq('id', adminState.editingProduct.id)
                .select();
        } else {
            formData.created_at = new Date().toISOString();
            result = await window.supabaseClient
                .from('productos')
                .insert([formData])
                .select();
        }
        
        const { data, error } = result;
        if (error) throw error;
        
        if (adminState.editingProduct) {
            const index = adminState.products.findIndex(p => p.id === adminState.editingProduct.id);
            if (index !== -1) {
                adminState.products[index] = { ...adminState.products[index], ...formData, ...data[0] };
            }
        } else {
            adminState.products.unshift(data[0]);
        }
        
        renderProducts();
        updateStats();
        closeModal('productModal');
        showToast(adminState.editingProduct ? 'Producto actualizado' : 'Producto creado', 'success');
    } catch (error) {
        console.error('Error saving product:', error);
        showToast('Error: ' + error.message, 'error');
    }
}

async function handleCategorySubmit(e) {
    e.preventDefault();
    
    const formData = {
        nombre: adminElements.categoryName?.value,
        slug: generateSlug(adminElements.categoryName?.value || ''),
        descripcion: adminElements.categoryDesc?.value,
        orden: parseInt(adminElements.categoryOrder?.value) || 0,
        activa: true
    };
    
    try {
        let result;
        if (adminState.editingCategory) {
            result = await window.supabaseClient
                .from('categorias')
                .update(formData)
                .eq('id', adminState.editingCategory.id)
                .select();
        } else {
            result = await window.supabaseClient
                .from('categorias')
                .insert([formData])
                .select();
        }
        
        const { data, error } = result;
        if (error) throw error;
        
        if (adminState.editingCategory) {
            const index = adminState.categories.findIndex(c => c.id === adminState.editingCategory.id);
            if (index !== -1) {
                adminState.categories[index] = { ...adminState.categories[index], ...formData };
            }
        } else {
            adminState.categories.push(data[0]);
        }
        
        renderCategories();
        updateCategorySelect();
        updateStats();
        closeModal('categoryModal');
        showToast(adminState.editingCategory ? 'Categoría actualizada' : 'Categoría creada', 'success');
    } catch (error) {
        console.error('Error saving category:', error);
        showToast('Error: ' + error.message, 'error');
    }
}

// ═══════════════════════════════════════════════════════════════
// QUICK ACTIONS
// ═══════════════════════════════════════════════════════════════

function initQuickActions() {
    console.log('⚡ Initializing quick actions...');
    
    document.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.dataset.action;
            
            if (action === 'add-product') {
                switchTab('products');
                resetProductForm();
                openModal('productModal');
            } else if (action === 'add-category') {
                switchTab('categories');
                resetCategoryForm();
                openModal('categoryModal');
            }
        });
    });
}

// ═══════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════

function generateSlug(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function showToast(message, type = 'success') {
    if (!adminElements.toastContainer) return;
    
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
    
    adminElements.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Global functions
window.openModal = openModal;
window.closeModal = closeModal;