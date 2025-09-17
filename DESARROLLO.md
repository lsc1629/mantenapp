# 🔧 Guía de Desarrollo - MantenApp

## 🤔 **¿Para qué necesitamos la URL del servidor?**

### **Flujo de Comunicación:**
```
WordPress (Plugin Cliente) → HTTP Request → MantenApp Backend → Base de Datos
```

El plugin WordPress necesita saber **dónde enviar** los datos que recopila del sitio.

## 🏗️ **Detección Automática de Ambiente**

El plugin ahora detecta automáticamente el ambiente:

### **🔧 Desarrollo Local:**
- **Detecta:** `localhost`, `127.0.0.1`, `.local`, `.test`, `WP_DEBUG = true`
- **URL Auto:** `http://localhost:3001/api/v1`
- **Interfaz:** Campo URL bloqueado (readonly)
- **Ventaja:** No necesitas configurar nada manualmente

### **🧪 Staging:**
- **Detecta:** `staging`, `dev.`, `WP_ENVIRONMENT_TYPE = staging`
- **URL Auto:** `https://staging-api.mantenapp.com/api/v1`
- **Interfaz:** Campo URL editable

### **🚀 Producción:**
- **Detecta:** Todo lo demás
- **URL Auto:** `https://api.mantenapp.com/api/v1`
- **Interfaz:** Campo URL editable

## 🔄 **Flujo de Desarrollo Actual**

### **1. Configuración Inicial:**
```bash
# Backend (Terminal 1)
cd mantenapp-admin/backend
npm run dev  # Puerto 3001

# Frontend (Terminal 2)  
cd mantenapp-admin/frontend
npm run dev  # Puerto 5174
```

### **2. Crear Cliente:**
1. Ve a `http://localhost:5174`
2. Login: `donluissalascortes@gmail.com` / `lsc16291978@0319`
3. Crear cliente → Copia la API Key

### **3. Configurar Plugin:**
1. Instala el plugin en WordPress
2. Ve a **MantenApp** en el menú
3. **Ambiente detectado:** 🔧 Desarrollo
4. **URL auto-configurada:** `http://localhost:3001/api/v1`
5. Solo pega la **API Key**
6. ¡Listo!

## 📊 **¿Qué datos se envían?**

```json
{
  "site_info": {
    "name": "Mi Sitio WordPress",
    "url": "http://localhost/mi-sitio",
    "admin_email": "admin@sitio.com"
  },
  "core": {
    "wp_version": "6.4.1",
    "php_version": "8.1.0",
    "mysql_version": "8.0.33",
    "theme_name": "Mi Tema"
  },
  "timestamp": 1705123456
}
```

## 🧪 **Testing en Desarrollo**

### **Endpoints que usa el plugin:**

1. **Test de Conexión:**
   ```
   GET http://localhost:3001/api/v1/sync/test
   Headers: Authorization: Bearer {API_KEY}
   ```

2. **Sincronización:**
   ```
   POST http://localhost:3001/api/v1/sync
   Headers: Authorization: Bearer {API_KEY}
   Body: {datos del sitio}
   ```

### **Verificar que funciona:**

1. **Backend corriendo:** ✅ `http://localhost:3001/health`
2. **Cliente creado:** ✅ API Key generada
3. **Plugin instalado:** ✅ Sin errores fatales
4. **Test conexión:** ✅ Botón "Probar Conexión"
5. **Sincronización:** ✅ Botón "Sincronizar Ahora"

## 🔍 **Debugging**

### **Logs del Backend:**
```bash
# Ver logs en tiempo real
cd mantenapp-admin/backend
npm run dev
# Los requests del plugin aparecerán aquí
```

### **Logs de WordPress:**
```php
// En wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);

// Ver logs
tail -f /wp-content/debug.log
```

### **Network Tab del Navegador:**
1. Abre DevTools en WordPress Admin
2. Ve a Network
3. Haz clic en "Probar Conexión"
4. Ve las peticiones AJAX

## 🚀 **Próximos Pasos**

1. **Completar funcionalidades** del backend
2. **Agregar más datos** de recopilación
3. **Implementar alertas** automáticas
4. **Crear dashboard** con métricas
5. **Deploy a staging/producción**

## 💡 **Ventajas de la Auto-detección**

- ✅ **Cero configuración** en desarrollo
- ✅ **Menos errores** de configuración
- ✅ **Fácil testing** local
- ✅ **Deploy automático** a diferentes ambientes
- ✅ **Experiencia de desarrollador** mejorada

**¡Ahora solo necesitas la API Key para que todo funcione!** 🎉
