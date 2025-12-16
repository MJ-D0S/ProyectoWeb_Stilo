// js/sesion.js

document.addEventListener("DOMContentLoaded", () => {
    // Referencias a los elementos del DOM (Asegúrate que estos IDs existen en tu index.html)
    const usuarioConectadoDiv = document.getElementById('usuario-conectado'); // El div que contiene la bienvenida y Cerrar Sesión
    const bienvenidaParrafo = document.getElementById('bienvenida'); // El párrafo dentro del div
    const btnLogin = document.getElementById('btnLogin'); // Botón Iniciar Sesión
    const btnVendedor = document.getElementById('btnVendedor'); // Botón ¿Eres Vendedor?
    const btnLogout = document.getElementById('btnLogout'); // Botón Cerrar Sesión
    
    // 1. Cargar datos del usuario desde localStorage
    const usuarioLogueadoJSON = localStorage.getItem('usuarioLogueado');
    let usuarioLogueado = null;

    if (usuarioLogueadoJSON) {
        try {
            usuarioLogueado = JSON.parse(usuarioLogueadoJSON);
        } catch (e) {
            console.error("Error al parsear usuarioLogueado:", e);
        }
    }

    if (usuarioLogueado && usuarioLogueado.nombre) {
        // 2. SI EL USUARIO ESTÁ LOGUEADO: Ocultar login, Mostrar bienvenida y logout
        
        // Ocultar botones de login
        if (btnLogin) btnLogin.style.display = 'none';
        if (btnVendedor) btnVendedor.style.display = 'none';

        // Mostrar recuadro de usuario y mensaje de bienvenida
        if (usuarioConectadoDiv) {
            usuarioConectadoDiv.style.display = 'block'; // Mostrar el div
            if (bienvenidaParrafo) {
                bienvenidaParrafo.innerText = `¡Hola, ${usuarioLogueado.nombre}!`;
            }
        }

    } else {
        // 3. SI NO HAY USUARIO LOGUEADO: Asegurar que se muestren los botones de login
        if (usuarioConectadoDiv) usuarioConectadoDiv.style.display = 'none';
        if (btnLogin) btnLogin.style.display = 'block';
        if (btnVendedor) btnVendedor.style.display = 'block';
    }

    // 4. Lógica de Cerrar Sesión
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('usuarioLogueado');
            window.location.reload(); 
        });
    }
});