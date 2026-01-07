<?php
$host = 'localhost'; 
$usuario = 'root'; 
$contraseña = 'Mtz100802'; 
$nombre_base_datos = 'E-Commerce';

$conn = new mysqli($host, $usuario, $contraseña, $nombre_base_datos);

if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // El PID viene del select del formulario de eliminación
    $pid = $_POST['pid'];

    if (!empty($pid)) {
        // Opción A: Borrado Lógico (Recomendado)
        $sql = "UPDATE Productos SET EstaActivo = 0 WHERE PID = ?";
        
        // Opción B: Si prefieres borrarlo definitivamente de la tabla, usa:
        // $sql = "DELETE FROM Productos WHERE PID = ?";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $pid);

        if ($stmt->execute()) {
            echo "<script>
                alert('✅ Producto eliminado correctamente.');
                window.location.href='admin.php';
            </script>";
        } else {
            echo "Error al eliminar: " . $stmt->error;
        }
        $stmt->close();
    } else {
        echo "No se seleccionó ningún producto.";
    }
}
$conn->close();
?>