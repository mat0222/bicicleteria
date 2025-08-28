<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

include 'config.php';

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    echo json_encode(['success' => false, 'error' => 'Datos JSON no válidos o no recibidos']);
    exit;
}

// Validación
$code = trim($data['code'] ?? '');
$name = trim($data['name'] ?? '');
$supplier = intval($data['supplier'] ?? 0);
$category = strtolower(trim($data['category'] ?? ''));
$priceCash = floatval($data['price'] ?? 0);
$priceInstallment = floatval($data['installmentPrice'] ?? 0);
$stock = intval($data['stock'] ?? 0);

if (!$code || !$name || !$category) {
    echo json_encode(['success' => false, 'error' => 'Faltan datos obligatorios: code, name, category']);
    exit;
}

// Categorías permitidas
$categoryMap = [
    'bicicletas'    => ['table' => 'bicicletas',    'idField' => 'id_bicicleta',   'supplierField' => 'id_proveedor'],
    'repuestos'     => ['table' => 'repuestos',     'idField' => 'id_repuesto',    'supplierField' => 'proveedor_id'],
    'indumentarias' => ['table' => 'indumentarias','idField' => 'id_indumentaria','supplierField' => 'proveedor_id'],
    'accesorios'    => ['table' => 'accesorios',    'idField' => 'id_accesorio',   'supplierField' => 'proveedor_id']
];

if (!isset($categoryMap[$category])) {
    echo json_encode(['success' => false, 'error' => 'Categoría no válida', 'recibida' => $category]);
    exit;
}

$table = $categoryMap[$category]['table'];
$idField = $categoryMap[$category]['idField'];
$supplierField = $categoryMap[$category]['supplierField'];

try {
    $checkStmt = $conn->prepare("SELECT $idField FROM $table WHERE codigo = ?");
    $checkStmt->bind_param("s", $code);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'error' => 'Producto no encontrado con ese código']);
        $checkStmt->close();
        exit;
    }
    $checkStmt->close();

    $updateQuery = "UPDATE $table SET 
        nombre = ?, 
        $supplierField = ?, 
        precio_contado = ?, 
        precio_plazo = ?, 
        stock = ?";

    $columnsResult = $conn->query("SHOW COLUMNS FROM $table LIKE 'categoria'");
    $addCategory = $columnsResult && $columnsResult->num_rows > 0;
    if ($addCategory) $updateQuery .= ", categoria = ?";

    $updateQuery .= " WHERE codigo = ?";

    $stmt = $conn->prepare($updateQuery);
    if (!$stmt) throw new Exception("Error preparando consulta: " . $conn->error);

    if ($addCategory) {
        $stmt->bind_param("siddiss", $name, $supplier, $priceCash, $priceInstallment, $stock, $category, $code);
    } else {
        $stmt->bind_param("siddis", $name, $supplier, $priceCash, $priceInstallment, $stock, $code);
    }

    $stmt->execute();

    echo json_encode([
        'success' => true,
        'message' => 'Producto actualizado correctamente',
        'product' => [
            'code' => $code,
            'name' => $name,
            'supplier' => $supplier,
            'price' => $priceCash,
            'installmentPrice' => $priceInstallment,
            'stock' => $stock,
            'category' => $category
        ]
    ]);

    $stmt->close();

} catch (Exception $e) {
    error_log("Error en editar_productos.php: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Error interno del servidor', 'details' => $e->getMessage()]);
} finally {
    if (isset($conn)) $conn->close();
}
?>



