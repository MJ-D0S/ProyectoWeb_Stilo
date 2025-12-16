// js/productos.js (o el archivo que uses para la lógica principal)

// ⚠️ NOTA: Las variables 'db' (Firestore) y 'auth' (Authentication)
// deben estar inicializadas como GLOBALES en tu index.html ANTES de que se cargue este script.

const contenedorProductos = document.querySelector("#contenedor-productos");
const botonesCategorias = document.querySelectorAll(".boton-categoria");
const tituloPrincipal = document.querySelector("#titulo-principal");
const numerito = document.querySelector("#numerito");
let productos = []; // Aquí almacenaremos los productos cargados de Firestore

// Variable para el aside (Necesaria para cerrar el menú en móvil)
const aside = document.querySelector("aside"); // Asegúrate de que tu HTML tenga un elemento <aside>


// ----------------------------------------------------------------
// 1. CARGA INICIAL DE DATOS DESDE FIRESTORE
// ----------------------------------------------------------------

async function inicializarTienda() {
    try {
        // Leer la colección 'Productos' de Firebase
        const querySnapshot = await db.collection("Productos").get();

        // Mapear los datos de Firestore a la estructura que tu carrito necesita
        productos = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id, // Usamos el ID de Firebase
                titulo: data.NombreP,
                imagen: data.ImagenURL,
                categoria: { 
                    nombre: data.CategoriaID, 
                    id: data.CategoriaID.toLowerCase() 
                }, 
                precio: data.Precio
            };
        });

        // Cargar todos los productos en la vista
        cargarProductos(productos);
        
        // Cargar el carrito del usuario (si está logueado) o de localStorage
        cargarCarritoInicial(); 

    } catch (error) {
        console.error("Error al cargar productos o reglas de seguridad:", error);
        contenedorProductos.innerHTML = `<p class="error-carga">Error al cargar la tienda. Asegúrate de que las Reglas de Seguridad de Firestore permitan la lectura pública en la colección 'Productos'.</p>`;
    }
}

// ----------------------------------------------------------------
// 2. LÓGICA DE RENDERIZADO Y FILTRADO (Mantenida, pero llama a la lista 'productos' global)
// ----------------------------------------------------------------

function cargarProductos(productosElegidos) {
    contenedorProductos.innerHTML = "";

    productosElegidos.forEach(producto => {
        const div = document.createElement("div");
        div.classList.add("producto");
        div.innerHTML = `
            <img class="producto-imagen" src="${producto.imagen}" alt="${producto.titulo}">
            <div class="producto-detalles">
                <h3 class="producto-titulo">${producto.titulo}</h3>
                <p class="producto-precio">$${producto.precio.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <button class="producto-agregar" id="${producto.id}">Agregar</button>
            </div>
        `;
        contenedorProductos.append(div);
    })

    actualizarBotonesAgregar();
}

// Función que define la acción al hacer clic en las categorías (No necesita cambios)
botonesCategorias.forEach(boton => {
    boton.addEventListener("click", (e) => {
        botonesCategorias.forEach(boton => boton.classList.remove("active"));
        e.currentTarget.classList.add("active");

        if (e.currentTarget.id != "todos") {
            const productosBoton = productos.filter(producto => producto.categoria.id === e.currentTarget.id);
            // Si el producto está vacío, usa el nombre de la categoría en lugar de buscar un producto
            const nombreCategoria = e.currentTarget.id.charAt(0).toUpperCase() + e.currentTarget.id.slice(1);
            tituloPrincipal.innerText = nombreCategoria;
            cargarProductos(productosBoton);
        } else {
            tituloPrincipal.innerText = "Todos los productos";
            cargarProductos(productos);
        }
    })
});

function actualizarBotonesAgregar() {
    let botonesAgregar = document.querySelectorAll(".producto-agregar");

    botonesAgregar.forEach(boton => {
        boton.addEventListener("click", agregarAlCarrito);
    });
}

// ----------------------------------------------------------------
// 3. LÓGICA DE CARRITO (AHORA CON FIRESTORE Y LOCALSTORAGE DE RESPALDO)
// ----------------------------------------------------------------

let productosEnCarrito = [];

async function cargarCarritoInicial() {
    const user = auth.currentUser; 

    if (user) {
        // Opción A: USUARIO AUTENTICADO (Usar Firestore)
        const carritoRef = db.collection("carritos_usuario").doc(user.uid);
        const doc = await carritoRef.get();
        
        if (doc.exists) {
            // Convertir el mapa de Firebase a un array tradicional
            const articulosMap = doc.data().articulos || {};
            productosEnCarrito = Object.values(articulosMap);
        } else {
            productosEnCarrito = [];
        }
    } else {
        // Opción B: USUARIO SIN AUTENTICAR (Usar localStorage)
        const productosEnCarritoLS = localStorage.getItem("productos-en-carrito");
        if (productosEnCarritoLS) {
            productosEnCarrito = JSON.parse(productosEnCarritoLS);
        } else {
            productosEnCarrito = [];
        }
    }
    actualizarNumerito();
}


async function agregarAlCarrito(e) {
    Toastify({ /* ... (El Toastify se mantiene igual) ... */ 
        text: "Producto agregado",
        duration: 3000,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: "linear-gradient(to right, #0056B3, #007BFF)",
          borderRadius: "2rem",
          textTransform: "uppercase",
          fontSize: ".75rem"
        },
        offset: {
            x: '1.5rem', // horizontal axis - can be a number or a string indicating unity. eg: '2em'
            y: '1.5rem' // vertical axis - can be a number or a string indicating unity. eg: '2em'
          },
        onClick: function(){}
    }).showToast();

    const idBoton = e.currentTarget.id;
    const productoAgregado = productos.find(producto => producto.id === idBoton);

    // Si no encuentra el producto (debería estar cargado de Firestore), sale
    if (!productoAgregado) return; 

    // --------------------------------------------------------
    // Lógica para actualizar el array local (productosEnCarrito)
    // --------------------------------------------------------
    let productoExistente = productosEnCarrito.find(p => p.id === idBoton);

    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        productosEnCarrito.push({ ...productoAgregado, cantidad: 1 });
    }
    
    // --------------------------------------------------------
    // SINCRONIZACIÓN (Guardar en Firebase o localStorage)
    // --------------------------------------------------------
    const user = auth.currentUser;

    if (user) {
        // Opción A: USUARIO AUTENTICADO -> Guardar en Firestore
        const carritoRef = db.collection("carritos_usuario").doc(user.uid);
        
        // Convertimos el array productosEnCarrito a un mapa para Firestore
        const articulosMap = productosEnCarrito.reduce((map, item) => {
            map[item.id] = {
                id: item.id,
                titulo: item.titulo,
                precio: item.precio,
                imagen: item.imagen,
                cantidad: item.cantidad
            };
            return map;
        }, {});
        
        await carritoRef.set({ articulos: articulosMap });
        console.log("Carrito sincronizado en Firestore.");

    } else {
        // Opción B: USUARIO SIN AUTENTICAR -> Guardar en localStorage
        localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
        console.log("Carrito guardado en localStorage (temporal).");
    }

    actualizarNumerito();
}


function actualizarNumerito() {
    let nuevoNumerito = productosEnCarrito.reduce((acc, producto) => acc + producto.cantidad, 0);
    numerito.innerText = nuevoNumerito;
}

// ----------------------------------------------------------------
// EJECUCIÓN INICIAL (Reemplaza la llamada a fetch de .json)
// ----------------------------------------------------------------

// Llama a la función principal para cargar datos de Firebase
document.addEventListener("DOMContentLoaded", () => {
    inicializarTienda();
});