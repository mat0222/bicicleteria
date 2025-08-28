<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
include 'config.php';

$products = [];

$tables = [
    'bicicletas'    => ['category' => 'bicicletas', 'code' => 'codigo', 'name' => 'nombre', 'type' => 'categoria', 'price' => 'precio_contado', 'installmentPrice' => 'precio_plazo', 'stock' => 'stock', 'supplier' => 'id_proveedor'],
    'accesorios'    => ['category' => 'accesorios', 'code' => 'codigo', 'name' => 'nombre', 'type' => 'categoria', 'price' => 'precio_contado', 'installmentPrice' => 'precio_plazo', 'stock' => 'stock', 'supplier' => 'proveedor_id'],
    'indumentarias'  => ['category' => 'indumentarias', 'code' => 'codigo', 'name' => 'nombre', 'type' => 'categoria', 'price' => 'precio_contado', 'installmentPrice' => 'precio_plazo', 'stock' => 'stock', 'supplier' => 'proveedor_id'],
    'repuestos'     => ['category' => 'repuestos', 'code' => 'codigo', 'name' => 'nombre', 'type' => 'categoria', 'price' => 'precio_contado', 'installmentPrice' => 'precio_plazo', 'stock' => 'stock', 'supplier' => 'proveedor_id']
];

$products = [];

foreach ($tables as $table => $cols) {
    $sql = "SELECT 
                   {$cols['code']} AS code,
                   {$cols['name']} AS name,
                   {$cols['type']} AS type,
                   {$cols['price']} AS price,
                   {$cols['installmentPrice']} AS installmentPrice,
                   {$cols['stock']} AS stock,
                   {$cols['supplier']} AS supplier
            FROM $table";
    $result = $conn->query($sql);

    if ($result) {
        while($row = $result->fetch_assoc()) {
            $row['category'] = $cols['category'];
            $products[] = $row;
        }
    } else {
        $products[] = ['error' => "Error en consulta $table: " . $conn->error];
    }
}

echo json_encode($products, JSON_UNESCAPED_UNICODE | JSON_NUMERIC_CHECK);
$conn->close();

?>
