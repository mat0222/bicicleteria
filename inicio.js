// Variables globales
let allProducts = [];
let filteredProducts = [];
let currentCategory = 'all';
let nextBicycleId = 11;
let nextAccessoryId = 13;
let nextSparePartId = 16;
let currentSort = 'name';

// Mapeo de categorías del frontend (ES) al backend (EN)
function mapCategoryForPHP(category) {
    const categoryMap = {
        "bicicletas": "bicicletas",
        "repuestos": "repuestos",
        "indumentarias": "indumentarias",
        "accesorios": "accesorios"
    };

    // Si ya viene en inglés (del servidor), devolver tal cual
    if (Object.values(categoryMap).includes(category)) {
        return category;
    }

    // Si está en español, traducir
    return categoryMap[category] || category;
}


// Función para mostrar categoría
function showCategory(category) {
    currentCategory = category;
    updateAddButton(category);
    
    // Actualizar tabs activos
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`button[onclick="showCategory('${category}')"]`)?.classList.add('active');
    
    // Actualizar radio button correspondiente
    const radioButton = document.getElementById(category);
    if (radioButton) {
        radioButton.checked = true;
    }
    
    updateTypeOptions();
    applyFilters();
}

function updateTypeOptions() {
    const typeSelect = document.getElementById('typeSelect');
    const selectedCategory = document.querySelector('input[name="category"]:checked');
    const categoryValue = selectedCategory ? selectedCategory.value : 'all';
    
    // Limpiar opciones existentes
    typeSelect.innerHTML = '<option value="">Todos los tipos</option>';
    
    let types = new Set();
    
    if (categoryValue === 'all') {
        allProducts.forEach(product => {
            if (product && product.type) {
                types.add(product.type);
            }
        });
    } else {
        const categoryProducts = allProducts.filter(p => p && p.category === categoryValue);
        categoryProducts.forEach(product => {
            if (product && product.type) {
                types.add(product.type);
            }
        });
    }
    
    // Agregar opciones de tipo
    Array.from(types).sort().forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
    });
}

function updateAddButton(category) {
    const addButton = document.getElementById('addButton');
    if (!addButton) return;

    if (category === 'all') {
        addButton.style.display = 'none';
        return;
    }

    addButton.style.display = 'block';

    const labels = {
        'bicicletas': '+ Agregar Nueva Bicicleta',
        'accesorios': '+ Agregar Nuevo Accesorio',
        'repuestos': '+ Agregar Nuevo Repuesto',
        'indumentarias': '+ Agregar Nueva Indumentaria'
    };

    addButton.textContent = labels[category] || '+ Agregar Nuevo Producto';
}

// === Modal Agregar / Editar Productos ===
function openAddModal(product = null) {
    console.log('🔄 Abriendo modal...', product ? 'MODO EDICIÓN' : 'MODO AGREGAR');
    
    const modal = document.getElementById('addModal');
    if (!modal) {
        console.error('❌ Modal no encontrado');
        return;
    }
    
    const editMode = document.getElementById('editMode');
    const editProductCode = document.getElementById('editProductCode');
    const modalTitle = document.getElementById('modalTitle');
    const saveBtn = document.getElementById('saveProductBtn');
    
    // Limpiar formulario
    const form = document.getElementById('addProductForm');
    if (form) {
        form.reset();
    }
    
    // Configurar campos según el modo
    if (product) {
        // MODO EDICIÓN
        console.log('⚙️ Configurando modo edición');
        
        if (editMode) editMode.value = "true";
        if (editProductCode) editProductCode.value = product.code;
        
        // Llenar campos con datos del producto
        const fieldMappings = {
            'productName': product.name,
            'productSupplier': product.supplier,
            'productType': product.type,
            'productPriceCash': product.price,
            'productPriceInstallment': product.installmentPrice,
            'productStock': product.stock
        };
        
        Object.entries(fieldMappings).forEach(([fieldId, value]) => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = value || '';
                console.log(`✅ Campo ${fieldId} = ${value}`);
            } else {
                console.warn(`⚠️ Campo ${fieldId} no encontrado`);
            }
        });
        
        // Configurar título
        const editLabels = {
            'bicicletas': 'Editar Bicicleta',
            'accesorios': 'Editar Accesorio', 
            'repuestos': 'Editar Repuesto',
            'indumentarias': 'Editar Indumentaria'
        };
        
        if (modalTitle) {
            modalTitle.textContent = editLabels[product.category] || 'Editar Producto';
        }
        
        if (saveBtn) {
            saveBtn.textContent = 'Actualizar';
        }
        
        // Configurar campo de código como solo lectura
        const codeField = document.getElementById('productCode');
        if (codeField) {
            codeField.value = product.code || '';
            codeField.readOnly = true; // Solo lectura al editar
        }
        
    } else {
        // MODO AGREGAR
        console.log('⚙️ Configurando modo agregar');
        
        if (editMode) editMode.value = "false";
        if (editProductCode) editProductCode.value = "";
        
        const addLabels = {
            'bicicletas': 'Agregar Nueva Bicicleta',
            'accesorios': 'Agregar Nuevo Accesorio',
            'repuestos': 'Agregar Nuevo Repuesto', 
            'indumentarias': 'Agregar Nueva Indumentaria'
        };
        
        if (modalTitle) {
            modalTitle.textContent = addLabels[currentCategory] || 'Agregar Nuevo Producto';
        }
        
        if (saveBtn) {
            saveBtn.textContent = 'Guardar';
        }
    }
    
    // Llenar selects de proveedores y tipos (código existente...)
    setupModalSelects(product);
    
    // Mostrar modal
    modal.style.display = 'block';
    console.log('✅ Modal abierto');
}

