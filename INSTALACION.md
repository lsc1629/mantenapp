# 📋 Guía de Instalación - MantenApp

## Requisitos del Sistema

### Plugin Cliente
- **WordPress:** 5.0 o superior
- **PHP:** 7.4 o superior
- **MySQL:** 5.6 o superior
- **Permisos:** Administrador del sitio

### Plugin Admin
- **WordPress:** 5.0 o superior
- **PHP:** 7.4 o superior
- **MySQL:** 5.6 o superior
- **Memoria PHP:** Mínimo 128MB (recomendado 256MB)
- **Permisos:** Administrador del sitio

## Instalación del Plugin Cliente

### Paso 1: Descarga e Instalación
1. Descarga la carpeta `mantenapp-client`
2. Sube la carpeta al directorio `/wp-content/plugins/` de tu sitio WordPress
3. Ve al panel de administración → Plugins
4. Busca "MantenApp Cliente" y haz clic en "Activar"

### Paso 2: Configuración Inicial
1. Ve a **Configuración → MantenApp Cliente**
2. Completa los siguientes campos:
   - **URL del Servidor Admin:** La URL donde está instalado el plugin administrativo
   - **Clave API:** Proporcionada por el administrador de MantenApp
3. Configura la sincronización automática (opcional)
4. Haz clic en "Guardar Configuración"

### Paso 3: Verificación
1. Haz clic en "Probar Conexión" para verificar la configuración
2. Si la conexión es exitosa, haz clic en "Enviar Datos" para la primera sincronización

## Instalación del Plugin Admin

### Paso 1: Descarga e Instalación
1. Descarga la carpeta `mantenapp-admin`
2. Sube la carpeta al directorio `/wp-content/plugins/` de tu sitio WordPress administrativo
3. Ve al panel de administración → Plugins
4. Busca "MantenApp Admin" y haz clic en "Activar"

### Paso 2: Configuración de Base de Datos
El plugin creará automáticamente las tablas necesarias:
- `wp_mantenapp_clients` - Información de clientes
- `wp_mantenapp_site_data` - Datos de sitios
- `wp_mantenapp_alerts` - Sistema de alertas

### Paso 3: Configuración Inicial
1. Ve a **MantenApp → Configuración**
2. Configura las opciones básicas:
   - **Email de notificaciones:** Para recibir alertas importantes
   - **Retención de datos:** Días para mantener los datos históricos
   - **Límite de clientes:** Número máximo de sitios a gestionar

### Paso 4: Agregar Primer Cliente
1. Ve a **MantenApp → Clientes**
2. Haz clic en "Agregar Cliente"
3. Completa la información del sitio:
   - **Nombre del sitio**
   - **URL del sitio**
   - **Generar clave API** (se creará automáticamente)
4. Proporciona la clave API al cliente para su configuración

## Configuración de Comunicación

### API REST
El plugin admin expone los siguientes endpoints:

```
POST /wp-json/mantenapp/v1/receive-data
GET /wp-json/mantenapp/v1/client-status
```

### Autenticación
- Se utiliza autenticación por Bearer Token
- Cada cliente tiene una clave API única
- Las claves se incluyen en el header: `Authorization: Bearer {API_KEY}`

### Firewall y Seguridad
Si usas un firewall, asegúrate de permitir:
- Conexiones HTTPS salientes desde sitios cliente
- Conexiones entrantes al servidor admin en los endpoints de la API

## Verificación de Instalación

### En el Plugin Cliente
✅ **Indicadores de éxito:**
- Estado de conexión: "Conectado" (verde)
- Última sincronización: Fecha reciente
- Botón "Enviar Datos" habilitado

❌ **Problemas comunes:**
- Estado "Desconectado": Verificar URL y clave API
- Error de SSL: Asegurar certificado válido en servidor admin
- Timeout: Verificar conectividad de red

### En el Plugin Admin
✅ **Indicadores de éxito:**
- Dashboard muestra estadísticas
- Clientes aparecen en la lista
- Datos se reciben correctamente

❌ **Problemas comunes:**
- Tablas no creadas: Verificar permisos de base de datos
- API no responde: Verificar permalinks de WordPress
- Datos no se guardan: Verificar límites de memoria PHP

## Configuración Avanzada

### Cron Jobs (Opcional)
Para sincronización automática más precisa:

```bash
# Agregar al crontab del servidor
0 */6 * * * curl -X POST "https://tu-sitio.com/wp-cron.php"
```

### Optimización de Base de Datos
Para sitios con muchos clientes:

```sql
-- Índices adicionales para mejor rendimiento
ALTER TABLE wp_mantenapp_site_data ADD INDEX idx_client_type (client_id, data_type);
ALTER TABLE wp_mantenapp_alerts ADD INDEX idx_status_severity (status, severity);
```

### Variables de Entorno
Puedes configurar estas constantes en `wp-config.php`:

```php
// Límites personalizados
define('MANTENAPP_MAX_CLIENTS', 500);
define('MANTENAPP_DATA_RETENTION_DAYS', 180);
define('MANTENAPP_API_TIMEOUT', 60);

// Configuración de desarrollo
define('MANTENAPP_DEBUG', true);
define('MANTENAPP_LOG_LEVEL', 'debug');
```

## Solución de Problemas

### ⚠️ Error de SQL con Foreign Keys (Más Común)
Si ves este error al instalar el plugin admin:
```
You have an error in your SQL syntax... FOREIGN KEY (client_id) REFERENCES...
```

**Solución automática:**
1. El plugin detectará y corregirá automáticamente este problema
2. Si persiste, desactiva y reactiva el plugin admin
3. Las tablas se recrearán sin claves foráneas problemáticas

**Solución manual:**
1. Ve a **MantenApp → Diagnóstico** (si está disponible)
2. Haz clic en "Corregir BD" para eliminar claves foráneas
3. O ejecuta este SQL en phpMyAdmin:
```sql
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS wp_mantenapp_site_data;
DROP TABLE IF EXISTS wp_mantenapp_alerts;
DROP TABLE IF EXISTS wp_mantenapp_clients;
SET FOREIGN_KEY_CHECKS = 1;
```
4. Reactiva el plugin para recrear las tablas

### Error: "Clave API inválida"
1. Verificar que la clave esté correctamente copiada
2. Asegurar que el cliente esté activo en el admin
3. Verificar que no haya espacios extra en la clave

### Error: "Timeout de conexión"
1. Verificar conectividad de red
2. Aumentar límite de tiempo en PHP
3. Verificar que no haya firewall bloqueando

### Error: "Datos no se guardan"
1. Verificar permisos de base de datos
2. Revisar límites de memoria PHP
3. Comprobar espacio en disco

### Error: "Tablas no se crean"
1. Verificar que el usuario de BD tenga permisos CREATE
2. Comprobar que no haya límites de espacio en disco
3. Revisar que el motor de BD soporte las características usadas

### Logs de Depuración
Habilitar logs en `wp-config.php`:

```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('MANTENAPP_DEBUG', true);
```

Los logs se guardarán en `/wp-content/debug.log`

## Soporte

Para soporte técnico:
- 📧 Email: soporte@mantenapp.com
- 📚 Documentación: https://docs.mantenapp.com
- 🐛 Reportar bugs: https://github.com/mantenapp/issues

---

**¡Instalación completada!** 🎉

Tu plataforma MantenApp está lista para gestionar sitios WordPress de manera eficiente.
