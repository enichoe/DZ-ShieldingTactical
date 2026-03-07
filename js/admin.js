// ═══════════════════════════════════════════════════════════════
// DZ SHIELDING TACTICAL - ADMIN PANEL
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────────

const adminState = {
    user: null,
    products: [],
    categories: [],
    currentTab: 'dashboard',
    editingProduct: null,
    editingCategory: null
};

// ─────────────────────────────────────────────────────────────────
// DOM ELEMENTS
// ─────────────────────────────────────────────────────────────────

const adminElements = {
    // Login
    loginScreen: document.getElementById('loginScreen'),
    loginForm: document.getElementById('loginForm'),
    loginEmail: document.getElementById('loginEmail'),
    loginPassword: document.getElementById('loginPassword'),
    loginError: document.getElementById('loginError'),
    
    // Dashboard
    adminDashboard: document.getElementById('adminDashboard'),
    logoutBtn: document.getElementById('logoutBtn'),
    
    // Navigation
    navItems: document.querySelectorAll('.nav-item'),
    tabs: document.querySelectorAll('.admin-tab'),
    
    // Stats
    totalProducts: document.getElementById('totalProducts'),
    totalCategories: document.getElementById('totalCategories'),
    
    // Products
    addProductBtn: document.getElementById('addProductBtn'),
    productsTableBody: document.getElementById('productsTableBody'),
    productModal: document.getElementById('productModal'),
    productForm: document.getElementById('productForm'),
    productModalTitle: document.getElementById('productModalTitle'),
    productId: document.getElementById('productId'),
    productName: document.getElementById('productName'),
    productCategory: document.getElementById('productCategory'),
    productShortDesc: document.getElementById('productShortDesc'),
    productLongDesc: document.getElementById('productLongDesc'),
    productImage: document.getElementById('productImage'),
    imagePreview: document.getElementById('imagePreview'),
    productFeatured: document.getElementById('productFeatured'),
    productActive: document.getElementById('productActive'),
    
    // Categories
    addCategoryBtn: document.getElementById('addCategoryBtn'),
    categoriesGrid: document.getElementById('categoriesGrid'),
    categoryModal: document.getElementById('categoryModal'),
    categoryForm: document.getElementById('categoryForm'),
    categoryModalTitle: document.getElementById('categoryModalTitle'),
    categoryId: document.getElementById('categoryId'),
    categoryName: document.getElementById('categoryName'),
    categoryDesc: document.getElementById('categoryDesc'),
    categoryOrder: document.getElementById('categoryOrder'),
    
    // Confirm
    confirmModal: document.getElementById('confirmModal'),
    confirmMessage: document.getElementById('confirmMessage'),
    confirmBtn: document.getElementById('confirmBtn'),
    
    // Toast
    toastContainer: document.getElementById('toastContainer')
};

// ─────────────────────────────────────────────────────────────────
// INITIALIZATION
// ─────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    initAuth();
    initNavigation();
    initModals();
    initForms();
    initQuickActions();
});

// ─────────────────────────────────────────────────────────────────
// AUTHENTICATION
// ─────────────────────────────────────────────────────────────────

function initAuth() {
    // Check existing session
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            adminState.user = session.user;
            showDashboard();
        }
    });
    
    // Listen for auth changes
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
            adminState.user = session.user;
            showDashboard();
        } else if (event === 'SIGNED_OUT') {
            adminState.user = null;
            showLogin();
        }
    });
    
    // Login form
    adminElements.loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleLogin();
    });
    
    // Logout
    adminElements.logoutBtn.addEventListener('click', handleLogout);
}

async function handleLogin() {
    const email = adminElements.loginEmail.value;
    const password = adminElements.loginPassword.value;
    
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        adminState.user = data.user;
        showDashboard();
        
    } catch (error) {
        adminElements.loginError.textContent = error.message;
    }
}

async function handleLogout() {
    await supabaseClient.auth.signOut();
    showLogin();
}

function showLogin() {
    adminElements.loginScreen.style.display = 'flex';
    adminElements.adminDashboard.style.display = 'none';
}

function showDashboard() {
    adminElements.loginScreen.style.display = 'none';
    adminElements.adminDashboard.style.display = 'flex';
    loadData();
}

// ─────────────────────────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────────────────────────

function initNavigation() {
    adminElements.navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tab = item.dataset.tab;
            switchTab(tab);
        });
    });
}

