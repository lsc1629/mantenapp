<?php
/**
 * Diagnóstico del Plugin MantenApp Cliente
 * Ejecutar este archivo para verificar que todo esté funcionando
 */

// Verificar versión de PHP
echo "=== DIAGNÓSTICO MANTENAPP CLIENTE ===\n\n";

echo "1. Versión de PHP: " . PHP_VERSION . "\n";
if (version_compare(PHP_VERSION, '7.4', '>=')) {
    echo "   ✅ PHP versión compatible\n";
} else {
    echo "   ❌ PHP versión incompatible (requiere 7.4+)\n";
}

echo "\n2. Archivos del plugin:\n";
$files = [
    'mantenapp-client.php' => 'Archivo principal del plugin',
    'assets/admin.css' => 'Estilos del admin',
    'assets/admin.js' => 'JavaScript del admin',
    'README.md' => 'Documentación'
];

foreach ($files as $file => $description) {
    if (file_exists($file)) {
        echo "   ✅ $file - $description\n";
    } else {
        echo "   ⚠️  $file - $description (opcional)\n";
    }
}

echo "\n3. Verificación de sintaxis PHP:\n";
$output = [];
$return_var = 0;
exec('php -l mantenapp-client.php 2>&1', $output, $return_var);

if ($return_var === 0) {
    echo "   ✅ Sintaxis PHP correcta\n";
} else {
    echo "   ❌ Error de sintaxis PHP:\n";
    foreach ($output as $line) {
        echo "      $line\n";
    }
}

echo "\n4. Verificación de clases y funciones:\n";
include_once 'mantenapp-client.php';

if (class_exists('MantenAppClient')) {
    echo "   ✅ Clase MantenAppClient existe\n";
    
    $methods = [
        'get_instance',
        'init',
        'admin_page',
        'save_settings',
        'test_connection',
        'manual_sync'
    ];
    
    foreach ($methods as $method) {
        if (method_exists('MantenAppClient', $method)) {
            echo "   ✅ Método $method existe\n";
        } else {
            echo "   ❌ Método $method falta\n";
        }
    }
} else {
    echo "   ❌ Clase MantenAppClient no existe\n";
}

echo "\n5. Verificación de constantes:\n";
$constants = [
    'MANTENAPP_CLIENT_VERSION',
    'MANTENAPP_CLIENT_PLUGIN_URL',
    'MANTENAPP_CLIENT_PLUGIN_PATH',
    'MANTENAPP_CLIENT_PLUGIN_FILE'
];

foreach ($constants as $constant) {
    if (defined($constant)) {
        echo "   ✅ $constant definida\n";
    } else {
        echo "   ❌ $constant no definida\n";
    }
}

echo "\n=== RESULTADO ===\n";
echo "Si todos los elementos muestran ✅, el plugin debería funcionar correctamente.\n";
echo "Si hay ❌, revisa los errores antes de instalar en WordPress.\n\n";

echo "Para instalar:\n";
echo "1. Comprime esta carpeta en un ZIP\n";
echo "2. Ve a WordPress Admin > Plugins > Añadir nuevo > Subir plugin\n";
echo "3. Sube el ZIP y activa el plugin\n";
echo "4. Ve a MantenApp en el menú lateral\n\n";
?>
