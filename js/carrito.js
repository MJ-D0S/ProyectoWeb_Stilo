// Modificaciones integradas a carrito.js para agregar y eliminar productos por unidad
// y mostrar desglose con IVA incluido en cada precio (precios ya incluyen IVA)

let productosEnCarrito = JSON.parse(localStorage.getItem("productos-en-carrito")) || [];

const contenedorCarritoVacio = document.querySelector("#carrito-vacio");
const contenedorCarritoProductos = document.querySelector("#carrito-productos");
const contenedorCarritoAcciones = document.querySelector("#carrito-acciones");
const contenedorCarritoComprado = document.querySelector("#carrito-comprado");
let botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");
const botonVaciar = document.querySelector("#carrito-acciones-vaciar");
const contenedorTotal = document.querySelector("#total");
const botonComprar = document.querySelector("#carrito-acciones-comprar");

function cargarProductosCarrito() {
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
}

function actualizarBotonesEliminar() {
    botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");
    botonesEliminar.forEach(boton => {
        boton.addEventListener("click", eliminarDelCarrito);
    });
}

function eliminarDelCarrito(e) {
    const idBoton = e.currentTarget.id;
    const index = productosEnCarrito.findIndex(producto => producto.id === idBoton);
    productosEnCarrito.splice(index, 1);
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
    cargarProductosCarrito();

    Toastify({
        text: "Producto eliminado",
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        style: {
            background: "linear-gradient(to right, #0056B3, #007BFF)",
            borderRadius: "2rem",
            textTransform: "uppercase",
            fontSize: ".75rem"
        },
        offset: { x: '1.5rem', y: '1.5rem' }
    }).showToast();
}

function actualizarBotonesCantidad() {
    const botonesSumar = document.querySelectorAll(".sumar");
    const botonesRestar = document.querySelectorAll(".restar");

    botonesSumar.forEach(boton => {
        boton.addEventListener("click", () => {
            const id = boton.dataset.id;
            const producto = productosEnCarrito.find(p => p.id === id);
            producto.cantidad++;
            localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
            cargarProductosCarrito();
        });
    });

    botonesRestar.forEach(boton => {
        boton.addEventListener("click", () => {
            const id = boton.dataset.id;
            const producto = productosEnCarrito.find(p => p.id === id);
            if (producto.cantidad > 1) {
                producto.cantidad--;
            } else {
                productosEnCarrito = productosEnCarrito.filter(p => p.id !== id);
            }
            localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
            cargarProductosCarrito();
        });
    });
}

botonVaciar.addEventListener("click", () => {
    Swal.fire({
        title: '¿Estás seguro?',
        icon: 'question',
        html: `Se van a borrar ${productosEnCarrito.reduce((acc, p) => acc + p.cantidad, 0)} productos.`,
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            productosEnCarrito.length = 0;
            localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
            cargarProductosCarrito();
        }
    });
});

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

    // Guardamos el carrito en localStorage y redirigimos
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
    window.location.href = "pago.html";
});


cargarProductosCarrito();
actualizarResumenCompra();

function actualizarResumenCompra() {
    const totalProductos = carrito.reduce((acc, prod) => acc + prod.cantidad, 0);
    const subtotal = carrito.reduce((acc, prod) => acc + prod.precio * prod.cantidad, 0);
    const envio = subtotal >= 1000 ? 0 : 139;
    const totalFinal = subtotal + envio;
  
    document.getElementById("carrito-total-productos").textContent = totalProductos;
    document.getElementById("carrito-subtotal").textContent = `$${subtotal.toLocaleString('es-MX')}`;
    document.getElementById("carrito-envio").textContent = envio === 0 ? "Gratis" : `$${envio}`;
    document.getElementById("carrito-total").textContent = `$${totalFinal.toLocaleString('es-MX')}`;
  }
  
  