function switchTab(tab) {
    adminState.currentTab = tab;
    
    // Update nav
    adminElements.navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tab);
    });
    
    // Update tabs
    adminElements.tabs.forEach(t => {
        t.classList.toggle('active', t.id === `tab-${tab}`);
    });
}

// ─────────────────────────────────────────────────────────────────
// DATA LOADING
// ─────────────────────────────────────────────────────────────────

async function loadData() {
    await Promise.all([
        loadProducts(),
        loadCategories()
    ]);
    updateStats();
}

async function loadProducts() {
    try {
        const { data, error } = await supabaseClient
            .from('productos')
            .select(`
                *,
                categorias (nombre)
            `)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        adminState.products = data || [];
        renderProducts();
        
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Error al cargar productos', 'error');
        // Load demo data
        loadDemoProducts();
    }
}

function loadDemoProducts() {
    adminState.products = [
        {
            id: '1',
            nombre: 'Chaleco Táctico Profesional',
            descripcion_corta: 'Chaleco de protección con múltiples bolsillos',
            imagen_url: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=100',
            activo: true,
            destacado: true,
            categorias: { nombre: 'Equipamiento Táctico' }
        }
    ];
    renderProducts();
}

async function loadCategories() {
    try {
        const { data, error } = await supabaseClient
            .from('categorias')
            .select('*')
            .order('orden', { ascending: true });
        
        if (error) throw error;
        adminState.categories = data || [];
        renderCategories();
        updateCategorySelect();
        
    } catch (error) {
        console.error('Error loading categories:', error);
        loadDemoCategories();
    }
}

function loadDemoCategories() {
    adminState.categories = [
        { id: '1', nombre: 'Protección Personal', descripcion: 'Equipos de protección', orden: 1 },
        { id: '2', nombre: 'Equipamiento Táctico', descripcion: 'Equipos tácticos', orden: 2 }
    ];
    renderCategories();
    updateCategorySelect();
}

function updateStats() {
    adminElements.totalProducts.textContent = adminState.products.length;
    adminElements.totalCategories.textContent = adminState.categories.length;
}

// ─────────────────────────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────────────────────────

function renderProducts() {
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
                    <button class="table-btn edit-product" data-id="${product.id}" title="Editar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="table-btn delete delete-product" data-id="${product.id}" title="Eliminar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // Add event listeners
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
    
    adminElements.productModalTitle.textContent = 'Editar Producto';
    adminElements.productId.value = product.id;
    adminElements.productName.value = product.nombre;
    adminElements.productCategory.value = product.categoria_id || '';
    adminElements.productShortDesc.value = product.descripcion_corta || '';
    adminElements.productLongDesc.value = product.descripcion_larga || '';
    adminElements.productFeatured.checked = product.destacado || false;
    adminElements.productActive.checked = product.activo !== false;
    
    // Show image preview
    if (product.imagen_url) {
        adminElements.imagePreview.innerHTML = `<img src="${product.imagen_url}" alt="Preview">`;
        adminElements.imagePreview.classList.add('has-image');
    }
    
    openModal('productModal');
}

function confirmDeleteProduct(id) {
    adminElements.confirmMessage.textContent = '¿Estás seguro de eliminar este producto?';
    adminElements.confirmBtn.onclick = () => deleteProduct(id);
    openModal('confirmModal');
}

async function deleteProduct(id) {
    try {
        const { error } = await supabaseClient
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
        showToast('Error al eliminar producto', 'error');
    }
}

// ─────────────────────────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────────────────────────

function renderCategories() {
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
                <button class="table-btn edit-category" data-id="${category.id}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </button>
                <button class="table-btn delete delete-category" data-id="${category.id}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners
    document.querySelectorAll('.edit-category').forEach(btn => {
        btn.addEventListener('click', () => editCategory(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-category').forEach(btn => {
        btn.addEventListener('click', () => confirmDeleteCategory(btn.dataset.id));
    });
}

function updateCategorySelect() {
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
    
    adminElements.categoryModalTitle.textContent = 'Editar Categoría';
    adminElements.categoryId.value = category.id;
    adminElements.categoryName.value = category.nombre;
    adminElements.categoryDesc.value = category.descripcion || '';
    adminElements.categoryOrder.value = category.orden || 0;
    
    openModal('categoryModal');
}

function confirmDeleteCategory(id) {
    adminElements.confirmMessage.textContent = '¿Estás seguro de eliminar esta categoría? Los productos asociados quedarán sin categoría.';
    adminElements.confirmBtn.onclick = () => deleteCategory(id);
    openModal('confirmModal');
}

async function deleteCategory(id) {
    try {
        const { error } = await supabaseClient
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
        showToast('Error al eliminar categoría', 'error');
    }
}

// ─────────────────────────────────────────────────────────────────
// MODALS
// ─────────────────────────────────────────────────────────────────

function initModals() {
    // Close buttons
    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(btn.dataset.close);
        });
    });
    
    // Click outside to close
    document.querySelectorAll('.admin-modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal.id);
        });
    });
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    
    // Reset form if it's product or category modal
    if (modalId === 'productModal') {
        resetProductForm();
    } else if (modalId === 'categoryModal') {
        resetCategoryForm();
    }
}

