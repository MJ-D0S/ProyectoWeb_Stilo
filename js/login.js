document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const showErrorToast = (message) => {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "#ff5f5f",
        }).showToast();
    };

    try {
        // 1. Consulta la colección "Usuarios"
        const usuariosRef = db.collection("Usuarios");
        
        // Intentamos con el nombre de campo más probable
        let querySnapshot = await usuariosRef
            .where("Correo ElectronicoU", "==", email) // Nombre original con espacio
            .limit(1)
            .get();

        if (querySnapshot.empty) {
             // Intentamos sin espacio, por si el nombre de campo ha cambiado
             querySnapshot = await usuariosRef
                 .where("CorreoElectronicoU", "==", email) // Nombre sin espacio
                 .limit(1)
                 .get();
        }

        if (querySnapshot.empty) {
            showErrorToast('Correo electrónico o contraseña incorrectos');
            return;
        }

        // 2. Se encontró un usuario, ahora validamos la contraseña
        const userData = querySnapshot.docs[0].data();
        const docId = querySnapshot.docs[0].id; // ID del documento de Firestore
        
        // Revisamos las variantes de contraseña almacenadas en Firestore
        const storedPassword = userData.ContraseñaU || userData.ContraseniaU || userData.contraseñaU; 

        // CRÍTICO: Comparamos la contraseña ingresada con cualquiera de las variantes almacenadas
        if (storedPassword === password) {
            // Login exitoso
            const nombreUsuario = `${userData.NombreU || ''} ${userData.ApellidoU || ''}`.trim();

            // 3. GUARDAMOS EL ID DE SESIÓN EN LOCAL STORAGE (CRÍTICO PARA EL CARRITO)
            localStorage.setItem('usuarioLogueado', JSON.stringify({
                email: email,
                // Usamos el ID del documento de Firestore como identificador único para el carrito
                uid: docId, 
                nombre: nombreUsuario
            }));

            window.location.href = 'index.html';
            
        } else {
            // Contraseña incorrecta
            showErrorToast('Correo electrónico o contraseña incorrectos');
        }

    } catch (error) {
        console.error('Error al iniciar sesión o consultar Firestore:', error);
        
        if (error.message && error.message.includes("Missing or insufficient permissions")) {
            showErrorToast("Error de seguridad: Revisar reglas para la colección 'Usuarios'.");
        } else {
            showErrorToast("Error interno del servidor. Consulte la consola.");
        }
    }
});