# 💰 Despliegue Económico - MantenApp con PostgreSQL

## 🎯 Stack Unificado Recomendado

```
📱 Frontend: React + Vite + TypeScript + Tailwind CSS
🔧 Backend: Node.js + Express + TypeScript
🗄️ Base de Datos: PostgreSQL (desarrollo Y producción)
🔐 Autenticación: JWT + bcrypt
📊 ORM: Prisma (excelente con PostgreSQL)
```

## 🆓 Opciones GRATUITAS

### **Opción 1: Completamente Gratis (Recomendada para empezar)**

#### Frontend - Vercel (GRATIS)
- ✅ **Costo**: $0/mes
- ✅ **Límites**: 100GB bandwidth, builds ilimitados
- ✅ **Características**: 
  - Deploy automático desde Git
  - CDN global
  - Dominio personalizado gratis
  - SSL automático
- ✅ **Perfecto para**: React + Vite

#### Backend - Railway (GRATIS)
- ✅ **Costo**: $0/mes
- ✅ **Límites**: $5 crédito mensual (suficiente para desarrollo)
- ✅ **Características**:
  - Deploy desde Git
  - Variables de entorno
  - Logs en tiempo real
  - Escalado automático
- ✅ **Perfecto para**: Node.js + Express

#### Base de Datos - Supabase (GRATIS)
- ✅ **Costo**: $0/mes
- ✅ **Límites**: 
  - 500MB almacenamiento
  - 2GB transferencia/mes
  - Hasta 50,000 usuarios autenticados
- ✅ **Características**:
  - PostgreSQL completo
  - Dashboard web
  - API REST automática
  - Backups automáticos
  - Auth integrado (opcional)

**💡 Total mensual: $0**

---

### **Opción 2: Tier Gratuito Extendido**

#### Frontend - Netlify (GRATIS)
- ✅ **Costo**: $0/mes
- ✅ **Límites**: 100GB bandwidth, 300 build minutes
- ✅ **Alternativa a Vercel**

#### Backend - Render (GRATIS)
- ✅ **Costo**: $0/mes
- ✅ **Límites**: Se duerme después de 15 min inactividad
- ✅ **Características**: Similar a Railway
- ❌ **Desventaja**: Tiempo de arranque lento

#### Base de Datos - Neon (GRATIS)
- ✅ **Costo**: $0/mes
- ✅ **Límites**: 
  - 3GB almacenamiento
  - 1 base de datos
  - Serverless PostgreSQL
- ✅ **Características**:
  - PostgreSQL moderno
  - Branching de base de datos
  - Escalado automático

**💡 Total mensual: $0**

---

## 💵 Opciones de BAJO COSTO (Cuando crezcas)

### **Opción 3: Producción Seria (~$15-25/mes)**

#### Frontend - Vercel Pro
- 💰 **Costo**: $20/mes
- ✅ **Beneficios**: 
  - 1TB bandwidth
  - Analytics avanzados
  - Soporte prioritario

#### Backend - Railway Pro
- 💰 **Costo**: $5/mes + uso
- ✅ **Beneficios**:
  - Sin límites de crédito
  - Métricas avanzadas
  - Múltiples proyectos

#### Base de Datos - Supabase Pro
- 💰 **Costo**: $25/mes
- ✅ **Beneficios**:
  - 8GB almacenamiento
  - 250GB transferencia
  - Backups point-in-time
  - Soporte por email

**💡 Total mensual: ~$50/mes**

---

### **Opción 4: Ultra Económica (~$10/mes)**

#### Todo en DigitalOcean Droplet
- 💰 **Costo**: $6/mes (droplet básico)
- ✅ **Incluye**:
  - 1GB RAM, 1 vCPU
  - 25GB SSD
  - 1TB transferencia
- ✅ **Instalas**:
  - Nginx (frontend estático)
  - Node.js (backend)
  - PostgreSQL (base de datos)
- ❌ **Desventaja**: Más configuración manual

**💡 Total mensual: $6/mes**

---

## 🏗️ Configuración de Desarrollo Local

### Instalar PostgreSQL Localmente

#### macOS (con Homebrew)
```bash
# Instalar PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# Crear base de datos
createdb mantenapp_dev
```

