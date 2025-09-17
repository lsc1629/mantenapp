/**
 * MantenApp Cliente - JavaScript del Admin
 */

jQuery(document).ready(function($) {
    
    // Guardar configuración
    $('#mantenapp-settings-form').on('submit', function(e) {
        e.preventDefault();
        
        const form = $(this);
        const submitBtn = form.find('button[type="submit"]');
        const originalText = submitBtn.html();
        
        // Estado de carga
        submitBtn.addClass('loading').prop('disabled', true);
        
        const formData = {
            action: 'mantenapp_save_settings',
            nonce: form.find('#mantenapp_nonce').val(),
            api_key: form.find('#api_key').val(),
            admin_url: form.find('#admin_url').val(),
            auto_sync: form.find('#auto_sync').is(':checked') ? 1 : 0,
            sync_interval: form.find('#sync_interval').val()
        };
        
        $.ajax({
            url: mantenapp_ajax.ajax_url,
            type: 'POST',
            data: formData,
            success: function(response) {
                if (response.success) {
                    showNotification('success', response.data.message || 'Configuración guardada correctamente');
                    
                    // Actualizar indicador de estado
                    const statusIndicator = $('.status-indicator');
                    if (formData.api_key) {
                        statusIndicator.addClass('connected').removeClass('disconnected');
                        statusIndicator.find('.status-text').text('Configurado');
                    } else {
                        statusIndicator.addClass('disconnected').removeClass('connected');
                        statusIndicator.find('.status-text').text('Sin configurar');
                    }
                } else {
                    showNotification('error', response.data.message || 'Error al guardar la configuración');
                }
            },
            error: function(xhr, status, error) {
                console.error('Error AJAX:', error);
                showNotification('error', 'Error de conexión al guardar la configuración');
            },
            complete: function() {
                submitBtn.removeClass('loading').prop('disabled', false);
            }
        });
    });
    
    // Probar conexión
    $('#test-connection').on('click', function() {
        const button = $(this);
        const resultArea = $('#connection-result');
        const originalText = button.html();
        
        // Estado de carga
        button.addClass('loading').prop('disabled', true);
        resultArea.empty();
        
        const settings = getFormSettings();
        
        if (!settings.api_key) {
            showResult(resultArea, 'error', 'Debes configurar una API Key primero');
            button.removeClass('loading').prop('disabled', false);
            return;
        }
        
        $.ajax({
            url: mantenapp_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'mantenapp_test_connection',
                nonce: mantenapp_ajax.nonce,
                api_key: settings.api_key,
                admin_url: settings.admin_url
            },
            success: function(response) {
                if (response.success) {
                    showResult(resultArea, 'success', response.data.message || 'Conexión exitosa con MantenApp');
                } else {
                    showResult(resultArea, 'error', response.data.message || 'Error en la conexión');
                }
            },
            error: function(xhr, status, error) {
                console.error('Error de conexión:', error);
                showResult(resultArea, 'error', 'No se pudo conectar con el servidor MantenApp');
            },
            complete: function() {
                button.removeClass('loading').prop('disabled', false);
            }
        });
    });
    
    // Sincronización manual
    $('#manual-sync').on('click', function() {
        const button = $(this);
        const resultArea = $('#sync-result');
        const originalText = button.html();
        
        // Estado de carga
        button.addClass('loading').prop('disabled', true);
        resultArea.empty();
        
        const settings = getFormSettings();
        
        if (!settings.api_key) {
            showResult(resultArea, 'error', 'Debes configurar una API Key primero');
            button.removeClass('loading').prop('disabled', false);
            return;
        }
        
        $.ajax({
            url: mantenapp_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'mantenapp_manual_sync',
                nonce: mantenapp_ajax.nonce,
                api_key: settings.api_key,
                admin_url: settings.admin_url
            },
            success: function(response) {
                if (response.success) {
                    showResult(resultArea, 'success', response.data.message || 'Sincronización completada exitosamente');
                    
                    // Actualizar información de última sincronización
                    if (response.data.last_sync) {
                        updateLastSyncInfo(response.data.last_sync);
                    }
                } else {
                    showResult(resultArea, 'error', response.data.message || 'Error en la sincronización');
                }
            },
            error: function(xhr, status, error) {
                console.error('Error de sincronización:', error);
                showResult(resultArea, 'error', 'Error al sincronizar con MantenApp');
            },
            complete: function() {
                button.removeClass('loading').prop('disabled', false);
            }
        });
    });
    
    // Validación en tiempo real
    $('#api_key').on('input', function() {
        const value = $(this).val().trim();
        const isValid = value.length >= 32; // API keys suelen ser de al menos 32 caracteres
        
        $(this).toggleClass('valid', isValid).toggleClass('invalid', !isValid && value.length > 0);
    });
    
    $('#admin_url').on('input', function() {
        const value = $(this).val().trim();
        const isValid = isValidUrl(value);
        
        $(this).toggleClass('valid', isValid).toggleClass('invalid', !isValid && value.length > 0);
    });
    
    // Funciones auxiliares
    function getFormSettings() {
        return {
            api_key: $('#api_key').val().trim(),
            admin_url: $('#admin_url').val().trim() || 'http://localhost:3001/api/v1',
            auto_sync: $('#auto_sync').is(':checked'),
            sync_interval: $('#sync_interval').val()
        };
    }
    
    function showResult(container, type, message) {
        const alertClass = type === 'success' ? 'result-success' : 
                          type === 'error' ? 'result-error' : 'result-info';
        
        const html = `<div class="${alertClass}">${message}</div>`;
        container.html(html).hide().fadeIn(300);
        
        // Auto-hide después de 5 segundos para mensajes de éxito
        if (type === 'success') {
            setTimeout(() => {
                container.fadeOut(300);
            }, 5000);
        }
    }
    
    function showNotification(type, message) {
        // Crear notificación temporal en la parte superior
        const notification = $(`
            <div class="mantenapp-notification ${type === 'success' ? 'success' : 'error'}">
                <div class="notification-content">
                    <span class="notification-icon">${type === 'success' ? '✅' : '❌'}</span>
                    <span class="notification-message">${message}</span>
                    <button class="notification-close">&times;</button>
                </div>
            </div>
        `);
        
        // Estilos inline para la notificación
        notification.css({
            position: 'fixed',
            top: '32px',
            right: '20px',
            zIndex: 9999,
            background: type === 'success' ? '#dcfce7' : '#fee2e2',
            border: `1px solid ${type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            borderRadius: '8px',
            padding: '12px 16px',
            color: type === 'success' ? '#166534' : '#991b1b',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        notification.find('.notification-content').css({
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        });
        
        notification.find('.notification-close').css({
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            marginLeft: '8px'
        });
        
        $('body').append(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.css('transform', 'translateX(0)');
        }, 100);
        
        // Auto-hide y evento de cierre
        const hideNotification = () => {
            notification.css('transform', 'translateX(100%)');
            setTimeout(() => notification.remove(), 300);
        };
        
        notification.find('.notification-close').on('click', hideNotification);
        setTimeout(hideNotification, 5000);
    }
    
    function updateLastSyncInfo(timestamp) {
        const date = new Date(timestamp * 1000);
        const formattedDate = date.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        let syncInfo = $('.last-sync-info');
        if (syncInfo.length === 0) {
            syncInfo = $(`
                <div class="last-sync-info">
                    <small><strong>Última sincronización:</strong> <span class="sync-time"></span></small>
                </div>
            `);
            $('#sync-result').after(syncInfo);
        }
        
        syncInfo.find('.sync-time').text(formattedDate);
    }
    
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    // Mejorar la experiencia de usuario
    $('input, select, textarea').on('focus', function() {
        $(this).closest('.form-group').addClass('focused');
    }).on('blur', function() {
        $(this).closest('.form-group').removeClass('focused');
    });
    
    // Tooltip para campos con ayuda
    $('[data-tooltip]').each(function() {
        const tooltip = $(this).attr('data-tooltip');
        $(this).attr('title', tooltip);
    });
    
    // Confirmación antes de salir si hay cambios sin guardar
    let formChanged = false;
    $('#mantenapp-settings-form input, #mantenapp-settings-form select').on('change', function() {
        formChanged = true;
    });
    
    $('#mantenapp-settings-form').on('submit', function() {
        formChanged = false;
    });
    
    $(window).on('beforeunload', function() {
        if (formChanged) {
            return 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
        }
    });
});

// Función global para toggle de password
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const button = field.nextElementSibling;
    
    if (field.type === 'password') {
        field.type = 'text';
        button.innerHTML = '🙈';
    } else {
        field.type = 'password';
        button.innerHTML = '👁️';
    }
}
