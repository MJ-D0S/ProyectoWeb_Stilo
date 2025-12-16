let productosEnCarrito = []; 

const contenedorCarritoVacio = document.querySelector("#carrito-vacio");
const contenedorCarritoProductos = document.querySelector("#carrito-productos");
const contenedorCarritoAcciones = document.querySelector("#carrito-acciones");
const contenedorCarritoComprado = document.querySelector("#carrito-comprado");
let botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");
const botonVaciar = document.querySelector("#carrito-acciones-vaciar");
const contenedorTotal = document.querySelector("#total");
const botonComprar = document.querySelector("#carrito-acciones-comprar");

// ----------------------------------------------------------------
// FUNCIÓN DE GUARDADO EN FIRESTORE (NUEVA)
// ----------------------------------------------------------------
async function guardarEnFirestore() {
    const usuarioDataString = localStorage.getItem('usuarioLogueado');
    if (!usuarioDataString) {
        console.warn("Usuario no logueado. No se puede guardar el carrito en Firestore.");
        return;
    }
    
    // Asumimos que el login guarda el ID del documento de Usuarios como 'uid'
    const userID = JSON.parse(usuarioDataString).uid;

    if (!userID) {
        console.error("ID de usuario no encontrado en localStorage. No se puede guardar el carrito.");
        return;
    }

    try {
        const carritoRef = db.collection("Usuario_Carrito");

        // 1. Convertir el array local de productos para que coincida con la estructura de Firestore
        const articulosFirestore = productosEnCarrito.map(producto => ({
            Cantidad: producto.cantidad,
            "Nombre P": producto.titulo, // Usando "Nombre P" como en tu estructura de imagen
            Precio: `$${producto.precio.toFixed(2)}` // Usando el formato "$396.00" como en tu estructura
        }));

        // 2. Crear o actualizar el documento del carrito. Usamos el ID de Usuario como ID del documento.
        await carritoRef.doc(userID).set({
            "Usuario Id": `/Usuarios/${userID}`,
            articulos: articulosFirestore
        });

        console.log(`✅ Carrito guardado en Firestore para el usuario: ${userID}`);

    } catch (error) {
        console.error("❌ ERROR al guardar el carrito en Firestore:", error);
        // Podrías añadir un Toastify aquí si lo deseas
    }
}


// ----------------------------------------------------------------
// FUNCIÓN PRINCIPAL DE CARGA
// ----------------------------------------------------------------
function cargarProductosCarrito() {
    const productosEnCarritoLS = localStorage.getItem("productos-en-carrito");
    
    if (productosEnCarritoLS) {
        productosEnCarrito = JSON.parse(productosEnCarritoLS);
    } else {
        productosEnCarrito = [];
    }


    if (productosEnCarrito.length > 0) {
        contenedorCarritoVacio.classList.add("disabled");
        contenedorCarritoProductos.classList.remove("disabled");
        contenedorCarritoAcciones.classList.remove("disabled");
        contenedorCarritoComprado.classList.add("disabled");

        contenedorCarritoProductos.innerHTML = "";

        productosEnCarrito.forEach(producto => {
            const div = document.createElement("div");
            div.classList.add("carrito-producto");
            div.innerHTML = `
                <img class="carrito-producto-imagen" src="${producto.imagen}" alt="${producto.titulo}">
                <div class="carrito-producto-titulo">
                    <small>Título</small>
                    <h3>${producto.titulo}</h3>
                </div>
                <div class="carrito-producto-precio">
                    <small>Precio Unitario </small>
                    <p>$${producto.precio.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div class="carrito-producto-cantidad">
                    <small>Cantidad</small>
                    <div class="cantidad-controles">
                        <button class="restar" data-id="${producto.id}">-</button>
                        <p>${producto.cantidad}</p>
                    <button class="sumar" data-id="${producto.id}">+</button>
                    </div>
                </div>
                <div class="carrito-producto-subtotal">
                    <small>Subtotal</small>
                    <p>$${(producto.precio * producto.cantidad).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <button class="carrito-producto-eliminar" id="${producto.id}"><i class="bi bi-trash-fill"></i></button>
            `;
            contenedorCarritoProductos.append(div);
        });

        actualizarBotonesEliminar();
        actualizarBotonesCantidad();
        actualizarTotal();

    } else {
        contenedorCarritoVacio.classList.remove("disabled");
        contenedorCarritoProductos.classList.add("disabled");
        contenedorCarritoAcciones.classList.add("disabled");
        contenedorCarritoComprado.classList.add("disabled");
    }
    
    // 🚨 LLAMADA CRÍTICA: Guardar el estado actual del carrito en Firestore
    guardarEnFirestore();
}

