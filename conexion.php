<?php
// Parámetros de conexión
$host = 'localhost'; // Cambia esto si tu servidor de base de datos está en otra ubicación
$usuario = 'root'; // Reemplaza con tu usuario de base de datos
$contraseña = 'Mtz100802'; // Reemplaza con tu contraseña de base de datos
$nombre_base_datos = 'E-Commerce'; // Reemplaza con el nombre de tu base de datos

// Crear conexión
$conn = new mysqli($host, $usuario, $contraseña, $nombre_base_datos);

// Comprobar la conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
} else {
    echo "Conectado exitosamente a la base de datos '$nombre_base_datos'<br>";
}

// Consulta para obtener todos los usuarios
$sql = "SELECT UId, NombreU, ApellidoU, CorreoElectronicoU FROM Usuario";
$result = $conn->query($sql);

// Verificar si hay resultados
if ($result->num_rows > 0) {
    // Salida de datos de cada fila
    echo "<h2>Lista de Usuarios:</h2>";
    echo "<table border='1'>";
    echo "<tr><th>ID</th><th>Nombre</th><th>Apellido</th><th>Correo Electrónico</th></tr>";
    while ($row = $result->fetch_assoc()) {
        echo "<tr><td>" . $row["UId"] . "</td><td>" . $row["NombreU"] . "</td><td>" . $row["ApellidoU"] . "</td><td>" . $row["CorreoElectronicoU"] . "</td></tr>";
    }
    echo "</table>";
} else {
    echo "No se encontraron usuarios.";
}

// Cerrar la conexión
$conn->close();
?>