function closeAddModal() {
    const modal = document.getElementById('addModal');
    if (modal) {
        modal.style.display = 'none';
    }
    const form = document.getElementById('addProductForm');
    if (form) {
        form.reset();
    }
}

// Función auxiliar para configurar los selects del modal
function setupModalSelects(product = null) {
    const supplierSelect = document.getElementById('productSupplier');
    const typeSelect = document.getElementById('productType');
    
    // Configurar select de proveedores
    if (supplierSelect) {
        const suppliers = [...new Set(allProducts.map(p => p.supplier).filter(s => s))];
        supplierSelect.innerHTML = '<option value="">Seleccionar proveedor</option>';
        
        suppliers.forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier;
            option.textContent = supplier;
            if (product && product.supplier === supplier) {
                option.selected = true;
            }
            supplierSelect.appendChild(option);
        });
        
        const newOption = document.createElement('option');
        newOption.value = 'nuevo';
        supplierSelect.appendChild(newOption);
    }
    
    // Configurar select de tipos
    if (typeSelect) {
        const categoryToUse = product ? product.category : currentCategory;
        const types = [...new Set(allProducts.filter(p => p.category === categoryToUse).map(p => p.type).filter(t => t))];
        
        typeSelect.innerHTML = '<option value="">Seleccionar tipo</option>';
        
        types.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            if (product && product.type === type) {
                option.selected = true;
            }
            typeSelect.appendChild(option);
        });
        
        const newTypeOption = document.createElement('option');
        newTypeOption.value = 'nuevo';
        typeSelect.appendChild(newTypeOption);
    }
}

// Función corregida para editar producto desde la tabla
function editProduct(productCode) {
    console.log('🔄 Intentando editar producto con código:', productCode);
    const product = allProducts.find(p => String(p.code) === String(productCode));
    if (!product) return alert('Producto no encontrado');

    document.getElementById('editMode').value = 'true';
    document.getElementById('editProductCode').value = product.code;

    document.getElementById('productName').value = product.name || '';
    document.getElementById('productSupplier').value = product.supplier || 0;
    document.getElementById('productPriceCash').value = product.price || 0;
    document.getElementById('productPriceInstallment').value = product.installmentPrice || 0;
    document.getElementById('productStock').value = product.stock || 0;
    document.getElementById('productType').value = product.type || '';

    const categoryInput = document.querySelector(`input[name="category"][value="${product.category.toLowerCase()}"]`);
    if (categoryInput) categoryInput.checked = true;

    currentCategory = product.category;
    openAddModal(product);
}


