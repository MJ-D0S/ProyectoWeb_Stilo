document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("formulario-pago");
    const camposNumericos = ["codigo-postal", "telefono", "numero-tarjeta", "codigo-seguridad"];
    const vencimientoInput = document.getElementById("vencimiento");

    // Validación de solo números
    camposNumericos.forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener("input", () => {
            input.value = input.value.replace(/[^\d]/g, "");
        });
    });

    // Formato automático MM/AA
    vencimientoInput.addEventListener("input", (e) => {
        let valor = e.target.value.replace(/[^\d]/g, "");
        if (valor.length >= 3) {
            valor = valor.slice(0, 2) + "/" + valor.slice(2, 4);
        }
        e.target.value = valor.slice(0, 5);
    });

    // Simular resumen de compra desde localStorage
    const productos = JSON.parse(localStorage.getItem("productos-en-carrito")) || [];
    const detalle = document.getElementById("detalle-pedido");
    const subtotalDOM = document.getElementById("resumen-subtotal");
    const envioDOM = document.getElementById("resumen-envio");
    const totalDOM = document.getElementById("resumen-total");

    let subtotal = 0;
    productos.forEach(p => {
        const item = document.createElement("p");
        item.textContent = `${p.titulo} x${p.cantidad} - $${(p.precio * p.cantidad).toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
        detalle.appendChild(item);
        subtotal += p.precio * p.cantidad;
    });

    const envio = subtotal >= 1000 ? 0 : 139;
    const total = subtotal + envio;

    subtotalDOM.textContent = `$${subtotal.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
    envioDOM.textContent = envio === 0 ? "Gratis" : `$${envio.toLocaleString('es-MX')}`;
    totalDOM.textContent = `$${total.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;

    // Al enviar formulario mostrar mensaje
    formulario.addEventListener("submit", function (e) {
        e.preventDefault();

        Swal.fire({
            title: 'Pago exitoso',
            html: `
                <p>Gracias por su compra en <strong>Stilø</strong> 💳</p>
                <p>Su pedido ha sido procesado correctamente.</p>
            `,
            icon: 'success',
            confirmButtonText: 'Volver al inicio'
        }).then(() => {
            localStorage.removeItem("productos-en-carrito");
            window.location.href = "index.html";
        });
    });
});