document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registroForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value.trim();
        const apellido = document.getElementById('apellido').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        const user = { nombre, apellido, email, password };

        try {
            localStorage.setItem(email, JSON.stringify(user)); // Guardar el usuario en localStorage

            Toastify({
                text: "Registro exitoso. Redirigiendo...",
                duration: 2000,
                backgroundColor: "green"
            }).showToast();

            setTimeout(() => {
                window.location.href = 'login.html'; // Redirigir a la página de inicio de sesión
            }, 2000);
        } catch (error) {
            console.error('Error:', error);
            Toastify({
                text: 'No se pudo conectar al servidor.',
                duration: 3000,
                backgroundColor: "#ff5f5f"
            }).showToast();
        }
    });
});
