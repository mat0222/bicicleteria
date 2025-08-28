<?php
header('Content-Type: application/json');
include 'config.php';

function respond($data){
    echo json_encode($data);
    exit;
}

// Leer JSON
$data = json_decode(file_get_contents('php://input'), true);
if(!$data) respond(['success'=>false,'error'=>'Datos inválidos']);

// Tablas y columnas
$tables = [
    'bicicletas'=>'bicicletas',
    'accesorios'=>'accesorios',
    'indumentarias'=>'indumentarias',
    'repuestos'=>'repuestos'
];

$columns = [
    'bicicletas'    => ['code'=>'codigo','name'=>'nombre','type'=>'categoria','price'=>'precio_contado','installmentPrice'=>'precio_plazo','stock'=>'stock','supplier'=>'id_proveedor'],
    'accesorios'    => ['code'=>'codigo','name'=>'nombre','type'=>'categoria','price'=>'precio_contado','installmentPrice'=>'precio_plazo','stock'=>'stock','supplier'=>'proveedor_id'],
    'indumentarias' => ['code'=>'codigo','name'=>'nombre','type'=>'categoria','price'=>'precio_contado','installmentPrice'=>'precio_plazo','stock'=>'stock','supplier'=>'proveedor_id'],
    'repuestos'     => ['code'=>'codigo','name'=>'nombre','type'=>'categoria','price'=>'precio_contado','installmentPrice'=>'precio_plazo','stock'=>'stock','supplier'=>'proveedor_id']
];

$category = $data['category'] ?? '';
if(!isset($tables[$category])) respond(['success'=>false,'error'=>'Categoría inválida']);

$table = $tables[$category];
$cols = $columns[$table];

// Valores seguros
$code = $data['code'] ?? '';
$name = $data['name'] ?? '';
$type = $data['type'] ?? '';
$priceCash = isset($data['price']) ? (float)$data['price'] : 0.0;
$priceInstallment = isset($data['installmentPrice']) ? (float)$data['installmentPrice'] : 0.0;
$stock = isset($data['stock']) ? (int)$data['stock'] : 0;
$supplier = isset($data['supplier']) ? (int)$data['supplier'] : 0;

// Preparar consulta
$stmt = $conn->prepare(
    "INSERT INTO $table ({$cols['code']}, {$cols['name']}, {$cols['type']}, {$cols['price']}, {$cols['installmentPrice']}, {$cols['stock']}, {$cols['supplier']})
    VALUES (?, ?, ?, ?, ?, ?, ?)"
);

if(!$stmt) respond(['success'=>false,'error'=>$conn->error]);

$stmt->bind_param(
    "sssddii",
    $code,
    $name,
    $type,
    $priceCash,
    $priceInstallment,
    $stock,
    $supplier
);

if($stmt->execute()){
    respond(['success'=>true]);
}else{
    respond(['success'=>false,'error'=>$stmt->error]);
}

$stmt->close();
$conn->close();

