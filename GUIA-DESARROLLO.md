# 🚀 Guía de Desarrollo - MantenApp

## 📋 Resumen del Proyecto

MantenApp es una plataforma completa de mantenimiento para sitios WordPress que consta de:

### ✅ **Componentes Completados:**

1. **🔌 Plugin Cliente (WordPress)**
   - Recopila datos del sitio WordPress
   - Ligero y no intrusivo
   - Envía información vía API REST
   - Interfaz administrativa simple

2. **🌐 Aplicación Web Admin (React + Node.js)**
   - Frontend moderno con React + Vite + TypeScript
   - Backend robusto con Node.js + Express + TypeScript
   - Base de datos PostgreSQL con Prisma ORM
   - Interfaz visualmente hermosa y UX/UI eficaz

## 🏗️ Arquitectura Implementada

```
┌─────────────────────┐    HTTPS/API    ┌─────────────────────┐
│   Plugin Cliente    │ ──────────────► │  Aplicación Web     │
│   (WordPress)       │                │  Admin              │
│                     │                │                     │
│ • Recopila datos    │                │ • React Frontend    │
│ • Envía vía API     │                │ • Node.js Backend   │
│ • Ligero (< 100KB)  │                │ • PostgreSQL DB     │
│ • Auto-sync         │                │ • JWT Auth          │
└─────────────────────┘                └─────────────────────┘
```

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** + **Vite** + **TypeScript**
- **Tailwind CSS** para estilos
- **Framer Motion** para animaciones
- **React Query** para gestión de estado del servidor
- **React Hook Form** + **Zod** para formularios
- **Zustand** para estado global

### Backend
- **Node.js** + **Express** + **TypeScript**
- **Prisma ORM** con **PostgreSQL**
- **JWT** para autenticación
- **Zod** para validación
- **bcrypt** para hash de contraseñas

### Plugin Cliente
- **WordPress Plugin** estándar
- **PHP 7.4+** compatible
- **API REST** para comunicación
- **Cron jobs** para sincronización automática

## 📁 Estructura del Proyecto

```
wp-mantenapp/
├── mantenapp-client/           # Plugin WordPress Cliente
│   ├── mantenapp-client.php    # Archivo principal
│   └── includes/
│       └── admin-page.php      # Página de configuración
├── mantenapp-admin/            # Aplicación Web Admin
│   ├── backend/                # API Node.js
│   │   ├── src/
│   │   │   ├── routes/         # Rutas de la API
│   │   │   ├── middleware/     # Middleware personalizado
│   │   │   └── server.ts       # Servidor Express
│   │   ├── prisma/
│   │   │   └── schema.prisma   # Esquema de base de datos
│   │   └── package.json
│   └── frontend/               # React App
│       ├── src/
│       │   ├── components/     # Componentes UI
│       │   ├── pages/          # Páginas principales
│       │   ├── stores/         # Estado global
│       │   └── services/       # API calls
│       └── package.json
└── docs/                       # Documentación
```

## 🚀 Cómo Ejecutar en Desarrollo

### 1. Backend (API)
```bash
cd mantenapp-admin/backend
npm install
cp .env.example .env
# Configurar variables de entorno
npm run db:migrate
npm run dev
```

### 2. Frontend (React)
```bash
cd mantenapp-admin/frontend
npm install
cp .env.example .env
# Configurar variables de entorno
npm run dev
```

### 3. Plugin Cliente
1. Copiar carpeta `mantenapp-client` a `/wp-content/plugins/`
2. Activar plugin en WordPress
3. Configurar URL de API y clave en el plugin

## 🌐 Despliegue en Producción

### Opción 1: Gratuita (Recomendada para empezar)
- **Frontend**: Vercel (gratis)
- **Backend**: Railway (gratis con $5 crédito)
- **Base de Datos**: Supabase (gratis hasta 500MB)

### Opción 2: Escalable
- **Frontend**: Vercel Pro ($20/mes)
- **Backend**: Railway Pro ($5/mes + uso)
- **Base de Datos**: Supabase Pro ($25/mes)

## 🔧 Configuración

### Variables de Entorno Backend
```env
DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="your-secret-key"
PORT=3001
NODE_ENV="production"
FRONTEND_URL="https://admin.mantenapp.com"
```

### Variables de Entorno Frontend
```env
VITE_API_URL="https://api.mantenapp.com/api/v1"
VITE_APP_NAME="MantenApp"
```

## 📊 Funcionalidades Implementadas

### Dashboard
- ✅ Estadísticas en tiempo real
- ✅ Gráficos interactivos
- ✅ Actividad reciente
- ✅ Estado del sistema

### Gestión de Clientes
- ✅ Lista de sitios WordPress
- ✅ Agregar/editar/eliminar clientes
- ✅ Generación de API keys
- ✅ Estado de sincronización

### Sistema de Alertas
- ✅ Alertas automáticas
- ✅ Clasificación por severidad
- ✅ Gestión masiva
- ✅ Filtros avanzados

### Autenticación
- ✅ Login/registro
- ✅ JWT tokens
- ✅ Cambio de contraseña
- ✅ Sesiones persistentes

## 🔐 Seguridad Implementada

- **Autenticación JWT** con tokens seguros
- **Validación de entrada** con Zod
- **Rate limiting** en API
- **CORS** configurado
- **Headers de seguridad** con Helmet
- **Hash de contraseñas** con bcrypt
- **API keys únicas** por cliente

## 🎨 Diseño y UX/UI

### Principios Aplicados
- **Interfaz visualmente hermosa** con gradientes y sombras
- **UX/UI simple y eficaz** con navegación intuitiva
- **Herramientas visuales** con iconos y badges
- **Responsive design** para todos los dispositivos
- **Animaciones suaves** con Framer Motion
- **Feedback visual** con toasts y estados de carga

### Paleta de Colores
- **Primary**: Azul/Púrpura (#667eea → #764ba2)
- **Success**: Verde (#22c55e)
- **Warning**: Naranja (#f59e0b)
- **Danger**: Rojo (#ef4444)
- **Gray**: Escala de grises moderna

## 📈 Próximas Funcionalidades

### Fase 2 (Futuro)
- [ ] Notificaciones push en tiempo real
- [ ] Reportes automáticos por email
- [ ] Integración con servicios de monitoreo
- [ ] API pública para integraciones
- [ ] Aplicación móvil
- [ ] Multi-tenancy para agencias

### Mejoras Técnicas
- [ ] Tests automatizados (Jest + Cypress)
- [ ] CI/CD con GitHub Actions
- [ ] Monitoreo con Sentry
- [ ] Cache con Redis
- [ ] WebSockets para tiempo real

## 🐛 Problemas Conocidos y Soluciones

### Error de SQL con Foreign Keys
- **Problema**: Error al crear tablas con claves foráneas
- **Solución**: Implementada corrección automática sin FK

### Error de PHP 8.1+ con number_format()
- **Problema**: Warnings con valores null
- **Solución**: Implementada validación y función segura

### Dependencias de Node.js
- **Problema**: Algunas dependencias pueden no estar instaladas
- **Solución**: Ejecutar `npm install` en backend y frontend

## 📞 Soporte y Contribución

### Reportar Bugs
1. Crear issue en el repositorio
2. Incluir logs de error
3. Describir pasos para reproducir

### Contribuir
1. Fork del proyecto
2. Crear rama feature
3. Hacer commit de cambios
4. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver archivo LICENSE para detalles.

---

**Desarrollado con ❤️ para la gestión profesional de sitios WordPress**

*MantenApp v1.0.0 - Una plataforma escalable, segura y hermosa*
