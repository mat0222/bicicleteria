<?php
$host = "localhost";   // Servidor
$user = "root";        // Usuario de MySQL (por defecto root en XAMPP)
$pass = "";            // Contraseña (vacía si no la cambiaste)
$db   = "fobibike_db"; // Nombre de tu base de datos

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}
?>
