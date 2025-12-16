document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registroForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value.trim();
        const apellido = document.getElementById('apellido').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Función para mostrar errores usando Toastify
        const mostrarError = (msg) => {
            Toastify({
                text: msg,
                duration: 3000,
                backgroundColor: "#ff5f5f"
            }).showToast();
        };

        // --- 1. Validaciones Locales (Mantenemos las restricciones originales) ---
        const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

        if (!soloLetras.test(nombre)) {
            return mostrarError("El nombre solo debe contener letras.");
        }
        if (!soloLetras.test(apellido)) {
            return mostrarError("El apellido solo debe contener letras.");
        }

        // Mantenemos la restricción estricta de dominios que tenías:
        const emailRegex = /^[A-Za-z0-9._%+-]{6,}@(gmail\.com|outlook\.com|yahoo\.com\.mx)$/;

        if (!emailRegex.test(email)) {
            return mostrarError("Correo inválido. Usa un dominio permitido.");
        }

        if (password.length < 6) {
            return mostrarError("La contraseña debe tener al menos 6 caracteres.");
        }
        
        // --- 2. Validación de Existencia en Firestore (Colección Vendedor) ---
        try {
            const vendedoresRef = db.collection("Vendedor");
            
            // Buscar si ya existe un vendedor con ese correo electrónico
            // Usamos el campo CorreoElectronicoV, según la estructura de la colección Vendedor
            const querySnapshot = await vendedoresRef
                .where("CorreoElectronicoV", "==", email) 
                .limit(1)
                .get();

            if (!querySnapshot.empty) {
                return mostrarError("Este correo de administrador ya está registrado.");
            }
            
            // --- 3. Registro en Firestore ---
            
            const nuevoVendedorData = {
                NombreV: nombre,
                Apellidos: apellido, // Usamos 'Apellidos' como se ve en Firestore
                CorreoElectronicoV: email, 
                ContraseñaV: password, // Usamos 'ContraseñaV' como se ve en Firestore
                // Puedes añadir otros campos necesarios para la administración
            };

            // Guarda el nuevo documento en la colección 'Vendedor'
            await vendedoresRef.add(nuevoVendedorData);

            // Éxito
            Toastify({
                text: "Registro de vendedor exitoso. Redirigiendo...",
                duration: 2000,
                backgroundColor: "green"
            }).showToast();

            setTimeout(() => {
                // Redirigir al login de administrador
                window.location.href = 'loginadmin.html';
            }, 2000);

        } catch (error) {
            console.error('Error al registrar o verificar vendedor en Firestore:', error);
            mostrarError("Error al conectar con el servidor para registrar el vendedor.");
        }
    });

    // La función mostrarError está definida dentro del DOMContentLoaded para ser accesible
});