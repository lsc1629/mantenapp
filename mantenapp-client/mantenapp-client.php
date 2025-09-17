<?php
/**
 * Plugin Name: MantenApp Cliente
 * Description: Plugin cliente para MantenApp - Versión Ultra Simple
 * Version: 1.0.3
 * Author: MantenApp Team
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 */

// Prevenir acceso directo
if (!defined('ABSPATH')) {
    exit;
}

// Verificar PHP
if (version_compare(PHP_VERSION, '7.4', '<')) {
    return;
}

// Constantes básicas
define('MANTENAPP_VERSION', '1.0.3');

/**
 * Función principal de inicialización
 */
function mantenapp_init() {
    add_action('admin_menu', 'mantenapp_add_menu');
    add_action('wp_ajax_mantenapp_save', 'mantenapp_save_settings');
    add_action('wp_ajax_mantenapp_test', 'mantenapp_test_connection');
    add_action('wp_ajax_mantenapp_sync', 'mantenapp_manual_sync');
}

/**
 * Agregar menú de administración
 */
function mantenapp_add_menu() {
    add_menu_page(
        'MantenApp',
        'MantenApp',
        'manage_options',
        'mantenapp',
        'mantenapp_admin_page',
        'dashicons-shield-alt'
    );
}

/**
 * Página de administración
 */