function resetProductForm() {
    adminState.editingProduct = null;
    adminElements.productForm.reset();
    adminElements.productModalTitle.textContent = 'Nuevo Producto';
    adminElements.productId.value = '';
    adminElements.productActive.checked = true;
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

function resetCategoryForm() {
    adminState.editingCategory = null;
    adminElements.categoryForm.reset();
    adminElements.categoryModalTitle.textContent = 'Nueva Categoría';
    adminElements.categoryId.value = '';
    adminElements.categoryOrder.value = '0';
}

// ─────────────────────────────────────────────────────────────────
// FORMS
// ─────────────────────────────────────────────────────────────────

function initForms() {
    // Product form
    adminElements.productForm.addEventListener('submit', handleProductSubmit);
    
    // Category form
    adminElements.categoryForm.addEventListener('submit', handleCategorySubmit);
    
    // Image upload
    const uploadArea = adminElements.imagePreview;
    const fileInput = adminElements.productImage;
    
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
    
    // Add buttons
    adminElements.addProductBtn.addEventListener('click', () => {
        resetProductForm();
        openModal('productModal');
    });
    
    adminElements.addCategoryBtn.addEventListener('click', () => {
        resetCategoryForm();
        openModal('categoryModal');
    });
}

function handleImagePreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        adminElements.imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        adminElements.imagePreview.classList.add('has-image');
    };
    reader.readAsDataURL(file);
}

async function handleProductSubmit(e) {
    e.preventDefault();
    
    const formData = {
        nombre: adminElements.productName.value,
        slug: generateSlug(adminElements.productName.value),
        descripcion_corta: adminElements.productShortDesc.value,
        descripcion_larga: adminElements.productLongDesc.value,
        categoria_id: adminElements.productCategory.value || null,
        destacado: adminElements.productFeatured.checked,
        activo: adminElements.productActive.checked,
        updated_at: new Date().toISOString()
    };
    
    try {
        // Handle image upload
        const imageFile = adminElements.productImage.files[0];
        if (imageFile) {
            const imagePath = `productos/${Date.now()}_${imageFile.name}`;
            const { error: uploadError } = await supabaseClient.storage
                .from('productos')
                .upload(imagePath, imageFile);
            
            if (uploadError) throw uploadError;
            
            const { data: urlData } = supabaseClient.storage
                .from('productos')
                .getPublicUrl(imagePath);
            
            formData.imagen_url = urlData.publicUrl;
        }
        
        let result;
        if (adminState.editingProduct) {
            // Update existing
            result = await supabaseClient
                .from('productos')
                .update(formData)
                .eq('id', adminState.editingProduct.id)
                .select();
        } else {
            // Create new
            formData.created_at = new Date().toISOString();
            result = await supabaseClient
                .from('productos')
                .insert([formData])
                .select();
        }
        
        const { data, error } = result;
        if (error) throw error;
        
        // Update local state
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
        showToast('Error al guardar producto: ' + error.message, 'error');
    }
}

async function handleCategorySubmit(e) {
    e.preventDefault();
    
    const formData = {
        nombre: adminElements.categoryName.value,
        slug: generateSlug(adminElements.categoryName.value),
        descripcion: adminElements.categoryDesc.value,
        orden: parseInt(adminElements.categoryOrder.value) || 0,
        activa: true
    };
    
    try {
        let result;
        if (adminState.editingCategory) {
            result = await supabaseClient
                .from('categorias')
                .update(formData)
                .eq('id', adminState.editingCategory.id)
                .select();
        } else {
            result = await supabaseClient
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
        showToast('Error al guardar categoría: ' + error.message, 'error');
    }
}

// ─────────────────────────────────────────────────────────────────
// QUICK ACTIONS
// ─────────────────────────────────────────────────────────────────

function initQuickActions() {
    document.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            
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

// ─────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────

function generateSlug(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

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
    
    adminElements.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Make functions available globally
window.openModal = openModal;
window.closeModal = closeModal;