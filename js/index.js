// index.js

// Lógica general de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    // Lógica para manejar la sesión del usuario
    const usuario = JSON.parse(localStorage.getItem('usuarioLogueado'));

    if (usuario && usuario.nombre) {
        // Ocultar los botones de login
        const botonLogin = document.querySelector('.boton-login-admin[href="login.html"]');
        const botonVendedor = document.querySelector('.boton-login-admin[href="loginadmin.html"]');

        if (botonLogin) botonLogin.style.display = 'none';
        if (botonVendedor) botonVendedor.style.display = 'none';

        // Crear contenedor para bienvenida y logout
        const contenedorSesion = document.createElement('div');
        contenedorSesion.className = 'contenedor-sesion';

        // Crear mensaje de bienvenida
        const mensaje = document.createElement('p');
        mensaje.className = 'mensaje-bienvenida';
        mensaje.innerText = `¡Bienvenido, ${usuario.nombre}!`;

        // Crear botón de cerrar sesión
        const cerrarSesionBtn = document.createElement('button');
        cerrarSesionBtn.innerText = 'Cerrar sesión';
        cerrarSesionBtn.className = 'boton-menu boton-logout';

        // Evento para cerrar sesión
        cerrarSesionBtn.addEventListener('click', () => {
            localStorage.removeItem('usuarioLogueado');
            location.reload();
        });

        // Agregar elementos al contenedor y al aside
        contenedorSesion.appendChild(mensaje);
        contenedorSesion.appendChild(cerrarSesionBtn);
        const aside = document.querySelector('aside');
        aside.insertBefore(contenedorSesion, aside.querySelector('nav'));
    }

    // Llamar a la función para mostrar los productos al cargar la página
    mostrarProductos();

    // Mensaje en consola para confirmar que index.js se ha cargado
    console.log("index.js cargado correctamente");
});
