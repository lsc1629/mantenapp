# 🚀 DEPLOY A PRODUCCIÓN - MantenApp

## 🎯 **PROBLEMA SOLUCIONADO**

El error `cURL error 7: Failed to connect to localhost port 3001` indica que el backend no está corriendo. Es hora de llevar MantenApp a producción.

## 📋 **OPCIONES DE DEPLOY**

### **🐳 Opción 1: Docker (Recomendado)**
- ✅ **Fácil de configurar**
- ✅ **Escalable**
- ✅ **Portable**
- ✅ **Incluye base de datos**

### **☁️ Opción 2: Servicios Cloud**
- **Frontend:** Netlify, Vercel, GitHub Pages
- **Backend:** Railway, Render, DigitalOcean
- **Base de datos:** Supabase, PlanetScale, Neon

### **🖥️ Opción 3: VPS/Servidor**
- **Servidor:** DigitalOcean, Linode, AWS EC2
- **Configuración manual**
- **Más control**

## 🐳 **DEPLOY CON DOCKER (RÁPIDO)**

### **1. Requisitos:**
```bash
# Instalar Docker y Docker Compose
# macOS:
brew install docker docker-compose

# Ubuntu:
sudo apt install docker.io docker-compose

# Verificar instalación
docker --version
docker-compose --version
```

### **2. Configurar Variables:**
```bash
# Editar archivo de configuración
nano .env.production

# Contenido mínimo:
DB_PASSWORD=tu_password_super_seguro_2024
JWT_SECRET=tu_jwt_secret_super_seguro_2024
FRONTEND_URL=http://tu-dominio.com
API_URL=http://tu-dominio.com:3001
```

### **3. Deploy Automático:**
```bash
# Hacer ejecutable el script
chmod +x deploy.sh

# Deploy completo
./deploy.sh production

# O paso a paso:
docker-compose -f docker-compose.prod.yml up --build -d
```

### **4. Verificar Deploy:**
```bash
# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Verificar servicios
curl http://localhost:3001/health  # Backend
curl http://localhost/health       # Frontend

# Ver contenedores
docker ps
```

## ☁️ **DEPLOY EN CLOUD (GRATIS)**

### **🎯 Railway (Backend + DB)**

1. **Crear cuenta en [Railway.app](https://railway.app)**

2. **Deploy Backend:**
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Crear proyecto
railway new

# Deploy
railway up
```

3. **Configurar Variables:**
```
DATABASE_URL=postgresql://...  (auto-generada)
JWT_SECRET=tu-jwt-secret-2024
NODE_ENV=production
PORT=3001
```

### **🌐 Netlify (Frontend)**

1. **Build local:**
```bash
cd mantenapp-admin/frontend
npm run build
```

2. **Deploy en Netlify:**
- Arrastra la carpeta `dist` a netlify.com
- O conecta tu repositorio GitHub

3. **Variables de entorno:**
```
VITE_API_URL=https://tu-backend.railway.app
```

## 🔧 **CONFIGURACIÓN DEL PLUGIN**

### **Plugin Actualizado:**
- ✅ **Auto-detección de ambiente**
- ✅ **URLs de producción configuradas**
- ✅ **Staging y producción soportados**

### **URLs por Ambiente:**
- 🔧 **Desarrollo:** `http://localhost:3001/api/v1`
- 🧪 **Staging:** `https://staging-api.mantenapp.com/api/v1`
- 🚀 **Producción:** `https://api.mantenapp.com/api/v1`

### **Instalación:**
```
mantenapp-client-PRODUCCION.zip
```

## 🎯 **FLUJO COMPLETO DE PRODUCCIÓN**

### **1. Deploy Backend:**
```bash
# Opción A: Docker local
./deploy.sh production

# Opción B: Railway
railway up
```

### **2. Deploy Frontend:**
```bash
# Build
cd mantenapp-admin/frontend
VITE_API_URL=https://tu-backend.railway.app npm run build

# Deploy a Netlify
# Arrastra carpeta dist/
```

### **3. Configurar Plugin:**
```bash
# El plugin detectará automáticamente el ambiente
# Solo necesitas pegar la API Key
```

### **4. Testing:**
```bash
# Crear cliente en frontend
https://tu-frontend.netlify.app

# Instalar plugin en WordPress
# Pegar API Key

# Probar conexión
# ✅ Debería conectar a tu backend en producción
```

## 🔍 **DEBUGGING EN PRODUCCIÓN**

### **Logs de Docker:**
```bash
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs postgres
```

### **Logs de Railway:**
```bash
railway logs
```

### **Test de Endpoints:**
```bash
# Health check
curl https://tu-backend.railway.app/health

# Test de autenticación
curl -X POST https://tu-backend.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"donluissalascortes@gmail.com","password":"lsc16291978@0319"}'
```

## 🎉 **RESULTADO ESPERADO**

### **URLs de Producción:**
- 🌐 **Frontend:** `https://tu-app.netlify.app`
- 🔧 **Backend:** `https://tu-backend.railway.app`
- 📊 **API:** `https://tu-backend.railway.app/api/v1`

### **Plugin WordPress:**
- 🚀 **Badge:** "🚀 Producción"
- 🔗 **URL:** Auto-detectada
- ✅ **Conexión:** Exitosa con backend en la nube

### **Funcionalidades:**
- ✅ **Login en frontend**
- ✅ **Crear clientes**
- ✅ **Generar API Keys**
- ✅ **Plugin conecta exitosamente**
- ✅ **Sincronización funcional**
- ✅ **Dashboard con datos reales**

## 💡 **RECOMENDACIÓN**

**Para empezar rápido:**

1. **Railway** para backend (gratis hasta 5$/mes)
2. **Netlify** para frontend (gratis)
3. **Plugin actualizado** con auto-detección

**¡En 30 minutos tendrás MantenApp funcionando en producción!** 🚀

## 🆘 **SOPORTE**

Si tienes problemas:
1. Revisa los logs
2. Verifica las variables de entorno
3. Confirma que los puertos estén abiertos
4. Prueba los endpoints manualmente

**¡Vamos a llevarlo a producción!** 🎉