// Función para agregar nuevo producto
async function addNewProduct(productData) {
  console.log('Enviando datos para agregar:', productData);
  try {
    const response = await fetch('agregar_productos.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });

     
    
    const responseText = await response.text();
    console.log('Respuesta del servidor:', responseText);

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result = JSON.parse(responseText);

    if (result.success) {
      await loadAllProducts();
      closeAddModal();
      alert('Producto agregado correctamente!');
    } else {
      alert('Error al agregar: ' + (result.error || 'Error desconocido'));
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de red al agregar producto: ' + error.message);
  }
}


// Función para actualizar producto
async function updateProduct(productData) {
    try {
        const response = await fetch('editar_productos.php', {
            method: 'POST', // tu backend acepta POST
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Error desconocido al actualizar el producto');
        }

        console.log('✅ Producto actualizado correctamente:', result.product);

        // Actualizar producto en allProducts localmente
        const index = allProducts.findIndex(p => String(p.code) === String(productData.code));
        if (index !== -1) {
            allProducts[index] = { ...allProducts[index], ...productData };
        }

        // Si estás usando un renderizado de tabla/lista, aquí puedes refrescar la UI
        loadAllProducts(); // ejemplo de función que actualiza la tabla en pantalla

        return true;

    } catch (error) {
        console.error('❌ Error en updateProduct:', error);
        throw error;
    }
}




// Cargar productos desde el servidor
async function loadAllProducts() {
    console.log('Cargando productos...');
    try {
        const response = await fetch('obtener_productos.php');
        const responseText = await response.text();
        console.log('Respuesta obtener_productos.php:', responseText);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Error parsing JSON:', e);
            throw new Error('Respuesta del servidor no es JSON válido');
        }
        
        if (data.error) {
            console.error('Error del servidor:', data.error);
            alert('Error: ' + data.error);
            allProducts = [];
        } else {
            allProducts = Array.isArray(data) ? data : [];
            console.log('Productos cargados:', allProducts.length);
        }
        
        filteredProducts = [...allProducts];
        displayProducts();
        updateSupplierOptions();
        updateTypeOptions();
    } catch (error) {
        console.error('Error al cargar productos:', error);
        alert('No se pudieron cargar los productos.\n' + error.message);
        allProducts = [];
        filteredProducts = [];
        displayProducts();
    }
}

// Actualizar opciones de proveedores
function updateSupplierOptions() {
    const supplierSelect = document.getElementById('supplierSelect');
    if (!supplierSelect) return;
    
    const suppliers = [...new Set(allProducts.map(p => p.supplier).filter(s => s))];
    
    supplierSelect.innerHTML = '<option value="">Todos los proveedores</option>';
    suppliers.sort().forEach(supplier => {
        const option = document.createElement('option');
        option.value = supplier;
        option.textContent = supplier;
        supplierSelect.appendChild(option);
    });
}

function setupEventListeners() {
    console.log('Configurando event listeners...');
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    const categoryRadios = document.querySelectorAll('input[name="category"]');
    if (categoryRadios.length > 0) {
        categoryRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                currentCategory = this.value;
                updateTypeOptions();
                applyFilters();
                updateAddButton(this.value);
            });
        });
    }

    const supplierSelect = document.getElementById('supplierSelect');
    if (supplierSelect) supplierSelect.addEventListener('change', applyFilters);

    const typeSelect = document.getElementById('typeSelect');
    if (typeSelect) typeSelect.addEventListener('change', applyFilters);

    document.querySelectorAll('#stockOptions input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });
    
    // Event listener para el formulario del modal
    const form = document.getElementById('addProductForm');
    if (form) {
        // Remover listeners existentes
        form.removeEventListener('submit', handleFormSubmit);
        // Agregar nuevo listener
        form.addEventListener('submit', handleFormSubmit);
        console.log('Form listener agregado');
    }
}


// Función separada para manejar el submit del formulario
async function handleFormSubmit(e) {
    e.preventDefault();
    console.log('🔄 Submit detectado');

    const editMode = document.getElementById('editMode').value === 'true';

    // Obtener categoría
    let category;
    if (editMode) {
        const productCode = document.getElementById('productCode').value;
        const product = allProducts.find(p => String(p.code) === String(productCode));
        category = product ? product.category : '';
    } else {
        const categoryRadio = document.querySelector('input[name="category"]:checked');
        category = categoryRadio ? categoryRadio.value : '';
    }

    category = mapCategoryForPHP(category).toLowerCase();

    // Validaciones
    const name = document.getElementById('productName').value.trim();
    if (!name) return alert('El nombre del producto es obligatorio');
    if (!category || category === 'all') return alert('Debe seleccionar una categoría válida');

    // Obtener precios correctamente
    const priceInput = document.getElementById('productPriceCash');
    const installmentInput = document.getElementById('productPriceInstallment');
    const price = priceInput && priceInput.value ? parseFloat(priceInput.value) : 0;
    const installmentPrice = installmentInput && installmentInput.value ? parseFloat(installmentInput.value) : 0;

    // Obtener stock y supplier
    const stock = parseInt(document.getElementById('productStock').value) || 0;
    const supplier = parseInt(document.getElementById('productSupplier').value) || 0;

    // Código del producto
    const codeInput = document.getElementById('productCode');
    if (!editMode) {
        codeInput.readOnly = false;
        codeInput.value = codeInput.value || ''; // permitir escribir en agregar
    } else {
        codeInput.readOnly = true; // bloquear en editar
    }
    const code = codeInput.value.trim();

    // Payload final
    const productData = {
        code: code,
        name: name,
        supplier: supplier,
        price: price,
        installmentPrice: installmentPrice,
        stock: stock,
        category: category
    };

    console.log('🔎 Payload enviado al backend:', productData);

    try {
        if (editMode) {
            await updateProduct(productData);
        } else {
            await addNewProduct(productData);
        }
        alert('Producto guardado correctamente');
    } catch (error) {
        console.error('❌ Error al guardar:', error);
        alert('Hubo un problema al guardar el producto: ' + error.message);
    }
}