function mantenapp_admin_page() {
    $settings = get_option('mantenapp_settings', array());
    $api_key = isset($settings['api_key']) ? $settings['api_key'] : '';
    $is_dev = mantenapp_is_development();
    $is_staging = mantenapp_is_staging();
    
    if ($is_dev) {
        $server_url = 'http://localhost:3001/api/v1';
        $environment = 'development';
    } elseif ($is_staging) {
        $server_url = 'https://staging-api.mantenapp.com/api/v1';
        $environment = 'staging';
    } else {
        $server_url = 'https://api.mantenapp.com/api/v1';
        $environment = 'production';
    }
    ?>
    <style>
    .mantenapp-admin-wrap { 
        background: #f0f0f1; 
        margin: 0 0 0 -20px; 
        padding: 0; 
        min-height: 100vh; 
    }
    .mantenapp-header { 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
        color: white; 
        padding: 2rem; 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
    }
    .mantenapp-logo { 
        display: flex; 
        align-items: center; 
        gap: 1rem; 
    }
    .mantenapp-icon { 
        width: 60px; 
        height: 60px; 
        background: rgba(255, 255, 255, 0.2); 
        border-radius: 12px; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        font-size: 24px; 
        font-weight: bold; 
    }
    .mantenapp-title h1 { 
        margin: 0; 
        font-size: 28px; 
        font-weight: 700; 
    }
    .mantenapp-title p { 
        margin: 4px 0 0 0; 
        opacity: 0.9; 
        font-size: 16px; 
    }
    .mantenapp-status { 
        display: flex; 
        align-items: center; 
        gap: 1rem; 
    }
    .environment-badge { 
        padding: 6px 12px; 
        border-radius: 15px; 
        font-size: 12px; 
        font-weight: 600; 
    }
    .environment-development { 
        background: #fbbf24; 
        color: #92400e; 
    }
    .environment-staging { 
        background: #60a5fa; 
        color: #1e40af; 
    }
    .environment-production { 
        background: #34d399; 
        color: #065f46; 
    }
    .status-indicator { 
        display: flex; 
        align-items: center; 
        gap: 8px; 
        padding: 8px 16px; 
        background: rgba(255, 255, 255, 0.1); 
        border-radius: 20px; 
    }
    .status-dot { 
        width: 10px; 
        height: 10px; 
        border-radius: 50%; 
        background: #ef4444; 
    }
    .status-indicator.connected .status-dot { 
        background: #22c55e; 
    }
    .mantenapp-content { 
        padding: 2rem; 
        max-width: 1200px; 
        margin: 0 auto; 
    }
    .mantenapp-card { 
        background: white; 
        border-radius: 12px; 
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); 
        margin-bottom: 2rem; 
        overflow: hidden; 
        border: 1px solid #e5e7eb; 
    }
    .card-header { 
        padding: 1.5rem 2rem; 
        border-bottom: 1px solid #e5e7eb; 
        background: #fafafa; 
    }
    .card-header h2 { 
        margin: 0 0 0.5rem 0; 
        font-size: 20px; 
        font-weight: 600; 
        color: #111827; 
    }
    .card-header p { 
        margin: 0; 
        color: #6b7280; 
        font-size: 14px; 
    }
    .card-body { 
        padding: 2rem; 
    }
    .form-group { 
        margin-bottom: 1.5rem; 
    }
    .form-group label { 
        display: block; 
        margin-bottom: 0.5rem; 
        font-weight: 600; 
        color: #374151; 
        font-size: 14px; 
    }
    .form-control { 
        width: 100%; 
        max-width: 400px;
        padding: 12px 16px; 
        border: 2px solid #e5e7eb; 
        border-radius: 8px; 
        font-size: 14px; 
    }
    .form-control:focus { 
        outline: none; 
        border-color: #667eea; 
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); 
    }
    .btn { 
        padding: 12px 24px; 
        border: none; 
        border-radius: 8px; 
        font-size: 14px; 
        font-weight: 600; 
        cursor: pointer; 
        margin-right: 10px;
    }
    .btn-primary { 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
        color: white; 
    }
    .btn-secondary { 
        background: #f3f4f6; 
        color: #374151; 
        border: 1px solid #d1d5db; 
    }
    .result-area { 
        margin-top: 1rem; 
        min-height: 20px; 
    }
    .result-success { 
        padding: 12px 16px; 
        background: #dcfce7; 
        border: 1px solid #bbf7d0; 
        border-radius: 8px; 
        color: #166534; 
    }
    .result-error { 
        padding: 12px 16px; 
        background: #fee2e2; 
        border: 1px solid #fecaca; 
        border-radius: 8px; 
        color: #991b1b; 
    }
    </style>
    
    <div class="mantenapp-admin-wrap">
        <div class="mantenapp-header">
            <div class="mantenapp-logo">
                <div class="mantenapp-icon">M</div>
                <div class="mantenapp-title">
                    <h1>MantenApp Cliente</h1>
                    <p>Conecta tu sitio WordPress al sistema de mantenimiento</p>
                </div>
            </div>
            <div class="mantenapp-status">
                <div class="environment-badge environment-<?php echo $environment; ?>">
                    <?php 
                    switch($environment) {
                        case 'development':
                            echo '🔧 Desarrollo';
                            break;
                        case 'staging':
                            echo '🧪 Staging';
                            break;
                        default:
                            echo '🚀 Producción';
                    }
                    ?>
                </div>
                <div class="status-indicator <?php echo !empty($api_key) ? 'connected' : 'disconnected'; ?>">
                    <span class="status-dot"></span>
                    <span class="status-text">
                        <?php echo !empty($api_key) ? 'Configurado' : 'Sin configurar'; ?>
                    </span>
                </div>
            </div>
        </div>

        <div class="mantenapp-content">
            <div class="mantenapp-card">
                <div class="card-header">
                    <h2>🔑 Configuración de Conexión</h2>
                    <p>
                        <?php if ($is_dev): ?>
                            🔧 <strong>Modo Desarrollo:</strong> Configuración automática para localhost:3001
                        <?php else: ?>
                            Configura la API Key para conectar tu sitio con MantenApp
                        <?php endif; ?>
                    </p>
                </div>
                
                <div class="card-body">
                    <form id="mantenapp-form">
                        <div class="form-group">
                            <label for="api_key">API Key *</label>
                            <input type="password" 
                                   id="api_key" 
                                   name="api_key" 
                                   value="<?php echo esc_attr($api_key); ?>" 
                                   class="form-control" 
                                   placeholder="Pega aquí tu API Key de MantenApp" />
                            <small>Obtén tu API Key desde el panel de administración de MantenApp</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="server_url">URL del Servidor <?php echo $is_dev ? '(Auto-detectada)' : ''; ?></label>
                            <input type="url" 
                                   id="server_url" 
                                   name="server_url" 
                                   value="<?php echo esc_attr($server_url); ?>" 
                                   class="form-control" 
                                   <?php echo $is_dev ? 'readonly' : ''; ?> />
                            <small>
                                <?php echo $is_dev ? '🔧 <strong>Desarrollo:</strong> Conectando automáticamente a localhost:3001' : 'URL del servidor MantenApp'; ?>
                            </small>
                        </div>
                        
                        <div style="margin-top: 2rem;">
                            <button type="submit" class="btn btn-primary">💾 Guardar Configuración</button>
                            <button type="button" id="test-btn" class="btn btn-secondary">🔗 Probar Conexión</button>
                            <button type="button" id="sync-btn" class="btn btn-primary">🔄 Sincronizar Ahora</button>
                        </div>
                    </form>
                    
                    <div id="result" class="result-area"></div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
    jQuery(document).ready(function($) {
        // Guardar configuración
        $('#mantenapp-form').on('submit', function(e) {
            e.preventDefault();
            $.post(ajaxurl, {
                action: 'mantenapp_save',
                api_key: $('#api_key').val(),
                server_url: $('#server_url').val(),
                nonce: '<?php echo wp_create_nonce('mantenapp_nonce'); ?>'
            }, function(response) {
                if (response.success) {
                    $('#result').html('<div class="result-success">✅ ' + response.data + '</div>');
                } else {
                    $('#result').html('<div class="result-error">❌ ' + response.data + '</div>');
                }
            });
        });
        
        // Probar conexión
        $('#test-btn').on('click', function() {
            var btn = $(this);
            btn.prop('disabled', true).text('Probando...');
            
            $.post(ajaxurl, {
                action: 'mantenapp_test',
                api_key: $('#api_key').val(),
                server_url: $('#server_url').val(),
                nonce: '<?php echo wp_create_nonce('mantenapp_nonce'); ?>'
            }, function(response) {
                if (response.success) {
                    $('#result').html('<div class="result-success">✅ ' + response.data + '</div>');
                } else {
                    $('#result').html('<div class="result-error">❌ ' + response.data + '</div>');
                }
            }).always(function() {
                btn.prop('disabled', false).text('🔗 Probar Conexión');
            });
        });
        
        // Sincronizar
        $('#sync-btn').on('click', function() {
            var btn = $(this);
            btn.prop('disabled', true).text('Sincronizando...');
            
            $.post(ajaxurl, {
                action: 'mantenapp_sync',
                api_key: $('#api_key').val(),
                server_url: $('#server_url').val(),
                nonce: '<?php echo wp_create_nonce('mantenapp_nonce'); ?>'
            }, function(response) {
                if (response.success) {
                    $('#result').html('<div class="result-success">✅ ' + response.data + '</div>');
                } else {
                    $('#result').html('<div class="result-error">❌ ' + response.data + '</div>');
                }
            }).always(function() {
                btn.prop('disabled', false).text('🔄 Sincronizar Ahora');
            });
        });
    });
    </script>
    <?php
}

