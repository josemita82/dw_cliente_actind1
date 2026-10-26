<?php
// Mi API de productos para la tienda AgoodShop.
// En vez de escribir el JSON a mano, creo un array de PHP
// y lo convierto a JSON con json_encode().

header('Content-Type: application/json; charset=utf-8');

$tienda = [
    'currency' => '€',
    'products' => [
        ['SKU' => '0K3QOSOV4V', 'title' => 'iFhone 13 Pro', 'price' => '938.99'],
        ['SKU' => 'TGD5XORY1L', 'title' => 'Cargador',      'price' => '49.99'],
        ['SKU' => 'IOKW9BQ9F3', 'title' => 'Funda de piel', 'price' => '79.99'],
    ],
];

// JSON_UNESCAPED_UNICODE para que el símbolo € salga bien y no como €
echo json_encode($tienda, JSON_UNESCAPED_UNICODE);