function toggleFilter(filterId) {
    const options = document.getElementById(filterId + 'Options');
    const arrow = document.getElementById(filterId + 'Arrow');
    
    if (options && arrow) {
        if (options.classList.contains('active')) {
            options.classList.remove('active');
            arrow.textContent = '▶';
        } else {
            options.classList.add('active');
            arrow.textContent = '▼';
        }
    }
}

function applyFilters() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    const categoryRadio = document.querySelector('input[name="category"]:checked');
    const selectedCategory = categoryRadio ? categoryRadio.value : 'all';
    
    const supplierSelect = document.getElementById('supplierSelect');
    const selectedSupplier = supplierSelect ? supplierSelect.value : '';
    
    const typeSelect = document.getElementById('typeSelect');
    const selectedType = typeSelect ? typeSelect.value : '';

    const stockFilters = [];
    document.querySelectorAll('#stockOptions input[type="checkbox"]:checked').forEach(checkbox => {
        if (checkbox.value) stockFilters.push(checkbox.value);
    });

    filteredProducts = allProducts.filter(product => {
        if (!product) return false;

        // Filtro de categoría
        if (selectedCategory !== 'all' && product.category !== selectedCategory) {
            return false;
        }

        // Filtro de búsqueda
        const productName = product.name ? product.name.toLowerCase() : '';
        const productCode = product.code ? String(product.code).toLowerCase() : '';
        if (searchTerm && !productName.includes(searchTerm) && !productCode.includes(searchTerm)) {
            return false;
        }

        // Filtro de proveedor
        if (selectedSupplier && product.supplier !== selectedSupplier) {
            return false;
        }

        // Filtro de tipo
        if (selectedType && product.type !== selectedType) {
            return false;
        }

        // Filtro de stock
        if (stockFilters.length > 0) {
            const stockStatus = getStockStatus(product.stock);
            if (!stockFilters.includes(stockStatus)) {
                return false;
            }
        }

        return true;
    });

    sortProducts();
    displayProducts();
    updateActiveFiltersIndicator();
}

function sortProducts() {
    filteredProducts.sort((a, b) => {
        switch (currentSort) {
            case 'name':
                return (a.name || '').localeCompare(b.name || '');
            case 'price-asc':
                return (a.price || 0) - (b.price || 0);
            case 'price-desc':
                return (b.price || 0) - (a.price || 0);
            case 'stock':
                return (b.stock || 0) - (a.stock || 0);
            case 'code':
                return String(a.code || '').localeCompare(String(b.code || ''));
            default:
                return 0;
        }
    });
}

function updateActiveFiltersIndicator() {
    let activeFilters = 0;
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value) activeFilters++;
    
    const categoryRadio = document.querySelector('input[name="category"]:checked');
    if (categoryRadio && categoryRadio.value !== 'all') activeFilters++;
    
    const supplierSelect = document.getElementById('supplierSelect');
    if (supplierSelect && supplierSelect.value) activeFilters++;
    
    const typeSelect = document.getElementById('typeSelect');
    if (typeSelect && typeSelect.value) activeFilters++;
    
    if (document.querySelectorAll('#stockOptions input[type="checkbox"]:checked').length > 0) activeFilters++;
    
    const clearButton = document.querySelector('.clear-filters');
    if (clearButton) {
        if (activeFilters > 0) {
            clearButton.textContent = `Limpiar Filtros (${activeFilters})`;
            clearButton.style.background = '#dc2626';
        } else {
            clearButton.textContent = 'Limpiar Filtros';
            clearButton.style.background = '#16a34a';
        }
    }
}