/**
 * Guardar configuración
 */
function mantenapp_save_settings() {
    if (!wp_verify_nonce($_POST['nonce'], 'mantenapp_nonce')) {
        wp_send_json_error('Error de seguridad');
    }
    
    if (!current_user_can('manage_options')) {
        wp_send_json_error('Sin permisos');
    }
    
    $settings = array(
        'api_key' => sanitize_text_field($_POST['api_key']),
        'server_url' => esc_url_raw($_POST['server_url'])
    );
    
    update_option('mantenapp_settings', $settings);
    wp_send_json_success('Configuración guardada correctamente');
}

/**
 * Probar conexión
 */
function mantenapp_test_connection() {
    if (!wp_verify_nonce($_POST['nonce'], 'mantenapp_nonce')) {
        wp_send_json_error('Error de seguridad');
    }
    
    $api_key = sanitize_text_field($_POST['api_key']);
    $server_url = esc_url_raw($_POST['server_url']);
    
    if (empty($api_key)) {
        wp_send_json_error('API Key requerida');
    }
    
    $response = wp_remote_get($server_url . '/sync/test', array(
        'headers' => array(
            'Authorization' => 'Bearer ' . $api_key,
            'Content-Type' => 'application/json'
        ),
        'timeout' => 30
    ));
    
    if (is_wp_error($response)) {
        wp_send_json_error('Error de conexión: ' . $response->get_error_message());
    }
    
    $code = wp_remote_retrieve_response_code($response);
    
    if ($code === 200) {
        wp_send_json_success('Conexión exitosa con MantenApp');
    } else if ($code === 401) {
        wp_send_json_error('API Key inválida');
    } else {
        wp_send_json_error('Error del servidor: ' . $code);
    }
}

