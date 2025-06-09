document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
        let nombreUsuario = '';
        let loginExitoso = false;

        // Verificar usuarios hardcodeados
        if (email === 'juanperez4223@gmail.com' && password === 'JuP104522') {
            nombreUsuario = 'Juan Perez';
            loginExitoso = true;
        } else if (email === 'anagomez12434@gmail.com' && password === 'ANG342123') {
            nombreUsuario = 'Ana Gomez';
            loginExitoso = true;
        } else {
            // Verificar en localStorage
            const user = JSON.parse(localStorage.getItem(email));

            if (user && user.password === password) {
                nombreUsuario = `${user.nombre} ${user.apellido}` || email;
                loginExitoso = true;
            }
        }

        if (loginExitoso) {
            // Guardar el usuario logueado en localStorage
            localStorage.setItem('usuarioLogueado', JSON.stringify({
                email: email,
                nombre: nombreUsuario
            }));

            // Redirigir al inicio
            window.location.href = 'index.html';
        } else {
            Toastify({
                text: 'Correo electrónico o contraseña incorrectos',
                duration: 3000,
                gravity: "top",
                position: "right",
                backgroundColor: "#ff5f5f",
            }).showToast();
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        Toastify({
            text: "Error al conectar con el servidor.",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "#ff5f5f",
        }).showToast();
    }
});