function getStockStatus(stock) {
    const stockValue = parseInt(stock) || 0;
    if (stockValue === 0) return 'out-of-stock';
    if (stockValue <= 5) return 'low-stock';
    return 'in-stock';
}

function getStockLabel(stock) {
    const stockValue = parseInt(stock) || 0;
    const status = getStockStatus(stockValue);
    if (status === 'out-of-stock') return 'Sin Stock';
    if (status === 'low-stock') return `${stockValue} (Bajo)`;
    return `${stockValue} unidades`;
}

function displayProducts() {
    const tbody = document.getElementById('productTableBody');
    const resultsCount = document.getElementById('resultsCount');
    
    if (resultsCount) {
        resultsCount.innerHTML = `
            Mostrando ${filteredProducts.length} productos
            <select onchange="changeSortOrder(this.value)" style="margin-left: 15px; padding: 4px 8px; border-radius: 4px; border: 1px solid #d1d5db; font-size: 12px;">
                <option value="name" ${currentSort === 'name' ? 'selected' : ''}>Ordenar por Nombre</option>
                <option value="code" ${currentSort === 'code' ? 'selected' : ''}>Ordenar por Código</option>
                <option value="price-asc" ${currentSort === 'price-asc' ? 'selected' : ''}>Precio: Menor a Mayor</option>
                <option value="price-desc" ${currentSort === 'price-desc' ? 'selected' : ''}>Precio: Mayor a Menor</option>
                <option value="stock" ${currentSort === 'stock' ? 'selected' : ''}>Ordenar por Stock</option>
            </select>
        `;
    }
    
    if (!tbody) return;
    
    if (filteredProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-results">No se encontraron productos</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredProducts.map(product => `
        <tr>
            <td class="product-code">${product.code || ''}</td>
            <td class="product-name">${product.name || ''}</td>
            <td class="price">$${(product.price || 0).toLocaleString()}</td>
            <td class="price-installment">$${(product.installmentPrice || 0).toLocaleString()}</td>
            <td><span class="stock ${getStockStatus(product.stock)}">${getStockLabel(product.stock)}</span></td>
            <td class="actions">
                <button class="btn btn-edit" onclick="editProduct('${product.code}')">Editar</button>
                <button class="btn btn-delete" onclick="borrarProducto('${product.code}', '${product.category}')">Borrar</button>
            </td>
        </tr>
    `).join('');
}

function changeSortOrder(sortType) {
    currentSort = sortType;
    sortProducts();
    displayProducts();
}

function borrarProducto(code, category) {
    if (!confirm(`¿Seguro que quieres borrar el producto con código ${code} de la categoría ${category}?`)) {
        return;
    }

    fetch("borrar_productos.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ code: code, category: category })
    })
    .then(async res => {
        const text = await res.text();   // leer la respuesta cruda
        console.log("🔎 Respuesta del servidor:", text);

        try {
            return JSON.parse(text);  // intentar parsear JSON
        } catch (e) {
            throw new Error("Respuesta no es JSON válido");
        }
    })
    .then(data => {
        if (data.success) {
            alert(data.message);
            loadAllProducts(); // refrescar lista
        } else {
            alert("❌ Error al borrar: " + data.error);
            console.error("Error en borrar:", data);
        }
    })
    .catch(err => {
        console.error("❌ Error en fetch:", err);
        alert("Error de comunicación con el servidor.");
    });
}



function clearAllFilters() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    
    const allRadio = document.getElementById('all');
    if (allRadio) allRadio.checked = true;
    
    const supplierSelect = document.getElementById('supplierSelect');
    if (supplierSelect) supplierSelect.value = '';
    
    const typeSelect = document.getElementById('typeSelect');
    if (typeSelect) typeSelect.value = '';
    
    document.querySelectorAll('#stockOptions input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    const firstTab = document.querySelector('.tab-button');
    if (firstTab) firstTab.classList.add('active');
    
    currentSort = 'name';
    currentCategory = 'all';
    
    updateTypeOptions();
    applyFilters();
    updateAddButton('all');
}

// Cerrar modal al hacer click fuera
window.onclick = function(event) {
    const modal = document.getElementById('addModal');
    if (event.target === modal) {
        closeAddModal();
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, iniciando aplicación...');
    loadAllProducts();
    setupEventListeners();
    updateAddButton('all');
});