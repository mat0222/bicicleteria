<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
include 'config.php';

// Leer JSON enviado
$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!$data || empty($data['code']) || empty($data['category'])) {
    echo json_encode(['success' => false, 'error' => 'Faltan datos (code o category)', 'raw' => $data]);
    exit;
}

$code = $conn->real_escape_string($data['code']);
$category = $conn->real_escape_string($data['category']);

// Mapear tablas
$tables = [
    'bicicletas'    => 'bicicletas',
    'accesorios'    => 'accesorios',
    'indumentarias' => 'indumentarias',
    'repuestos'     => 'repuestos'
];

if (!isset($tables[$category])) {
    echo json_encode(['success' => false, 'error' => 'Categoría inválida']);
    exit;
}

$table = $tables[$category];

// Ejecutar DELETE por código
$sql = "DELETE FROM $table WHERE codigo = '$code'";

if ($conn->query($sql) === TRUE) {
    echo json_encode(['success' => true, 'message' => "Producto con código $code eliminado"]);
} else {
    echo json_encode(['success' => false, 'error' => $conn->error, 'query' => $sql]);
}

$conn->close();
?>