#### Ubuntu/Debian
```bash
# Instalar PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Configurar usuario
sudo -u postgres createuser --interactive
sudo -u postgres createdb mantenapp_dev
```

#### Windows
```bash
# Usar Docker (más fácil)
docker run --name postgres-dev \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=mantenapp_dev \
  -p 5432:5432 \
  -d postgres:15
```

### Configuración Unificada

#### Variables de Entorno (.env)
```env
# Desarrollo
DATABASE_URL="postgresql://user:password@localhost:5432/mantenapp_dev"

# Producción (Supabase ejemplo)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# JWT
JWT_SECRET="your-super-secret-key"

# API
PORT=3000
NODE_ENV=development
```

#### Prisma Schema (schema.prisma)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Client {
  id        String   @id @default(cuid())
  siteName  String
  siteUrl   String   @unique
  apiKey    String   @unique
  status    String   @default("active")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  siteData SiteData[]
  alerts   Alert[]
  
  @@map("clients")
}

model SiteData {
  id          String   @id @default(cuid())
  clientId    String
  dataType    String
  dataContent Json
  collectedAt DateTime @default(now())
  
  client Client @relation(fields: [clientId], references: [id], onDelete: Cascade)
  
  @@map("site_data")
}

model Alert {
  id         String    @id @default(cuid())
  clientId   String
  alertType  String
  severity   String
  title      String
  message    String
  status     String    @default("active")
  createdAt  DateTime  @default(now())
  resolvedAt DateTime?
  
  client Client @relation(fields: [clientId], references: [id], onDelete: Cascade)
  
  @@map("alerts")
}
```

---

## 🚀 Plan de Migración Económica

### Fase 1: Desarrollo (GRATIS)
```
Local: PostgreSQL en tu máquina
Deploy: Vercel + Railway + Supabase (tier gratuito)
Costo: $0/mes
```

### Fase 2: Primeros Clientes ($0-15/mes)
```
Mantener tier gratuito hasta alcanzar límites
Monitorear uso en dashboards
Costo: $0-15/mes
```

### Fase 3: Crecimiento ($25-50/mes)
```
Upgrade a tiers pagos según necesidad
Optimizar costos según métricas reales
Costo: $25-50/mes
```

### Fase 4: Escala ($100+/mes)
```
Migrar a infraestructura dedicada si es necesario
Considerar AWS/GCP para mayor control
Costo: Variable según escala
```

---

## 💡 Consejos para Minimizar Costos

### 1. **Optimización de Base de Datos**
```sql
-- Índices eficientes
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_alerts_client_status ON alerts(client_id, status);

-- Limpieza automática de datos antiguos
DELETE FROM site_data WHERE collected_at < NOW() - INTERVAL '90 days';
```

### 2. **Caching Inteligente**
```javascript
// Redis para cache (opcional)
// O cache en memoria para desarrollo
const cache = new Map();

app.get('/api/stats', (req, res) => {
  const cached = cache.get('stats');
  if (cached && Date.now() - cached.timestamp < 300000) { // 5 min
    return res.json(cached.data);
  }
  
  // Generar stats y cachear
  const stats = generateStats();
  cache.set('stats', { data: stats, timestamp: Date.now() });
  res.json(stats);
});
```

### 3. **Monitoreo de Costos**
- Configurar alertas en cada plataforma
- Revisar métricas semanalmente
- Optimizar consultas lentas

---

## 🎯 **Recomendación Final**

Para MantenApp, te recomiendo empezar con:

```
🆓 GRATIS TOTAL:
Frontend: Vercel (gratis)
Backend: Railway (gratis, $5 crédito mensual)
Base de Datos: Supabase (gratis, 500MB)
Desarrollo: PostgreSQL local

📈 CUANDO CREZCAS:
Supabase Pro ($25/mes) para más almacenamiento
Railway Pro ($5/mes + uso) para mejor rendimiento
```

**Ventajas de esta configuración:**
- ✅ PostgreSQL en desarrollo Y producción (consistencia total)
- ✅ Costo inicial: $0
- ✅ Escalabilidad clara cuando sea necesario
- ✅ Herramientas modernas y profesionales
- ✅ Fácil de mantener y monitorear

¿Te parece bien esta configuración? ¿Quieres que proceda con la implementación usando este stack?
