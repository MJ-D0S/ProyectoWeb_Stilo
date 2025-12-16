document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        const showErrorToast = (message) => {
            Toastify({
                text: message,
                duration: 3000,
                gravity: 'top',
                position: 'right',
                backgroundColor: '#ff5f5f'
            }).showToast();
        };

        try {
            // 1. Consulta la colección "Vendedor"
            const vendedoresRef = db.collection("Vendedor");

            // Buscar el vendedor por su correo electrónico (usando el campo CorreoElectronicoV)
            const querySnapshot = await vendedoresRef
                .where("CorreoElectronicoV", "==", email)
                .limit(1)
                .get();

            if (querySnapshot.empty) {
                showErrorToast('Correo de vendedor o contraseña incorrectos.');
                return;
            }

            // 2. Se encontró un vendedor, ahora validar la contraseña
            const vendedorData = querySnapshot.docs[0].data();

            // Usamos el campo de contraseña que se ve en Firestore: ContraseñaV
            const storedPassword = vendedorData.ContraseñaV; 
            
            // CRÍTICO: Comparamos la contraseña ingresada
            if (storedPassword === password) {
                // Login exitoso
                const nombreVendedor = `${vendedorData.NombreV || ''} ${vendedorData.Apellidos || ''}`.trim();
                
                // Opcional: Si quieres guardar la sesión del vendedor, puedes usar localStorage, 
                // pero asegúrate de no confundirlo con el usuario normal.
                localStorage.setItem('vendedorLogueado', JSON.stringify({
                    email: email,
                    uid: querySnapshot.docs[0].id,
                    nombre: nombreVendedor
                }));
                
                // Redirigir al panel de administración (admin2.html)
                window.location.href = 'admin2.html';

            } else {
                // Contraseña incorrecta
                showErrorToast('Correo de vendedor o contraseña incorrectos.');
            }

        } catch (error) {
            console.error('Error al iniciar sesión del vendedor o consultar Firestore:', error);
            showErrorToast('Error al conectar con el servidor.');
        }
    });
});