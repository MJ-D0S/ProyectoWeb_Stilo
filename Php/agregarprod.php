<?php
// Configuración de conexión
$host = 'localhost'; 
$usuario = 'root'; 
$contraseña = 'Mtz100802'; 
$nombre_base_datos = 'E-Commerce';

$conn = new mysqli($host, $usuario, $contraseña, $nombre_base_datos);

if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $nombre = $_POST['nombre_p'];
    $precio = $_POST['precio'];
    $catID  = $_POST['categoria_id'];
    $vendedorID = $_POST['vendedor_id'] ?? 1; // Recibido desde el JS

    // Lógica de subcarpetas según la categoría seleccionada
    $subcarpeta = "";
    switch($catID) {
        case "1": $subcarpeta = "Abrigos/"; break;
        case "2": $subcarpeta = "Camisetas/"; break;
        case "3": $subcarpeta = "Pantalones/"; break;
        default: $subcarpeta = ""; break;
    }

    // Definir ruta: C:\Users\...\img\Subcarpeta\archivo
    $directorio_destino = "img/" . $subcarpeta;
    $nombre_archivo = time() . "_" . basename($_FILES["imagen"]["name"]);
    $ruta_final = $directorio_destino . $nombre_archivo;

    // Mover el archivo temporal a la carpeta física
    if (move_uploaded_file($_FILES["imagen"]["tmp_name"], $ruta_final)) {
        
        // Insertar en la tabla Productos
        $sql = "INSERT INTO Productos (NombreP, CategoriaID, Precio, ImagenURL, VendedorID, EstaActivo) VALUES (?, ?, ?, ?, ?, 1)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sidsi", $nombre, $catID, $precio, $ruta_final, $vendedorID);

        if ($stmt->execute()) {
            echo "<script>
                alert('✅ Producto agregado con éxito en la carpeta $subcarpeta');
                window.location.href='admin.php'; 
            </script>";
        } else {
            echo "Error al guardar en BD: " . $stmt->error;
        }
        $stmt->close();
    } else {
        echo "❌ Error crítico: No se pudo subir la imagen. Verifica que la carpeta 'img/$subcarpeta' tenga permisos de escritura.";
    }
}
$conn->close();
?>