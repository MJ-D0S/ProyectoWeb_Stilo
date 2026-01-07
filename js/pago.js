document.addEventListener("DOMContentLoaded", () => {
    // 🚨 ASUME que 'db' (Firestore), 'Swal' y 'firebase' son globales.
    const formulario = document.getElementById("formulario-pago");

    // ============================================
    // OBTENEMOS TODOS LOS CAMPOS DEL HTML
    // ============================================
    const emailInput = document.getElementById("email");
    const nombreInput = document.getElementById("nombre");
    const apellidoInput = document.getElementById("apellido");
    const calleInput = document.getElementById("calle");
    const numeroExtInput = document.getElementById("numero-exterior"); 
    const coloniaInput = document.getElementById("colonia");
    const ciudadInput = document.getElementById("ciudad"); 
    const estadoInput = document.getElementById("estado"); 
    const cpInput = document.getElementById("codigo-postal");
    const telefonoInput = document.getElementById("telefono");
    const tarjetaInput = document.getElementById("numero-tarjeta");
    const codigoSeguridadInput = document.getElementById("codigo-seguridad");
    const vencimientoInput = document.getElementById("vencimiento");
    const nombreTitularInput = document.getElementById("nombre-titular");

    // Validación de existencia de elementos
    if (!emailInput || !nombreInput || !apellidoInput || !calleInput || !numeroExtInput || !coloniaInput || !ciudadInput || !estadoInput || !cpInput || !telefonoInput || !tarjetaInput || !codigoSeguridadInput || !vencimientoInput || !nombreTitularInput) {
        Swal.fire("ERROR", "Faltan elementos de formulario en el HTML. Verifique los IDs.", "error");
        return; 
    }

    // ============================================
    // FUNCIONES DE RESTRICCIÓN (REGEX)
    // ============================================

    // Restricción: Solo letras, espacios y tildes (Bloquea números y @,.;)
    const validarSoloLetras = (e) => {
        e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
    };

    // Restricción: Solo números y límite de caracteres
    const validarSoloNumeros = (e, max) => {
        e.target.value = e.target.value.replace(/[^\d]/g, "").slice(0, max);
    };

    // ============================================
    // ASIGNACIÓN DE VALIDACIONES EN TIEMPO REAL
    // ============================================

    // Campos de solo letras
    nombreInput.addEventListener("input", validarSoloLetras);
    apellidoInput.addEventListener("input", validarSoloLetras);
    ciudadInput.addEventListener("input", validarSoloLetras);
    estadoInput.addEventListener("input", validarSoloLetras);
    nombreTitularInput.addEventListener("input", validarSoloLetras);

    // Campos de solo números
    telefonoInput.addEventListener("input", (e) => validarSoloNumeros(e, 10));
    cpInput.addEventListener("input", (e) => validarSoloNumeros(e, 6));
    tarjetaInput.addEventListener("input", (e) => validarSoloNumeros(e, 16));
    codigoSeguridadInput.addEventListener("input", (e) => validarSoloNumeros(e, 3));
    numeroExtInput.addEventListener("input", (e) => validarSoloNumeros(e, 10));

    // Formato automático MM/AA para vencimiento
    vencimientoInput.addEventListener("input", (e) => {
        let valor = e.target.value.replace(/[^\d]/g, ""); 
        if (valor.length >= 3) {
            valor = valor.slice(0, 2) + "/" + valor.slice(2, 4);
        }
        e.target.value = valor.slice(0, 5);
    });

    // ============================================
    // RESUMEN DE COMPRA (Lógica de Precios)
    // ============================================
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

    const envio = (subtotal >= 1000 || subtotal === 0) ? 0 : 139;
    const total = subtotal + envio;

    subtotalDOM.textContent = `$${subtotal.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
    envioDOM.textContent = envio === 0 ? "Gratis" : `$${envio.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
    totalDOM.textContent = `$${total.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;

    // ============================================
    // ENVÍO DEL FORMULARIO A FIRESTORE
    // ============================================
    formulario.addEventListener("submit", async function (e) {
        e.preventDefault();

        // Validaciones de longitud mínima antes de enviar
        if (telefonoInput.value.length !== 10) { 
            Swal.fire("Error", "El teléfono debe tener 10 dígitos.", "error");
            return;
        }
        if (tarjetaInput.value.length !== 16) {
            Swal.fire("Error", "La tarjeta debe tener 16 dígitos.", "error");
            return;
        }
        if (codigoSeguridadInput.value.length !== 3) {
            Swal.fire("Error", "El código de seguridad (CVV) debe tener 3 dígitos.", "error");
            return;
        }

        const usuarioDataString = localStorage.getItem('usuarioLogueado');
        if (!usuarioDataString) {
            Swal.fire("Error de Sesión", "Debe iniciar sesión para realizar la compra.", "error");
            return;
        }
        const userID = JSON.parse(usuarioDataString).uid;
        
        // Estructura de datos para actualizar el Usuario
        const datosUsuarioUpdate = {
            EmailU: emailInput.value.trim(),
            NombreU: nombreInput.value.trim(),
            ApellidoU: apellidoInput.value.trim(),
            TelefonoU: telefonoInput.value.trim(),
            Direccion: {
                calle: calleInput.value.trim(),
                numero: numeroExtInput.value.trim(),
                colonia: coloniaInput.value.trim(),
                ciudad: ciudadInput.value.trim(),
                estado: estadoInput.value.trim(),
                codigoPostal: cpInput.value.trim()
            },
            MetodoPago: {
                tipo: 'Tarjeta de Crédito/Débito',
                ultimosDigitos: tarjetaInput.value.trim().slice(-4), 
                vencimiento: vencimientoInput.value.trim(),
                nombreTitular: nombreTitularInput.value.trim()
            }
        };

        // Estructura para la colección de Pedidos
        const articulosPedido = productos.map(p => ({
            ProductoId: p.id,
            NombreP: p.titulo,
            Cantidad: p.cantidad,
            Precio: p.precio.toFixed(2),
            Subtotal: (p.precio * p.cantidad).toFixed(2)
        }));

        const datosPedidoNew = {
            "Articulos comprados": articulosPedido,
            Estado: "Pendiente",
            UsuarioId: userID,
            "Total Final": total.toFixed(2),
            "Fecha Pedido": firebase.firestore.FieldValue.serverTimestamp(),
            "Hora Pedido": firebase.firestore.FieldValue.serverTimestamp() 
        };
        
        try {
            // Actualizar perfil del usuario y crear el pedido simultáneamente
            await db.collection("Usuarios").doc(userID).set(datosUsuarioUpdate, { merge: true });
            await db.collection("Pedidos").add(datosPedidoNew);

            Swal.fire({
                title: 'Pago exitoso',
                html: `<p>¡Gracias por tu compra en <strong>Stilø</strong>! 💳</p><p>Tu pedido está siendo procesado.</p>`,
                icon: 'success',
                confirmButtonText: 'Finalizar'
            }).then(() => {
                localStorage.removeItem("productos-en-carrito");
                window.location.href = "index.html";
            });

        } catch (error) {
            console.error("❌ Error en Firestore:", error);
            Swal.fire("Error de Red", "No se pudo completar la transacción. Intente más tarde.", "error");
        }
    });
});