// js/productos.js

// 🚨 Inicialización de variables del DOM
const contenedorProductos = document.getElementById('contenedor-productos');
const tituloPrincipal = document.getElementById('titulo-principal');

// ----------------------------------------------------------------
// 1. FUNCIÓN PARA RENDERIZAR PRODUCTOS EN EL DOM (Se mantiene)
// ----------------------------------------------------------------
function renderizarProductos(lista) {
    contenedorProductos.innerHTML = ''; 

    if (lista.length === 0) {
        contenedorProductos.innerHTML = '<p class="mensaje-carga">No hay productos disponibles en esta sección.</p>';
        return;
    }

    lista.forEach(producto => {
        const div = document.createElement('div');
        div.classList.add('producto');
        div.innerHTML = `
            <img class="producto-imagen" src="${producto.imagen}" alt="${producto.titulo}" />
            <div class="producto-detalles">
                <h3 class="producto-titulo">${producto.titulo}</h3>
                <p class="producto-precio">$${producto.precio.toFixed(2)}</p>
                <button class="boton-agregar" data-id="${producto.id}">Agregar al carrito</button>
            </div>
        `;
        contenedorProductos.appendChild(div);
    });

    activarBotonesAgregar(); 
}

// ----------------------------------------------------------------
// 2. FUNCIÓN AUXILIAR: Obtiene el ID de la Categoría a partir de su Nombre
// ----------------------------------------------------------------
async function obtenerIdCategoriaPorNombre(nombreBuscado) {
    try {
        let nombreAjustado = nombreBuscado;
        // Ajuste manual: si el botón es 'Camisetas' pero la DB es 'Camisas'
        if (nombreBuscado === 'Camisetas') {
            nombreAjustado = 'Camisas';
        }
        
        // 🚨 CRÍTICO: Buscar en el campo 'Categoria' (sin tilde, singular)
        const querySnapshot = await db.collection("Categoria")
            .where("Categoria", "==", nombreAjustado) 
            .limit(1)
            .get();
            
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].id; 
        }
        return null;
        
    } catch (error) {
        console.error("Error al buscar ID de categoría:", error); 
        return null;
    }
}


// ----------------------------------------------------------------
// 3. FUNCIÓN MIGRADA: MOSTRAR TODOS DESDE FIRESTORE
// ----------------------------------------------------------------
async function mostrarTodos() {
    tituloPrincipal.innerText = "Todos los productos"; 
    contenedorProductos.innerHTML = '<p class="mensaje-carga">Cargando productos...</p>';

    try {
        // 1. Obtener el mapa de nombres de categorías (ID de Categoria -> Nombre)
        const categoriasSnapshot = await db.collection("Categoria").get();
        const mapaNombresCategorias = {};
        categoriasSnapshot.docs.forEach(doc => {
            // 🚨 USAR CAMPO EXACTO: 'Categoria' (sin tilde)
            mapaNombresCategorias[doc.id] = doc.data().Categoria; 
        });

        // 2. Leer la colección 'Productos'
        const productosSnapshot = await db.collection("Productos").get();

        const productosDesdeDB = productosSnapshot.docs.map(doc => {
            const data = doc.data();
            
            // 🚨 USAR CAMPO EXACTO: 'CategoriaId'
            const categoriaID = data.CategoriaId; 
            const nombreCategoriaReal = mapaNombresCategorias[categoriaID] || 'Sin Categoría';
            
            // Uso de campos de imagen (asumiendo que ImagenUrl es el más común)
            const imageUrl = data.ImagenUrl || data.ImagenURL || data['Imagen url'] || "./img/default.jpg";
            
            return {
                id: doc.id,
                titulo: data.NombreP || 'Producto Desconocido',
                imagen: imageUrl,
                categoria: { 
                    nombre: nombreCategoriaReal, 
                    id: nombreCategoriaReal.toLowerCase()
                }, 
                precio: parseFloat(String(data.Precio).replace(/[^0-9.]/g, '')) || 0.00
            };
        });

        renderizarProductos(productosDesdeDB);

    } catch (error) {
        console.error("Error al cargar productos de Firebase:", error); 
        contenedorProductos.innerHTML = `<p class="error-carga">Error al cargar la tienda. Mensaje: ${error.message}</p>`;
    }
}


