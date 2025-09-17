/**
 * MantenApp Cliente - JavaScript de Administración
 */

(function($) {
    'use strict';

    // Variables globales
    let collectedData = null;
    
    $(document).ready(function() {
        initializeAdmin();
    });

    /**
     * Inicializar funcionalidades del admin
     */
    function initializeAdmin() {
        // Toggle de contraseña
        $('.toggle-password').on('click', togglePasswordVisibility);
        
        // Mostrar/ocultar intervalo de sincronización
        $('input[name="auto_sync"]').on('change', toggleSyncInterval);
        
        // Botones de acción
        $('#collect-data').on('click', collectData);
        $('#send-data').on('click', sendData);
        $('#test-connection').on('click', testConnection);
        $('#send-collected-data').on('click', sendCollectedData);
        
        // Modal
        $('.modal-close').on('click', closeModal);
        $(document).on('keyup', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
        
        // Click fuera del modal
        $('.mantenapp-modal').on('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
        
        // Validación en tiempo real
        $('input[name="admin_url"], input[name="api_key"]').on('input', validateConnection);
        
        // Auto-guardar configuración
        $('.mantenapp-form input, .mantenapp-form select').on('change', function() {
            showNotice('info', 'Recuerda guardar los cambios', 3000);
        });
    }

    /**
     * Toggle visibilidad de contraseña
     */
    function togglePasswordVisibility() {
        const targetId = $(this).data('target');
        const input = $('#' + targetId);
        const icon = $(this).find('.dashicons');
        
        if (input.attr('type') === 'password') {
            input.attr('type', 'text');
            icon.removeClass('dashicons-visibility').addClass('dashicons-hidden');
        } else {
            input.attr('type', 'password');
            icon.removeClass('dashicons-hidden').addClass('dashicons-visibility');
        }
    }

    /**
     * Toggle intervalo de sincronización
     */
    function toggleSyncInterval() {
        const syncInterval = $('.sync-interval');
        if ($(this).is(':checked')) {
            syncInterval.slideDown(300);
        } else {
            syncInterval.slideUp(300);
        }
    }

    /**
     * Validar configuración de conexión
     */
    function validateConnection() {
        const adminUrl = $('input[name="admin_url"]').val();
        const apiKey = $('input[name="api_key"]').val();
        const sendButton = $('#send-data');
        
        if (adminUrl && apiKey) {
            sendButton.prop('disabled', false);
            updateConnectionStatus('connected');
        } else {
            sendButton.prop('disabled', true);
            updateConnectionStatus('disconnected');
        }
    }

    /**
     * Actualizar estado de conexión
     */
    function updateConnectionStatus(status) {
        const statusElement = $('.connection-status');
        const statusText = statusElement.find('.status-text');
        
        statusElement.removeClass('connected disconnected').addClass(status);
        
        if (status === 'connected') {
            statusText.text('Conectado');
        } else {
            statusText.text('Desconectado');
        }
    }

    /**
     * Recopilar datos del sitio
     */
    function collectData() {
        const button = $('#collect-data');
        
        setButtonLoading(button, true);
        showNotice('info', mantenappClient.strings.collecting);
        
        $.ajax({
            url: mantenappClient.ajax_url,
            type: 'POST',
            data: {
                action: 'mantenapp_collect_data',
                nonce: mantenappClient.nonce
            },
            success: function(response) {
                if (response.success) {
                    collectedData = response.data;
                    showDataModal(collectedData);
                    showNotice('success', 'Datos recopilados correctamente');
                } else {
                    showNotice('error', response.data || mantenappClient.strings.error);
                }
            },
            error: function(xhr, status, error) {
                console.error('Error collecting data:', error);
                showNotice('error', 'Error de conexión: ' + error);
            },
            complete: function() {
                setButtonLoading(button, false);
            }
        });
    }

    /**
     * Enviar datos al servidor admin
     */
    function sendData() {
        const button = $('#send-data');
        const adminUrl = $('input[name="admin_url"]').val();
        const apiKey = $('input[name="api_key"]').val();
        
        if (!adminUrl || !apiKey) {
            showNotice('error', 'Por favor, configura la URL del servidor y la clave API');
            return;
        }
        
        setButtonLoading(button, true);
        showNotice('info', mantenappClient.strings.sending);
        
        $.ajax({
            url: mantenappClient.ajax_url,
            type: 'POST',
            data: {
                action: 'mantenapp_send_data',
                nonce: mantenappClient.nonce
            },
            success: function(response) {
                if (response.success) {
                    showNotice('success', mantenappClient.strings.success);
                    updateLastSync();
                } else {
                    showNotice('error', response.data || mantenappClient.strings.error);
                }
            },
            error: function(xhr, status, error) {
                console.error('Error sending data:', error);
                showNotice('error', 'Error de conexión: ' + error);
            },
            complete: function() {
                setButtonLoading(button, false);
            }
        });
    }

    /**
     * Probar conexión con el servidor
     */
    function testConnection() {
        const button = $('#test-connection');
        const adminUrl = $('input[name="admin_url"]').val();
        const apiKey = $('input[name="api_key"]').val();
        
        if (!adminUrl || !apiKey) {
            showNotice('error', 'Por favor, configura la URL del servidor y la clave API');
            return;
        }
        
        setButtonLoading(button, true);
        showNotice('info', 'Probando conexión...');
        
        // Simular prueba de conexión
        setTimeout(function() {
            // En una implementación real, esto haría una llamada AJAX al servidor
            const isValid = validateUrl(adminUrl) && apiKey.length > 10;
            
            if (isValid) {
                showNotice('success', 'Conexión exitosa');
                updateConnectionStatus('connected');
            } else {
                showNotice('error', 'Error de conexión. Verifica los datos');
                updateConnectionStatus('disconnected');
            }
            
            setButtonLoading(button, false);
        }, 2000);
    }

    /**
     * Enviar datos recopilados desde el modal
     */
    function sendCollectedData() {
        if (!collectedData) {
            showNotice('error', 'No hay datos para enviar');
            return;
        }
        
        closeModal();
        sendData();
    }

    /**
     * Mostrar modal con datos recopilados
     */
    function showDataModal(data) {
        const modal = $('#data-modal');
        const dataContainer = $('#collected-data');
        
        // Formatear datos para mostrar
        const formattedData = JSON.stringify(data, null, 2);
        dataContainer.text(formattedData);
        
        modal.fadeIn(300);
        $('body').addClass('modal-open');
    }

    /**
     * Cerrar modal
     */
    function closeModal() {
        $('.mantenapp-modal').fadeOut(300);
        $('body').removeClass('modal-open');
    }

    /**
     * Mostrar notificación
     */
    function showNotice(type, message, duration = 5000) {
        // Remover notificaciones existentes
        $('.mantenapp-notice').remove();
        
        const notice = $(`
            <div class="mantenapp-notice ${type}">
                <p>${message}</p>
            </div>
        `);
        
        $('.mantenapp-client-admin').prepend(notice);
        
        // Auto-ocultar después del tiempo especificado
        setTimeout(function() {
            notice.fadeOut(300, function() {
                $(this).remove();
            });
        }, duration);
    }

    /**
     * Establecer estado de carga en botón
     */
    function setButtonLoading(button, loading) {
        if (loading) {
            button.addClass('loading').prop('disabled', true);
            const originalText = button.text();
            button.data('original-text', originalText);
        } else {
            button.removeClass('loading').prop('disabled', false);
            const originalText = button.data('original-text');
            if (originalText) {
                button.text(originalText);
            }
        }
    }

    /**
     * Actualizar timestamp de última sincronización
     */
    function updateLastSync() {
        const now = new Date();
        const formatted = now.toLocaleString();
        $('.last-sync').text('Última sincronización: ' + formatted);
    }

    /**
     * Validar URL
     */
    function validateUrl(url) {
        try {
            new URL(url);
            return url.startsWith('http://') || url.startsWith('https://');
        } catch {
            return false;
        }
    }

    /**
     * Funciones de utilidad
     */
    window.MantenAppClient = {
        collectData: collectData,
        sendData: sendData,
        testConnection: testConnection,
        showNotice: showNotice
    };

})(jQuery);

// CSS adicional para modal-open
jQuery(document).ready(function($) {
    $('<style>')
        .prop('type', 'text/css')
        .html(`
            body.modal-open {
                overflow: hidden;
            }
            .mantenapp-modal {
                backdrop-filter: blur(5px);
            }
        `)
        .appendTo('head');
});
