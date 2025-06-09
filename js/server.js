const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ✅ Conexión con usuario root y contraseña proporcionada
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Mtz100802',
  database: 'E_Commerce'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Error de conexión:', err);
    return;
  }
  console.log('✅ Conectado a MySQL (E_Commerce)');
});

// Ruta para registrar usuario
app.post('/api/registro', (req, res) => {
  const { nombre, apellido, email, password } = req.body;

  const sql = `INSERT INTO Usuario (MetodoPagoID, DireccionID, NombreU, ApellidoU, CorreoElectronicoU, ContraseniaU, Telefono)
               VALUES (1, 1, ?, ?, ?, ?, '0000000000')`;

  db.query(sql, [nombre, apellido, email, password], (err, result) => {
    if (err) {
      console.error('❌ Error en el INSERT:', err);
      return res.status(500).json({ success: false, message: 'Error al registrar usuario.' });
    }

    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
