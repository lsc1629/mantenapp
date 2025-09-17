# Dockerfile para MantenApp Frontend

# Etapa de build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Argumentos de build
ARG VITE_API_URL=https://api.mantenapp.com
ENV VITE_API_URL=$VITE_API_URL

# Build de producción
RUN npm run build

# Etapa de producción
FROM nginx:alpine

# Instalar curl para health checks
RUN apk add --no-cache curl

# Copiar archivos build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Crear usuario no-root
RUN addgroup -g 1001 -S nginx
RUN adduser -S nginx -u 1001

# Exponer puerto
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost || exit 1

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]
