<?php
// Prevenir acceso directo
if (!defined('ABSPATH')) {
    exit;
}

// Procesar formulario
if (isset($_POST['submit'])) {
    if (!wp_verify_nonce($_POST['mantenapp_nonce'], 'mantenapp_client_settings')) {
        wp_die(__('Error de seguridad', 'mantenapp-client'));
    }
    
    $settings = array(
        'api_key' => sanitize_text_field($_POST['api_key']),
        'admin_url' => esc_url_raw($_POST['admin_url']),
        'auto_sync' => isset($_POST['auto_sync']),
        'sync_interval' => intval($_POST['sync_interval'])
    );
    
    update_option('mantenapp_client_settings', array_merge(get_option('mantenapp_client_settings'), $settings));
    
    echo '<div class="notice notice-success is-dismissible"><p>' . __('Configuración guardada correctamente', 'mantenapp-client') . '</p></div>';
}

$settings = get_option('mantenapp_client_settings');
$last_sync = $settings['last_sync'] ? date_i18n(get_option('date_format') . ' ' . get_option('time_format'), $settings['last_sync']) : __('Nunca', 'mantenapp-client');
?>

<div class="wrap mantenapp-client-admin">
    <div class="mantenapp-header">
        <div class="mantenapp-logo">
            <h1>
                <span class="mantenapp-icon">🔧</span>
                <?php _e('MantenApp Cliente', 'mantenapp-client'); ?>
            </h1>
            <p class="mantenapp-subtitle"><?php _e('Conecta tu sitio con la plataforma de mantenimiento', 'mantenapp-client'); ?></p>
        </div>
        <div class="mantenapp-status">
            <div class="status-card">
                <h3><?php _e('Estado de Conexión', 'mantenapp-client'); ?></h3>
                <div class="connection-status <?php echo !empty($settings['api_key']) && !empty($settings['admin_url']) ? 'connected' : 'disconnected'; ?>">
                    <span class="status-indicator"></span>
                    <span class="status-text">
                        <?php echo !empty($settings['api_key']) && !empty($settings['admin_url']) ? __('Conectado', 'mantenapp-client') : __('Desconectado', 'mantenapp-client'); ?>
                    </span>
                </div>
                <p class="last-sync"><?php printf(__('Última sincronización: %s', 'mantenapp-client'), $last_sync); ?></p>
            </div>
        </div>
    </div>

    <div class="mantenapp-content">
        <div class="mantenapp-main">
            <div class="card">
                <h2><?php _e('Configuración de Conexión', 'mantenapp-client'); ?></h2>
                
                <form method="post" action="" class="mantenapp-form">
                    <?php wp_nonce_field('mantenapp_client_settings', 'mantenapp_nonce'); ?>
                    
                    <div class="form-group">
                        <label for="admin_url"><?php _e('URL del Servidor Admin:', 'mantenapp-client'); ?></label>
                        <input type="url" id="admin_url" name="admin_url" value="<?php echo esc_attr($settings['admin_url']); ?>" class="regular-text" required>
                        <p class="description"><?php _e('URL de la aplicación web MantenApp (ej: https://admin.mantenapp.com/api/v1)', 'mantenapp-client'); ?></p>
                    </div>
                    
                    <div class="form-group">
                        <label for="api_key">
                            <strong><?php _e('Clave API', 'mantenapp-client'); ?></strong>
                            <span class="description"><?php _e('Clave de autenticación proporcionada por el administrador', 'mantenapp-client'); ?></span>
                        </label>
                        <input 
                            type="password" 
                            id="api_key" 
                            name="api_key" 
                            value="<?php echo esc_attr($settings['api_key']); ?>" 
                            placeholder="<?php _e('Ingresa tu clave API', 'mantenapp-client'); ?>"
                            class="regular-text"
                        />
                        <button type="button" class="button button-secondary toggle-password" data-target="api_key">
                            <span class="dashicons dashicons-visibility"></span>
                        </button>
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input 
                                type="checkbox" 
                                name="auto_sync" 
                                value="1" 
                                <?php checked($settings['auto_sync']); ?>
                            />
                            <strong><?php _e('Sincronización Automática', 'mantenapp-client'); ?></strong>
                        </label>
                        <p class="description"><?php _e('Enviar datos automáticamente según el intervalo configurado', 'mantenapp-client'); ?></p>
                    </div>
                    
                    <div class="form-group sync-interval" <?php echo !$settings['auto_sync'] ? 'style="display:none;"' : ''; ?>>
                        <label for="sync_interval">
                            <strong><?php _e('Intervalo de Sincronización', 'mantenapp-client'); ?></strong>
                        </label>
                        <select id="sync_interval" name="sync_interval">
                            <option value="1" <?php selected($settings['sync_interval'], 1); ?>><?php _e('Cada hora', 'mantenapp-client'); ?></option>
                            <option value="6" <?php selected($settings['sync_interval'], 6); ?>><?php _e('Cada 6 horas', 'mantenapp-client'); ?></option>
                            <option value="12" <?php selected($settings['sync_interval'], 12); ?>><?php _e('Cada 12 horas', 'mantenapp-client'); ?></option>
                            <option value="24" <?php selected($settings['sync_interval'], 24); ?>><?php _e('Diariamente', 'mantenapp-client'); ?></option>
                            <option value="168" <?php selected($settings['sync_interval'], 168); ?>><?php _e('Semanalmente', 'mantenapp-client'); ?></option>
                        </select>
                    </div>
                    
                    <div class="form-actions">
                        <?php submit_button(__('Guardar Configuración', 'mantenapp-client'), 'primary', 'submit', false); ?>
                        <button type="button" id="test-connection" class="button button-secondary">
                            <span class="dashicons dashicons-admin-links"></span>
                            <?php _e('Probar Conexión', 'mantenapp-client'); ?>
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <div class="mantenapp-sidebar">
            <div class="card">
                <h3><?php _e('Acciones Rápidas', 'mantenapp-client'); ?></h3>
                <div class="quick-actions">
                    <button id="collect-data" class="button button-large">
                        <span class="dashicons dashicons-database-view"></span>
                        <?php _e('Recopilar Datos', 'mantenapp-client'); ?>
                    </button>
                    
                    <button id="send-data" class="button button-large button-primary" <?php echo empty($settings['api_key']) || empty($settings['admin_url']) ? 'disabled' : ''; ?>>
                        <span class="dashicons dashicons-upload"></span>
                        <?php _e('Enviar Datos', 'mantenapp-client'); ?>
                    </button>
                </div>
            </div>
            
            <div class="card">
                <h3><?php _e('Información del Sitio', 'mantenapp-client'); ?></h3>
                <div class="site-info">
                    <div class="info-item">
                        <strong><?php _e('WordPress:', 'mantenapp-client'); ?></strong>
                        <span><?php echo get_bloginfo('version'); ?></span>
                    </div>
                    <div class="info-item">
                        <strong><?php _e('PHP:', 'mantenapp-client'); ?></strong>
                        <span><?php echo phpversion(); ?></span>
                    </div>
                    <div class="info-item">
                        <strong><?php _e('Tema:', 'mantenapp-client'); ?></strong>
                        <span><?php echo wp_get_theme()->get('Name'); ?></span>
                    </div>
                    <div class="info-item">
                        <strong><?php _e('Plugins:', 'mantenapp-client'); ?></strong>
                        <span><?php echo count(get_option('active_plugins')); ?> <?php _e('activos', 'mantenapp-client'); ?></span>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <h3><?php _e('Estado de Seguridad', 'mantenapp-client'); ?></h3>
                <div class="security-status">
                    <div class="security-item <?php echo is_ssl() ? 'secure' : 'warning'; ?>">
                        <span class="dashicons <?php echo is_ssl() ? 'dashicons-lock' : 'dashicons-unlock'; ?>"></span>
                        <span><?php echo is_ssl() ? __('SSL Activo', 'mantenapp-client') : __('SSL Inactivo', 'mantenapp-client'); ?></span>
                    </div>
                    <div class="security-item <?php echo !username_exists('admin') ? 'secure' : 'warning'; ?>">
                        <span class="dashicons <?php echo !username_exists('admin') ? 'dashicons-yes' : 'dashicons-warning'; ?>"></span>
                        <span><?php echo !username_exists('admin') ? __('Usuario admin seguro', 'mantenapp-client') : __('Usuario admin detectado', 'mantenapp-client'); ?></span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Modal para mostrar datos recopilados -->
    <div id="data-modal" class="mantenapp-modal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h2><?php _e('Datos Recopilados', 'mantenapp-client'); ?></h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <pre id="collected-data"></pre>
            </div>
            <div class="modal-footer">
                <button class="button button-secondary modal-close"><?php _e('Cerrar', 'mantenapp-client'); ?></button>
                <button id="send-collected-data" class="button button-primary"><?php _e('Enviar Estos Datos', 'mantenapp-client'); ?></button>
            </div>
        </div>
    </div>
</div>