// ----------------------------------------------------------------
// FUNCIONES DE ACCIÓN (Modificadas para llamar a guardarEnFirestore)
// ----------------------------------------------------------------

function actualizarBotonesEliminar() {
    botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");
    botonesEliminar.forEach(boton => {
        boton.addEventListener("click", eliminarDelCarrito);
    });
}

function eliminarDelCarrito(e) {
    const idBoton = e.currentTarget.id;
    // ... (Tu lógica para eliminar del array local) ...
    productosEnCarrito = productosEnCarrito.filter(producto => producto.id !== idBoton);
    
    // Guardamos en LS y recargamos
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
    cargarProductosCarrito(); // Llama a cargar, y cargar llama a guardarEnFirestore

    // Tu Toastify se mantiene
    /* Toastify({ ... }).showToast(); */
}

function actualizarBotonesCantidad() {
    const botonesSumar = document.querySelectorAll(".sumar");
    const botonesRestar = document.querySelectorAll(".restar");

    const manejarCambioCantidad = (id, operacion) => {
        const producto = productosEnCarrito.find(p => p.id === id);
        if (producto) {
            if (operacion === 'sumar') {
                producto.cantidad++;
            } else if (operacion === 'restar' && producto.cantidad > 1) {
                producto.cantidad--;
            } else if (operacion === 'restar' && producto.cantidad === 1) {
                // Elimina el producto del array global
                productosEnCarrito = productosEnCarrito.filter(p => p.id !== id);
            }
        } else {
             // Si el producto no se encuentra, actualiza el array global de productosEnCarrito
             productosEnCarrito = productosEnCarrito.filter(p => p.id !== id);
        }
        
        localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
        cargarProductosCarrito(); // Recarga y llama a guardarEnFirestore
    };
    
    botonesSumar.forEach(boton => {
        boton.addEventListener("click", () => manejarCambioCantidad(boton.dataset.id, 'sumar'));
    });

    botonesRestar.forEach(boton => {
        boton.addEventListener("click", () => manejarCambioCantidad(boton.dataset.id, 'restar'));
    });
}

botonVaciar.addEventListener("click", () => {
    Swal.fire({ /* ... (Tu lógica de SweetAlert se mantiene igual) ... */ 
    }).then((result) => {
        if (result.isConfirmed) {
            productosEnCarrito.length = 0;
            localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
            cargarProductosCarrito(); // Llama a cargar, y cargar llama a guardarEnFirestore
        }
    });
});

// ----------------------------------------------------------------
// OTRAS FUNCIONES Y LLAMADAS FINALES (Se mantienen igual)
// ----------------------------------------------------------------

function actualizarTotal() {
    const totalProductos = productosEnCarrito.reduce((acc, p) => acc + p.cantidad, 0);
    const subtotal = productosEnCarrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
    const envio = subtotal >= 1000 ? 0 : 139;
    const totalFinal = subtotal + envio;

    document.getElementById("carrito-total-productos").textContent = totalProductos;
    document.getElementById("carrito-subtotal").textContent = `$${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
    document.getElementById("carrito-envio").textContent = envio === 0 ? "Gratis" : `$${envio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
    document.getElementById("carrito-total").textContent = `$${totalFinal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
}

botonComprar.addEventListener("click", () => {
    if (productosEnCarrito.length === 0) return;
    window.location.href = "pago.html";
});

function actualizarResumenCompra() {
    const totalProductos = productosEnCarrito.reduce((acc, prod) => acc + prod.cantidad, 0);
    const subtotal = productosEnCarrito.reduce((acc, prod) => acc + prod.precio * prod.cantidad, 0);
    const envio = subtotal >= 1000 ? 0 : 139;
    const totalFinal = subtotal + envio;
 
    document.getElementById("carrito-total-productos").textContent = totalProductos;
    document.getElementById("carrito-subtotal").textContent = `$${subtotal.toLocaleString('es-MX')}`;
    document.getElementById("carrito-envio").textContent = envio === 0 ? "Gratis" : `$${envio}`;
    document.getElementById("carrito-total").textContent = `$${totalFinal.toLocaleString('es-MX')}`;
}

// ----------------------------------------------------------------
// INICIALIZACIÓN FINAL
// ----------------------------------------------------------------
cargarProductosCarrito();