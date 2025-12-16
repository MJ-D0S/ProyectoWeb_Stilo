document.addEventListener('DOMContentLoaded', () => {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogueado'));
    if (usuario && usuario.nombre) {

        const botonLogin = document.querySelector('.boton-login-admin[href="login.html"]');
        const botonVendedor = document.querySelector('.boton-login-admin[href="loginadmin.html"]');

        if (botonLogin) botonLogin.style.display = 'none';
        if (botonVendedor) botonVendedor.style.display = 'none';

        const contenedorSesion = document.createElement('div');
        contenedorSesion.className = 'contenedor-sesion';

       const mensaje = document.createElement('p');
        mensaje.className = 'mensaje-bienvenida';
        mensaje.innerText = `¡Bienvenido, ${usuario.nombre}!`;

        const cerrarSesionBtn = document.createElement('button');
        cerrarSesionBtn.innerText = 'Cerrar sesión';
        cerrarSesionBtn.className = 'boton-menu boton-logout';

        cerrarSesionBtn.addEventListener('click', () => {
            localStorage.removeItem('usuarioLogueado');
            location.reload();
        });

        contenedorSesion.appendChild(mensaje);
        contenedorSesion.appendChild(cerrarSesionBtn);
        const aside = document.querySelector('aside');
        aside.insertBefore(contenedorSesion, aside.querySelector('nav'));
    }
    mostrarProductos();
    console.log("index.js cargado correctamente");
});
