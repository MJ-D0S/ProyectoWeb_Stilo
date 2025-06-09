// productos.js

const productos = [
    {
        id: "abrigo-01",
        titulo: "Puffer Azul Marino",
        imagen: "./img/abrigos/01.jpg",
        categoria: { nombre: "Abrigos", id: "abrigos" },
        precio: 396.00
    },
    {
        id: "abrigo-02",
        titulo: "Blazer Casual Negro",
        imagen: "./img/abrigos/02.jpg",
        categoria: { nombre: "Abrigos", id: "abrigos" },
        precio: 396.00
    },
    {
        id: "camiseta-01",
        titulo: "Camiseta Azul Oscuro Clásica",
        imagen: "./img/camisetas/01.jpg",
        categoria: { nombre: "Camisetas", id: "camisetas" },
        precio: 99.99
    },
    {
        id: "pantalon-01",
        titulo: "Pantalón Beige Casual",
        imagen: "./img/pantalones/01.jpg",
        categoria: { nombre: "Pantalones", id: "pantalones" },
        precio: 160.00
    }
];

// Función para mostrar productos en el DOM
function renderizarProductos(lista) {
    const contenedor = document.getElementById('contenedor-productos');
    contenedor.innerHTML = '';

    lista.forEach(producto => {
        const div = document.createElement('div');
        div.classList.add('producto');
        div.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.titulo}" />
            <h3>${producto.titulo}</h3>
            <p>Precio: $${producto.precio.toFixed(2)}</p>
            <button class="boton-agregar" data-id="${producto.id}">Agregar al carrito</button>
        `;
        contenedor.appendChild(div);
    });

    activarBotonesAgregar(); // Activar funcionalidad después de renderizar
}

// Mostrar todos los productos
function mostrarTodos() {
    renderizarProductos(productos);
}

// Mostrar productos por categoría
function mostrarCategoria(categoriaId) {
    const filtrados = productos.filter(prod => prod.categoria.id === categoriaId);
    renderizarProductos(filtrados);
}

// Agregar al carrito y redirigir a carrito.html
function activarBotonesAgregar() {
    const botonesAgregar = document.querySelectorAll(".boton-agregar");

    botonesAgregar.forEach(boton => {
        boton.addEventListener("click", () => {
            const idProducto = boton.dataset.id;
            const productoSeleccionado = productos.find(p => p.id === idProducto);

            let carrito = JSON.parse(localStorage.getItem("productos-en-carrito")) || [];
            const existe = carrito.find(p => p.id === productoSeleccionado.id);

            if (existe) {
                existe.cantidad++;
            } else {
                carrito.push({ ...productoSeleccionado, cantidad: 1 });
            }

            localStorage.setItem("productos-en-carrito", JSON.stringify(carrito));

            // Redirigir al carrito
            window.location.href = "carrito.html";
        });
    });
}
