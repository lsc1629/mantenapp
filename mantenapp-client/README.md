# MantenApp Cliente - Plugin WordPress

Plugin cliente para conectar sitios WordPress con el sistema de monitoreo MantenApp.

## 🚀 Instalación

### Método 1: Instalación Manual
1. Descarga toda la carpeta `mantenapp-client`
2. Sube la carpeta completa a `/wp-content/plugins/` de tu WordPress
3. Ve a **Plugins** en el admin de WordPress
4. Activa el plugin **MantenApp Cliente**

### Método 2: Instalación por ZIP
1. Comprime la carpeta `mantenapp-client` en un archivo ZIP
2. Ve a **Plugins > Añadir nuevo > Subir plugin** en WordPress
3. Sube el archivo ZIP y activa el plugin

## ⚙️ Configuración

1. Una vez activado, ve a **MantenApp** en el menú lateral del admin
2. Ingresa tu **API Key** (obtenida del panel de MantenApp)
3. Configura la **URL del servidor** (por defecto: `http://localhost:3001/api/v1`)
4. Habilita la **sincronización automática** si lo deseas
5. Haz clic en **Guardar Configuración**

## 🔧 Uso

### Probar Conexión
- Usa el botón **"Probar Conexión"** para verificar que la API Key funciona correctamente

### Sincronización Manual
- Usa el botón **"Sincronizar Ahora"** para enviar datos inmediatamente al servidor

### Sincronización Automática
- Si está habilitada, el plugin enviará datos automáticamente según el intervalo configurado

## 📊 Datos Recopilados

El plugin recopila de forma segura:
- **Información del sitio**: Nombre, URL, email admin
- **WordPress**: Versión, tema activo, configuración
- **Plugins**: Lista de plugins instalados y activos
- **Usuarios**: Conteo por roles (sin datos personales)
- **Contenido**: Conteo de posts, páginas, comentarios
- **Seguridad**: Estado de SSL, versiones actualizadas
- **Rendimiento**: Límites de memoria, tiempo de ejecución

## 🔒 Seguridad

- Todas las comunicaciones usan HTTPS
- API Keys encriptadas
- No se recopilan datos personales de usuarios
- Solo administradores pueden configurar el plugin

## 🆘 Solución de Problemas

### Error de Conexión
- Verifica que la URL del servidor sea correcta
- Asegúrate de que el servidor MantenApp esté ejecutándose
- Revisa que la API Key sea válida

### Plugin no se activa
- Verifica que tu WordPress sea versión 5.0 o superior
- Asegúrate de que PHP sea versión 7.4 o superior
- Revisa los logs de error de WordPress

### Sincronización falla
- Verifica la conexión a internet
- Asegúrate de que no haya firewalls bloqueando la conexión
- Revisa que la API Key no haya expirado

## 📝 Changelog

### v1.0.1
- Corregidos errores críticos de funciones duplicadas
- Mejorada la estabilidad del plugin
- Interfaz de usuario optimizada
- Mejor manejo de errores

### v1.0.0
- Versión inicial del plugin
- Interfaz administrativa hermosa
- Sincronización manual y automática
- Recopilación completa de datos del sitio

## 🤝 Soporte

Para soporte técnico, contacta al equipo de MantenApp o revisa la documentación completa del sistema.