/**
 * Sincronización manual
 */
function mantenapp_manual_sync() {
    if (!wp_verify_nonce($_POST['nonce'], 'mantenapp_nonce')) {
        wp_send_json_error('Error de seguridad');
    }
    
    $api_key = sanitize_text_field($_POST['api_key']);
    $server_url = esc_url_raw($_POST['server_url']);
    
    if (empty($api_key)) {
        wp_send_json_error('API Key requerida');
    }
    
    // Datos básicos del sitio
    $data = array(
        'site_info' => array(
            'name' => get_bloginfo('name'),
            'url' => get_site_url(),
            'admin_email' => get_option('admin_email')
        ),
        'core' => array(
            'wp_version' => get_bloginfo('version'),
            'php_version' => PHP_VERSION,
            'theme_name' => wp_get_theme()->get('Name')
        ),
        'timestamp' => current_time('timestamp')
    );
    
    $response = wp_remote_post($server_url . '/sync', array(
        'headers' => array(
            'Authorization' => 'Bearer ' . $api_key,
            'Content-Type' => 'application/json'
        ),
        'body' => json_encode($data),
        'timeout' => 60
    ));
    
    if (is_wp_error($response)) {
        wp_send_json_error('Error de conexión: ' . $response->get_error_message());
    }
    
    $code = wp_remote_retrieve_response_code($response);
    
    if ($code === 200) {
        wp_send_json_success('Sincronización completada exitosamente');
    } else if ($code === 401) {
        wp_send_json_error('API Key inválida');
    } else {
        wp_send_json_error('Error del servidor: ' . $code);
    }
}

/**
 * Detectar si estamos en desarrollo
 */
function mantenapp_is_development() {
    $host = $_SERVER['HTTP_HOST'] ?? '';
    return (
        strpos($host, 'localhost') !== false ||
        strpos($host, '127.0.0.1') !== false ||
        strpos($host, '.local') !== false ||
        strpos($host, '.test') !== false ||
        (defined('WP_DEBUG') && WP_DEBUG === true) ||
        (defined('WP_ENVIRONMENT_TYPE') && WP_ENVIRONMENT_TYPE === 'development')
    );
}

/**
 * Detectar si estamos en staging
 */
function mantenapp_is_staging() {
    $host = $_SERVER['HTTP_HOST'] ?? '';
    return (
        strpos($host, 'staging') !== false ||
        strpos($host, 'dev.') !== false ||
        (defined('WP_ENVIRONMENT_TYPE') && WP_ENVIRONMENT_TYPE === 'staging')
    );
}

/**
 * Activación del plugin
 */
function mantenapp_activate() {
    // Crear configuración por defecto
    if (!get_option('mantenapp_settings')) {
        $is_dev = mantenapp_is_development();
        $is_staging = mantenapp_is_staging();
        
        if ($is_dev) {
            $default_url = 'http://localhost:3001/api/v1';
        } elseif ($is_staging) {
            $default_url = 'https://staging-api.mantenapp.com/api/v1';
        } else {
            $default_url = 'https://api.mantenapp.com/api/v1';
        }
        
        add_option('mantenapp_settings', array(
            'api_key' => '',
            'server_url' => $default_url
        ));
    }
}

// Hooks principales
add_action('init', 'mantenapp_init');
register_activation_hook(__FILE__, 'mantenapp_activate');
?>
