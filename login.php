<?php
session_start();
header('Content-Type: application/json'); // Para respuesta JSON
include 'config.php'; // Usamos tu conexión

// Recibir datos POST
$data = json_decode(file_get_contents("php://input"), true);
$usuario = $data['username'] ?? '';
$password = $data['password'] ?? '';

if ($usuario && $password) {
    $stmt = $conn->prepare("SELECT password FROM usuarios WHERE usuario = ?");
    $stmt->bind_param("s", $usuario);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $stmt->bind_result($hash);
        $stmt->fetch();
        if (password_verify($password, $hash)) {
            $_SESSION['usuario'] = $usuario;
            echo json_encode(['success' => true, 'usuario' => $usuario]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Contraseña incorrecta']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
    }
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Complete todos los campos']);
}

$conn->close();
?>
