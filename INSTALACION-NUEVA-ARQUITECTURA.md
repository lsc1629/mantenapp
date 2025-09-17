# 📋 Guía de Instalación - MantenApp (Nueva Arquitectura)

## Arquitectura del Sistema

MantenApp ahora consta de dos componentes principales:
1. **Plugin Cliente** (WordPress) - Recopila y envía datos
2. **Aplicación Web Admin** (React + Backend) - Recibe y gestiona datos

## Requisitos del Sistema

### Plugin Cliente (WordPress)
- **WordPress:** 5.0 o superior
- **PHP:** 7.4 o superior
- **MySQL:** 5.6 o superior
- **Conexión a Internet:** Estable para comunicación con API

### Aplicación Web Admin
- **Servidor Web:** Apache/Nginx
- **Base de Datos:** MySQL/PostgreSQL/MongoDB
- **Backend:** Node.js 18+ / PHP 8+ / Python 3.9+
- **Frontend:** Navegador web moderno
- **Dominio:** Dedicado para la aplicación

## Instalación del Plugin Cliente

### Paso 1: Descarga e Instalación
1. Descarga la carpeta `mantenapp-client`
2. Sube la carpeta al directorio `/wp-content/plugins/` de tu sitio WordPress
3. Ve al panel de administración → Plugins
4. Busca "MantenApp Cliente" y haz clic en "Activar"

### Paso 2: Configuración Inicial
1. Ve a **Configuración → MantenApp Cliente**
2. Completa los siguientes campos:
   - **URL del Servidor Admin:** La URL de tu aplicación web (ej: https://admin.mantenapp.com/api)
   - **Clave API:** Proporcionada por el administrador de la aplicación web
3. Configura la sincronización automática (opcional)
4. Haz clic en "Guardar Configuración"

### Paso 3: Verificación
1. Haz clic en "Probar Conexión" para verificar la configuración
2. Si la conexión es exitosa, haz clic en "Enviar Datos" para la primera sincronización

## Instalación de la Aplicación Web Admin

### Opción 1: Despliegue Local/Servidor Propio

#### Requisitos Previos
```bash
# Node.js (si usas backend Node.js)
node --version  # v18+
npm --version   # v8+

# O PHP (si usas backend PHP)
php --version   # 8.0+
composer --version
```

#### Pasos de Instalación
1. **Clonar/Descargar** el código de la aplicación web
2. **Configurar Base de Datos**
   ```sql
   CREATE DATABASE mantenapp;
   CREATE USER 'mantenapp_user'@'localhost' IDENTIFIED BY 'secure_password';
   GRANT ALL PRIVILEGES ON mantenapp.* TO 'mantenapp_user'@'localhost';
   ```

3. **Configurar Variables de Entorno**
   ```env
   # .env
   DB_HOST=localhost
   DB_NAME=mantenapp
   DB_USER=mantenapp_user
   DB_PASS=secure_password
   
   API_SECRET_KEY=your_secret_key
   JWT_SECRET=your_jwt_secret
   
   FRONTEND_URL=https://admin.mantenapp.com
   ```

4. **Instalar Dependencias y Ejecutar**
   ```bash
   # Backend
   npm install
   npm run migrate  # Crear tablas
   npm run dev      # Desarrollo
   npm run build    # Producción
   
   # Frontend
   cd frontend
   npm install
   npm run dev      # Desarrollo
   npm run build    # Producción
   ```

### Opción 2: Despliegue en la Nube

#### Plataformas Recomendadas
- **Frontend:** Vercel, Netlify, Cloudflare Pages
- **Backend:** Railway, Heroku, DigitalOcean App Platform
- **Base de Datos:** PlanetScale, Supabase, MongoDB Atlas

#### Configuración en Vercel + Railway
1. **Frontend en Vercel:**
   - Conectar repositorio
   - Configurar build command: `npm run build`
   - Configurar variables de entorno

2. **Backend en Railway:**
   - Conectar repositorio
   - Configurar variables de entorno
   - Configurar base de datos

## Configuración de Comunicación

### En el Plugin Cliente (WordPress)
```php
// wp-config.php (opcional)
define('MANTENAPP_API_URL', 'https://admin.mantenapp.com/api');
define('MANTENAPP_API_TIMEOUT', 30);
define('MANTENAPP_DEBUG', false);
```

### En la Aplicación Web Admin
- Configurar CORS para permitir requests del plugin cliente
- Configurar rate limiting para seguridad
- Configurar autenticación JWT para API

## Gestión de Clientes

### Agregar Nuevo Cliente
1. Acceder a la aplicación web admin
2. Ir a la sección "Clientes"
3. Hacer clic en "Agregar Cliente"
4. Completar información:
   - Nombre del sitio
   - URL del sitio
   - Información de contacto
5. Copiar la clave API generada
6. Proporcionar la clave al administrador del sitio WordPress

### Configurar Plugin Cliente
1. En el sitio WordPress cliente, ir a configuración del plugin
2. Pegar la URL de la aplicación admin
3. Pegar la clave API
4. Probar conexión y realizar primera sincronización

## Verificación de Instalación

### Checklist Final
- [ ] Plugin cliente instalado en sitios WordPress
- [ ] Aplicación web admin desplegada y accesible
- [ ] Base de datos configurada correctamente
- [ ] Variables de entorno configuradas
- [ ] Cliente agregado con clave API válida
- [ ] Primera sincronización exitosa
- [ ] Dashboard mostrando datos del cliente

### Pruebas de Funcionamiento
1. **Conexión API:** Verificar que el plugin cliente se conecte a la aplicación admin
2. **Envío de datos:** Probar envío manual desde WordPress
3. **Recepción de datos:** Verificar datos en dashboard web
4. **Alertas:** Comprobar generación automática de alertas
5. **Notificaciones:** Probar sistema de notificaciones

## Solución de Problemas

### Error: "No se puede conectar con el servidor"
1. Verificar que la URL de la aplicación admin sea correcta
2. Comprobar que la aplicación esté funcionando (acceder vía navegador)
3. Verificar configuración de CORS en el backend
4. Revisar logs del servidor para errores

### Error: "Clave API inválida"
1. Verificar que la clave esté correctamente copiada
2. Comprobar que el cliente esté activo en la aplicación admin
3. Verificar que la clave no haya expirado
4. Regenerar clave si es necesario

### Error: "Timeout de conexión"
1. Verificar conectividad de red
2. Aumentar timeout en configuración del plugin
3. Comprobar límites del servidor (rate limiting)
4. Verificar que no haya firewall bloqueando

## Mantenimiento

### Tareas Regulares
- Monitorear dashboard web para alertas
- Verificar sincronización de todos los clientes
- Actualizar aplicación web cuando haya nuevas versiones
- Revisar logs del servidor regularmente
- Hacer backup de la base de datos

### Escalabilidad
- Monitorear uso de recursos del servidor
- Configurar CDN para el frontend si es necesario
- Optimizar consultas de base de datos
- Implementar cache para mejorar rendimiento
- Considerar load balancing para alto tráfico

---

Esta nueva arquitectura proporciona mayor flexibilidad, escalabilidad y un mejor rendimiento comparado con la solución basada en plugins de WordPress.
