<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

$host = 'localhost';
$usuario = 'root';
$contraseña = 'Mtz100802';
$nombre_base_datos = 'E-Commerce';

$conn = new mysqli($host, $usuario, $contraseña, $nombre_base_datos);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Error de conexión"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

$email = $data["email"];
$password = $data["password"];

$sql = "SELECT NombreU, ApellidoU FROM Usuario WHERE CorreoElectronicoU = ? AND PasswordU = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $email, $password);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    $stmt->bind_result($nombre, $apellido);
    $stmt->fetch();

    echo json_encode([
        "success" => true,
        "nombre" => "$nombre $apellido"
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Credenciales incorrectas"
    ]);
}

$stmt->close();
$conn->close();
?>
