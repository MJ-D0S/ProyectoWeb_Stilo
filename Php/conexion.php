<?php
$host = 'localhost'; 
$usuario = 'root'; 
$contraseña = 'Mtz100802'; 
$nombre_base_datos = 'E-Commerce';
$conn = new mysqli($host, $usuario, $contraseña, $nombre_base_datos);
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
} else {
    echo "Conectado exitosamente a la base de datos '$nombre_base_datos'<br>";
}


$sql = "SELECT UId, NombreU, ApellidoU, CorreoElectronicoU FROM Usuario";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
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


$conn->close();
?>

