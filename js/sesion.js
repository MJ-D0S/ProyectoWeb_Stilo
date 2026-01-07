document.addEventListener("DOMContentLoaded", () => {
    // 1. Obtener elementos de la interfaz
    const btnLogin = document.getElementById("btnLogin");
    const btnVendedor = document.getElementById("btnVendedor");
    const divUsuario = document.getElementById("usuario-conectado");
    const bienvenida = document.getElementById("bienvenida");
    const btnLogout = document.getElementById("btnLogout");
    const btnCarrito = document.getElementById("btnCarrito");

    // 2. Revisar si hay una sesión guardada en LocalStorage
    const datosSesion = JSON.parse(localStorage.getItem('usuarioLogueado'));

    if (datosSesion) {
        // Interfaz para usuario logueado
        if (btnLogin) btnLogin.style.display = "none";
        if (btnVendedor) btnVendedor.style.display = "none";
        if (divUsuario) divUsuario.style.display = "block";
        if (bienvenida) bienvenida.innerText = `Hola, ${datosSesion.nombre}`;
    }

    // 3. Lógica para Cerrar Sesión
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            localStorage.removeItem('usuarioLogueado');
            window.location.reload(); // Recarga para actualizar la interfaz
        });
    }

    // 4. Lógica de protección del Carrito
    if (btnCarrito) {
        btnCarrito.addEventListener("click", (e) => {
            e.preventDefault();
            
            // Verificamos si la variable datosSesion tiene contenido
            if (localStorage.getItem('usuarioLogueado')) {
                window.location.href = "pago.html";
            } else {
                Toastify({
                    text: "Debes iniciar sesión para acceder al pago",
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    style: {
                        background: "linear-gradient(to right, #ff5f6d, #ffc371)",
                    },
                }).showToast();

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 2000);
            }
        });
    }
});