// ----------------------------------------------------------------
// 4. FUNCIÓN MIGRADA: MOSTRAR CATEGORÍA DESDE FIRESTORE (con Lookup)
// ----------------------------------------------------------------
async function mostrarCategoria(categoriaId) {
    let nombreCategoriaBuscado = categoriaId.charAt(0).toUpperCase() + categoriaId.slice(1);
    
    tituloPrincipal.innerText = nombreCategoriaBuscado;
    contenedorProductos.innerHTML = '<p class="mensaje-carga">Cargando categoría...</p>';
    
    try {
        // 1. Obtener el ID de la Categoría (Lookup)
        const idCategoriaFiltrar = await obtenerIdCategoriaPorNombre(nombreCategoriaBuscado);
        
        if (!idCategoriaFiltrar) {
            contenedorProductos.innerHTML = `<p class="mensaje-carga">No se encontró la categoría "${nombreCategoriaBuscado}".</p>`;
            return;
        }

        // 2. Filtrar la colección Productos por el ID encontrado
        // 🚨 CRÍTICO: Buscar en el campo exacto 'CategoriaId'
        const querySnapshot = await db.collection("Productos")
            .where("CategoriaId", "==", idCategoriaFiltrar)
            .get(); 

        const filtradosDesdeDB = querySnapshot.docs.map(doc => {
            const data = doc.data();
            
            const imageUrl = data.ImagenUrl || data.ImagenURL || data['Imagen url'] || "./img/default.jpg";
            
            return {
                id: doc.id,
                titulo: data.NombreP || 'Producto Desconocido',
                imagen: imageUrl,
                categoria: { 
                    nombre: nombreCategoriaBuscado, 
                    id: categoriaId 
                }, 
                precio: parseFloat(String(data.Precio).replace(/[^0-9.]/g, '')) || 0.00
            };
        });
        
        renderizarProductos(filtradosDesdeDB);

    } catch (error) {
        console.error("Error al cargar la categoría:", error);
        contenedorProductos.innerHTML = `<p class="error-carga">Error al cargar la categoría: ${error.message}.</p>`;
    }
}


// ----------------------------------------------------------------
// 5. FUNCIÓN PARA EL CARRITO (Se mantiene)
// ----------------------------------------------------------------
async function activarBotonesAgregar() {
    
    const productosEnVistaSnapshot = await db.collection("Productos").get();
    const productosEnVista = productosEnVistaSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        NombreP: doc.data().NombreP,
        ImagenURL: doc.data().ImagenUrl || doc.data().ImagenURL,
        Precio: parseFloat(String(doc.data().Precio).replace(/[^0-9.]/g, '')) || 0.00
    }));


    const botonesAgregar = document.querySelectorAll(".boton-agregar");

    botonesAgregar.forEach(boton => {
        boton.addEventListener("click", async () => {
            
            const idProducto = boton.dataset.id;
            const productoSeleccionado = productosEnVista.find(p => p.id === idProducto);
            
            if (!productoSeleccionado) { return; }

            const productoParaCarrito = {
                id: idProducto,
                titulo: productoSeleccionado.NombreP,
                imagen: productoSeleccionado.ImagenURL,
                precio: productoSeleccionado.Precio,
            };

            const user = auth.currentUser;
            
            if (user) {
                const carritoRef = db.collection("carritos_usuario").doc(user.uid);
                const doc = await carritoRef.get();
                let articulosMap = doc.exists ? doc.data().articulos || {} : {};

                if (articulosMap[idProducto]) {
                    articulosMap[idProducto].cantidad++;
                } else {
                    articulosMap[idProducto] = { ...productoParaCarrito, cantidad: 1 };
                }

                await carritoRef.set({ articulos: articulosMap });
            } else {
                let carrito = JSON.parse(localStorage.getItem("productos-en-carrito")) || [];
                const existe = carrito.find(p => p.id === idProducto);

                if (existe) {
                    existe.cantidad++;
                } else {
                    carrito.push({ ...productoParaCarrito, cantidad: 1 });
                }

                localStorage.setItem("productos-en-carrito", JSON.stringify(carrito));
            }

            await new Promise(resolve => setTimeout(resolve, 50)); 
            window.location.href = "carrito.html";
        });
    });
}