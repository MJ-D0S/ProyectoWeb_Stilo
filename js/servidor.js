const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { iniciarSesion } = require('./loginController');

const app = express();
const PORT = 3000;

// Middleware para analizar JSON
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Ruta de login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Faltan campos' });
    }

    try {
        const result = await iniciarSesion(email, password);
        if (result.success) {
            res.cookie('usuario', result.user.id, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000
            });
            res.status(200).json({ message: 'Inicio de sesión exitoso' });
        } else {
            res.status(401).json({ error: result.message });
        }
    } catch (err) {
        console.error('❌ Error en /login:', err);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// Servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});
