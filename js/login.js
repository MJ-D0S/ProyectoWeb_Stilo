document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const showToast = (message, isError = true) => {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: "right",
            style: {
                background: isError ? "#ff5f5f" : "#00b09b",
            },
        }).showToast();
    };

    try {
        const usuariosRef = db.collection("Usuarios");
        
        // 1. Buscamos el correo (Probando variantes de nombre de campo con/sin espacio)
        let querySnapshot = await usuariosRef.where("Correo ElectronicoU", "==", email).limit(1).get();
        if (querySnapshot.empty) {
            querySnapshot = await usuariosRef.where("CorreoElectronicoU", "==", email).limit(1).get();
        }

        if (querySnapshot.empty) {
            showToast('El correo electrónico no está registrado.');
            return;
        }

        // 2. Extraemos datos del usuario encontrado
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const docId = userDoc.id;
        
        // 3. Validamos la contraseña (buscando variantes de nombre de campo)
        const storedPassword = userData.ContraseñaU || userData.ContraseniaU || userData.contraseñaU; 

        if (storedPassword === password) {
            // LOGIN EXITOSO
            const nombreUsuario = `${userData.NombreU || ''} ${userData.ApellidoU || ''}`.trim();

            // 4. GUARDAMOS EN LOCALSTORAGE (Esto es lo que el carrito revisará)
            localStorage.setItem('usuarioLogueado', JSON.stringify({
                email: email,
                uid: docId, 
                nombre: nombreUsuario || "Usuario"
            }));

            showToast(`Bienvenido, ${nombreUsuario || email}`, false);

            // Redirigimos al index
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
            
        } else {
            showToast('La contraseña es incorrecta.');
        }

    } catch (error) {
        console.error('Error en Login:', error);
        showToast("Error de conexión con Firestore.");
    }
});