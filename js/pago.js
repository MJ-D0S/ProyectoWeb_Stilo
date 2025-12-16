document.addEventListener("DOMContentLoaded", () => {
    // 🚨 ASUME que 'db' (Firestore), 'Swal' y 'firebase' (para serverTimestamp) son globales.
    
    const formulario = document.getElementById("formulario-pago");

    // ============================================
    // OBTENEMOS TODOS LOS CAMPOS (IDs ya verificados en el HTML)
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

    // Comprobación de que todos los IDs fueron encontrados (se mantiene para seguridad)
    if (!emailInput || !nombreInput || !apellidoInput || !calleInput || !numeroExtInput || !coloniaInput || !ciudadInput || !estadoInput || !cpInput || !telefonoInput || !tarjetaInput || !codigoSeguridadInput || !vencimientoInput || !nombreTitularInput) {
        Swal.fire("ERROR", "Faltan elementos de formulario en el HTML. Verifique los IDs.", "error");
        return; 
    }

    // ============================================
    // VALIDACIÓN: SOLO NÚMEROS Y LÍMITES (EN TIEMPO REAL)
    // ============================================

    // Teléfono → solo números, MÁXIMO 10 DÍGITOS. Eliminada la lógica de "+52".
    telefonoInput.addEventListener("input", () => {
        telefonoInput.value = telefonoInput.value.replace(/[^\d]/g, "").slice(0, 10);
    });

    // Código postal → solo números, máximo 6
    cpInput.addEventListener("input", () => {
        cpInput.value = cpInput.value.replace(/[^\d]/g, "").slice(0, 6);
    });

    // Número de tarjeta → solo números, máximo 16
    tarjetaInput.addEventListener("input", () => {
        tarjetaInput.value = tarjetaInput.value.replace(/[^\d]/g, "").slice(0, 16);
    });

    // Código de seguridad → solo números, máximo 3
    codigoSeguridadInput.addEventListener("input", () => {
        codigoSeguridadInput.value = codigoSeguridadInput.value.replace(/[^\d]/g, "").slice(0, 3);
    });

    // ============================================
    // FORMATO AUTOMÁTICO Y VALIDACIÓN DE MM/AA (Mes y Año)
    // ============================================

    vencimientoInput.addEventListener("input", (e) => {
        let valor = e.target.value.replace(/[^\d]/g, ""); 

        if (valor.length >= 3) {
            valor = valor.slice(0, 2) + "/" + valor.slice(2, 4);
        }

        e.target.value = valor.slice(0, 5);
    });

    vencimientoInput.addEventListener("blur", () => {
        const valor = vencimientoInput.value;

        if (!/^\d{2}\/\d{2}$/.test(valor)) {
            Swal.fire("Formato incorrecto", "Use MM/AA", "error")
                .then(() => { vencimientoInput.focus(); });
            return;
        }

        let [mes, año] = valor.split("/").map(n => parseInt(n));
        
        // RESTRICCIÓN 1: Mes (1-12)
        if (mes < 1 || mes > 12) {
            Swal.fire("Mes inválido", "El mes debe ser entre 01 y 12", "error")
                .then(() => { vencimientoInput.focus(); });
            return;
        }

        // RESTRICCIÓN 2: Año (de 25 a 99)
        const añoMinimo = 25; 
        const añoMaximo = 99;
        
        if (año < añoMinimo || año > añoMaximo) {
            Swal.fire("Año inválido", `El año debe ser entre ${añoMinimo} y ${añoMaximo}`, "error")
                .then(() => { vencimientoInput.focus(); });
            return;
        }
    });

    // ============================================
    // RESUMEN DE COMPRA (MANTENIDO)
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

    const envio = subtotal >= 1000 ? 0 : 139;
    const total = subtotal + envio;

    subtotalDOM.textContent = `$${subtotal.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
    envioDOM.textContent = envio === 0 ? "Gratis" : `$${envio.toLocaleString('es-MX')}`;
    totalDOM.textContent = `$${total.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;

    // ============================================
    // ENVÍO DEL FORMULARIO Y GUARDADO EN FIRESTORE
    // ============================================

    formulario.addEventListener("submit", async function (e) {
        e.preventDefault();

        // 1. VALIDACIONES FINALES
        // CRÍTICO: Se valida ahora 10 dígitos exactos, asumiendo que el usuario ingresa solo los números
        if (telefonoInput.value.length !== 10) { 
            Swal.fire("Error", "El teléfono debe tener 10 dígitos.", "error");
            return;
        }
        if (cpInput.value.length < 5 || cpInput.value.length > 6) {
            Swal.fire("Error", "El código postal debe tener entre 5 y 6 dígitos.", "error");
            return;
        }
        if (tarjetaInput.value.length !== 16) {
            Swal.fire("Error", "La tarjeta debe tener 16 dígitos.", "error");
            return;
        }

        // 2. OBTENER ID DE USUARIO
        const usuarioDataString = localStorage.getItem('usuarioLogueado');
        if (!usuarioDataString) {
            Swal.fire("Error de Sesión", "Debe iniciar sesión para realizar la compra.", "error");
            return;
        }
        const userID = JSON.parse(usuarioDataString).uid;
        
        // 3. DATOS A GUARDAR EN USUARIOS
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

        // 4. DATOS A GUARDAR EN PEDIDOS
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
            // 5. ACTUALIZAR DATOS DE USUARIO (Requiere 'allow update')
            await db.collection("Usuarios").doc(userID).set(datosUsuarioUpdate, { merge: true });
            console.log(`✅ Datos de usuario actualizados para ID: ${userID}`);

            // 6. CREAR NUEVO PEDIDO (Requiere 'allow create')
            await db.collection("Pedidos").add(datosPedidoNew);
            console.log("✅ Nuevo pedido guardado en la colección Pedidos.");

            // 7. CONFIRMACIÓN Y REDIRECCIÓN
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

        } catch (error) {
            console.error("❌ ERROR durante el proceso de pago en Firestore:", error);
            Swal.fire("Error de Pago", "Ocurrió un error al procesar y guardar su pedido. Revise la consola y sus reglas de Firebase.", "error");
        }
    });
});
