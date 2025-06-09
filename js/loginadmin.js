document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      // Usuarios predefinidos
      const predefinedUsers = {
        'carlramtie@gmail.com': 'HJ41FH23',
        'lauratomodow@gmail.com': 'KLD4223'
      };

      // Verificar si el usuario está en los usuarios predefinidos
      if (predefinedUsers[email] === password) {
        // Redirigir a admin2.html si el inicio de sesión es exitoso
        window.location.href = 'admin2.html';
      } else {
        // Obtener el usuario del localStorage
        const user = JSON.parse(localStorage.getItem(email));

        // Validar si el usuario registrado en localStorage tiene la contraseña correcta
        if (user && user.password === password) {
          // Redirigir a admin2.html si el inicio de sesión es exitoso
          window.location.href = 'admin2.html';
        } else {
          Toastify({
            text: 'Correo electrónico o contraseña incorrectos',
            duration: 3000,
            gravity: 'top',
            position: 'right',
            backgroundColor: '#ff5f5f'
          }).showToast();
        }
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      Toastify({
        text: 'Error al conectar con el servidor.',
        duration: 3000,
        gravity: 'top',
        position: 'right',
        backgroundColor: '#ff5f5f'
      }).showToast();
    }
  });
});
