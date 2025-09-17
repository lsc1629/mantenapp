#!/bin/bash

# Script de Deploy para MantenApp
# Uso: ./deploy.sh [development|staging|production]

set -e

ENVIRONMENT=${1:-production}
PROJECT_NAME="mantenapp"

echo "🚀 Iniciando deploy de MantenApp en ambiente: $ENVIRONMENT"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# Verificar que Docker está instalado
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado. Por favor instala Docker primero."
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
fi

# Verificar archivo de configuración
ENV_FILE=".env.${ENVIRONMENT}"
if [ ! -f "$ENV_FILE" ]; then
    warn "Archivo $ENV_FILE no encontrado. Creando uno básico..."
    
    case $ENVIRONMENT in
        "production")
            cat > "$ENV_FILE" << EOF
# Configuración de Producción
DB_PASSWORD=mantenapp_secure_password_2024
JWT_SECRET=jwt-secret-super-seguro-para-produccion-2024
FRONTEND_URL=https://admin.mantenapp.com
API_URL=https://api.mantenapp.com
EOF
            ;;
        "staging")
            cat > "$ENV_FILE" << EOF
# Configuración de Staging
DB_PASSWORD=mantenapp_staging_password_2024
JWT_SECRET=jwt-secret-staging-2024
FRONTEND_URL=https://staging.mantenapp.com
API_URL=https://staging-api.mantenapp.com
EOF
            ;;
        *)
            cat > "$ENV_FILE" << EOF
# Configuración de Desarrollo
DB_PASSWORD=mantenapp_dev_password
JWT_SECRET=jwt-secret-dev
FRONTEND_URL=http://localhost:5174
API_URL=http://localhost:3001
EOF
            ;;
    esac
    
    warn "Por favor revisa y actualiza $ENV_FILE con tus configuraciones reales."
    read -p "¿Continuar con el deploy? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

log "Usando configuración: $ENV_FILE"

# Parar contenedores existentes
log "Parando contenedores existentes..."
docker-compose -f docker-compose.prod.yml --env-file "$ENV_FILE" down

# Limpiar imágenes antiguas (opcional)
if [ "$2" = "--clean" ]; then
    log "Limpiando imágenes antiguas..."
    docker system prune -f
    docker image prune -f
fi

# Build y deploy
log "Construyendo y desplegando contenedores..."
docker-compose -f docker-compose.prod.yml --env-file "$ENV_FILE" up --build -d

# Esperar a que los servicios estén listos
log "Esperando a que los servicios estén listos..."
sleep 10

# Ejecutar migraciones de base de datos
log "Ejecutando migraciones de base de datos..."
docker-compose -f docker-compose.prod.yml --env-file "$ENV_FILE" exec backend npm run db:migrate

# Verificar salud de los servicios
log "Verificando salud de los servicios..."

# Backend
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    log "✅ Backend está funcionando correctamente"
else
    error "❌ Backend no responde en http://localhost:3001/health"
fi

# Frontend
if curl -f http://localhost/health > /dev/null 2>&1; then
    log "✅ Frontend está funcionando correctamente"
else
    warn "⚠️  Frontend podría no estar respondiendo en http://localhost/health"
fi

# Base de datos
if docker-compose -f docker-compose.prod.yml --env-file "$ENV_FILE" exec postgres pg_isready -U mantenapp_user -d mantenapp_prod > /dev/null 2>&1; then
    log "✅ Base de datos está funcionando correctamente"
else
    error "❌ Base de datos no está disponible"
fi

# Mostrar logs recientes
log "Últimos logs del backend:"
docker-compose -f docker-compose.prod.yml --env-file "$ENV_FILE" logs --tail=10 backend

log "Últimos logs del frontend:"
docker-compose -f docker-compose.prod.yml --env-file "$ENV_FILE" logs --tail=10 frontend

# Información final
echo
log "🎉 Deploy completado exitosamente!"
echo
echo -e "${BLUE}📊 URLs de acceso:${NC}"
echo -e "  Frontend: ${GREEN}http://localhost${NC}"
echo -e "  Backend:  ${GREEN}http://localhost:3001${NC}"
echo -e "  API Docs: ${GREEN}http://localhost:3001/health${NC}"
echo
echo -e "${BLUE}🔧 Comandos útiles:${NC}"
echo -e "  Ver logs:     ${YELLOW}docker-compose -f docker-compose.prod.yml logs -f${NC}"
echo -e "  Parar:        ${YELLOW}docker-compose -f docker-compose.prod.yml down${NC}"
echo -e "  Reiniciar:    ${YELLOW}docker-compose -f docker-compose.prod.yml restart${NC}"
echo -e "  Shell backend: ${YELLOW}docker-compose -f docker-compose.prod.yml exec backend sh${NC}"
echo

log "¡MantenApp está listo para usar en $ENVIRONMENT!"
