let productosEnCarrito = []; 

const contenedorCarritoVacio = document.querySelector("#carrito-vacio");
const contenedorCarritoProductos = document.querySelector("#carrito-productos");
const contenedorCarritoAcciones = document.querySelector("#carrito-acciones");
const contenedorCarritoComprado = document.querySelector("#carrito-comprado");
let botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");
const botonVaciar = document.querySelector("#carrito-acciones-vaciar");
const botonComprar = document.querySelector("#carrito-acciones-comprar");

// ----------------------------------------------------------------
// FUNCIÓN DE GUARDADO EN FIRESTORE
// ----------------------------------------------------------------
async function guardarEnFirestore() {
    const usuarioDataString = localStorage.getItem('usuarioLogueado');
    if (!usuarioDataString) return;
    
    const userID = JSON.parse(usuarioDataString).uid;
    if (!userID) return;

    try {
        const carritoRef = db.collection("Usuario_Carrito");

        const articulosFirestore = productosEnCarrito.map(producto => ({
            Cantidad: producto.cantidad,
            "Nombre P": producto.titulo,
            Precio: `$${producto.precio.toFixed(2)}`
        }));

        await carritoRef.doc(userID).set({
            "Usuario Id": `/Usuarios/${userID}`,
            articulos: articulosFirestore
        });

        console.log(`✅ Carrito sincronizado en Firestore`);

    } catch (error) {
        console.error("❌ ERROR al guardar en Firestore:", error);
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
            // CORRECCIÓN DE IMAGEN: 
            // Buscamos en todas las posibles variantes de nombre de campo que puedas tener
            const imagenSrc = producto.imagen || producto.imagenP || producto.img || "./img/placeholder.jpg";

            const div = document.createElement("div");
            div.classList.add("carrito-producto");
            div.innerHTML = `
                <img class="carrito-producto-imagen" src="${imagenSrc}" alt="${producto.titulo}">
                <div class="carrito-producto-titulo">
                    <small>Título</small>
                    <h3>${producto.titulo}</h3>
                </div>
                <div class="carrito-producto-precio">
                    <small>Precio Unitario</small>
                    <p>$${producto.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
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
                    <p>$${(producto.precio * producto.cantidad).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
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
    
    guardarEnFirestore();
}

// ----------------------------------------------------------------
// BOTONES Y ACCIONES
// ----------------------------------------------------------------

function actualizarBotonesEliminar() {
    botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");
    botonesEliminar.forEach(boton => {
        boton.addEventListener("click", eliminarDelCarrito);
    });
}

function eliminarDelCarrito(e) {
    const idBoton = e.currentTarget.id;
    productosEnCarrito = productosEnCarrito.filter(producto => producto.id !== idBoton);
    
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
    cargarProductosCarrito();

    Toastify({
        text: "Producto eliminado",
        duration: 2000,
        gravity: "top",
        position: "right",
        style: { background: "linear-gradient(to right, #fe8c00, #f83600)" }
    }).showToast();
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
                productosEnCarrito = productosEnCarrito.filter(p => p.id !== id);
            }
        }
        
        localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
        cargarProductosCarrito();
    };
    
    botonesSumar.forEach(boton => {
        boton.addEventListener("click", () => manejarCambioCantidad(boton.dataset.id, 'sumar'));
    });

    botonesRestar.forEach(boton => {
        boton.addEventListener("click", () => manejarCambioCantidad(boton.dataset.id, 'restar'));
    });
}

botonVaciar.addEventListener("click", () => {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Se vaciará todo tu carrito",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, vaciar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            productosEnCarrito = [];
            localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
            cargarProductosCarrito();
        }
    });
});

function actualizarTotal() {
    const totalProductos = productosEnCarrito.reduce((acc, p) => acc + p.cantidad, 0);
    const subtotal = productosEnCarrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
    const envio = subtotal >= 1000 || subtotal === 0 ? 0 : 139;
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

// Inicialización
cargarProductosCarrito();