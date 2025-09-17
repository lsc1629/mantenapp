# 🌐 MantenApp Admin - Aplicación Web

Aplicación web moderna para la gestión centralizada de sitios WordPress.

## 🏗️ Arquitectura

```
mantenapp-admin/
├── backend/          # API REST con Node.js + Express + TypeScript
├── frontend/         # React + Vite + TypeScript + Tailwind CSS
├── database/         # Esquemas y migraciones de PostgreSQL
└── docs/            # Documentación de la API
```

## 🚀 Stack Tecnológico

### Frontend
- **React 18** - Librería de UI
- **Vite** - Build tool ultrarrápido
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de CSS utility-first
- **React Router** - Navegación
- **React Query** - Gestión de estado del servidor
- **React Hook Form** - Manejo de formularios
- **Chart.js** - Gráficos y visualizaciones

### Backend
- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **TypeScript** - Tipado estático
- **Prisma** - ORM moderno para PostgreSQL
- **JWT** - Autenticación
- **bcrypt** - Hash de contraseñas
- **Zod** - Validación de esquemas
- **cors** - Configuración CORS

### Base de Datos
- **PostgreSQL** - Base de datos relacional
- **Prisma** - ORM y migraciones
- **Supabase** - Hosting de PostgreSQL (producción)

## 🛠️ Desarrollo Local

### Prerrequisitos
```bash
node --version  # v18+
npm --version   # v8+
```

### Instalación
```bash
# Clonar repositorio
git clone [repo-url]
cd mantenapp-admin

# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install
```

### Configuración
```bash
# Backend - crear .env
cd backend
cp .env.example .env
# Editar .env con tus configuraciones

# Configurar base de datos
npx prisma migrate dev
npx prisma generate
```

### Ejecutar en desarrollo
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🌍 Despliegue

### Desarrollo/Staging (GRATIS)
- **Frontend**: Vercel
- **Backend**: Railway
- **Base de Datos**: Supabase

### Producción
- **Frontend**: Vercel Pro
- **Backend**: Railway Pro
- **Base de Datos**: Supabase Pro

## 📚 Documentación

- [API Documentation](./docs/api.md)
- [Database Schema](./docs/database.md)
- [Deployment Guide](./docs/deployment.md)
- [Contributing](./docs/contributing.md)

## 🔐 Seguridad

- Autenticación JWT
- Validación de entrada con Zod
- Rate limiting
- CORS configurado
- Sanitización de datos
- Logs de auditoría

## 📊 Características

### Dashboard
- ✅ Métricas en tiempo real
- ✅ Gráficos interactivos
- ✅ Alertas prioritarias
- ✅ Actividad reciente

### Gestión de Clientes
- ✅ Lista de sitios WordPress
- ✅ Estados de conexión
- ✅ Información detallada
- ✅ Generación de API keys

### Sistema de Alertas
- ✅ Alertas automáticas
- ✅ Clasificación por severidad
- ✅ Notificaciones por email
- ✅ Historial completo

### API REST
- ✅ Endpoints documentados
- ✅ Autenticación segura
- ✅ Validación robusta
- ✅ Rate limiting

## 🤝 Contribuir

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

---

*Desarrollado con ❤️ para la gestión profesional de sitios WordPress*
