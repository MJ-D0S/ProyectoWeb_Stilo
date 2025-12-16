// js/registro.js

// NOTA: Este script asume que 'db' (Firestore) y 'Toastify' son accesibles globalmente.

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registroForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value.trim();
        const apellido = document.getElementById('apellido').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

        // --- 1. Validaciones Locales ---
        if (!soloLetras.test(nombre)) {
            return mostrarError("El nombre solo debe contener letras.");
        }
        if (!soloLetras.test(apellido)) {
            return mostrarError("El apellido solo debe contener letras.");
        }

        // Usamos una Regex más flexible para asegurar que no falle por errores de dominio si Firestore ya lo valida
        const emailRegex = /^[A-Za-z0-9._%+-]{6,}@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/; 

        if (!emailRegex.test(email)) {
            return mostrarError("Correo electrónico inválido o formato incorrecto.");
        }

        if (password.length < 6) {
            return mostrarError("La contraseña debe tener al menos 6 caracteres.");
        }
        
        // --- 2. Validación de Existencia en Firestore ---
        try {
            const usuariosRef = db.collection("Usuarios");
            
            // Buscar si ya existe un usuario con ese correo electrónico
            const querySnapshot = await usuariosRef
                // Usamos el campo con espacio ya que fue el que se confirmó en el login
                .where("Correo ElectronicoU", "==", email) 
                .limit(1)
                .get();

            if (!querySnapshot.empty) {
                return mostrarError("Este correo ya está registrado.");
            }
            
            // --- 3. Registro en Firestore ---
            
            const nuevoUsuarioData = {
                NombreU: nombre,
                ApellidoU: apellido,
                // Usar el nombre del campo que ha sido consistente
                "Correo ElectronicoU": email, 
                ContraseñaU: password, // Usamos la versión con tilde
                TelefonoU: "",
                Direccion: {}, // Inicializar como mapa vacío
                MetodoPago: {}, // Inicializar como mapa vacío
                // Podrías añadir la fecha de registro: FechaRegistro: new Date()
            };

            // Guarda el nuevo documento en la colección 'Usuarios'
            await usuariosRef.add(nuevoUsuarioData);

            // Éxito
            Toastify({
                text: "Registro exitoso. Redirigiendo...",
                duration: 2000,
                backgroundColor: "green"
            }).showToast();

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
            console.error('Error al registrar o verificar usuario en Firestore:', error);
            mostrarError("Error al conectar con el servidor para registrar el usuario.");
        }
    });

    function mostrarError(msg) {
        Toastify({
            text: msg,
            duration: 3000,
            backgroundColor: "#ff5f5f"
        }).showToast();
    }
});
