# Plataforma de Mantenimiento WordPress

Una plataforma completa de mantenimiento para sitios WordPress que consta de:

## Estructura del Proyecto

### 📁 mantenapp-client/
Plugin cliente que se instala en los sitios WordPress de los clientes para recopilar datos y enviarlos al sistema de administración centralizado.

### 🌐 mantenapp-admin/ (Aplicación Web Independiente)
Aplicación web moderna desarrollada con React + Vite que recibe y procesa los datos de los clientes, proporcionando una interfaz completa de gestión y mantenimiento.

## Características

- **Interfaz Hermosa**: Diseño moderno con React y componentes visuales avanzados
- **UX/UI Simple**: Experiencia de usuario intuitiva y eficaz
- **Arquitectura Escalable**: Aplicación web independiente preparada para futuras funcionalidades
- **Comunicación Segura**: API REST robusta para transferencia segura de datos
- **Tecnología Moderna**: React + Vite para máximo rendimiento y escalabilidad

## Arquitectura

### Plugin Cliente (WordPress)
- Ligero y no intrusivo
- Recopila datos del sitio WordPress
- Envía información vía API REST al sistema admin

### Aplicación Admin (Web App)
- Aplicación React independiente
- Backend robusto (Node.js/PHP/Python)
- Base de datos optimizada
- Dashboard moderno y responsive
- Sistema de alertas en tiempo real

## Instalación

### Plugin Cliente
1. Subir la carpeta `mantenapp-client` al directorio `/wp-content/plugins/`
2. Activar el plugin desde el panel de administración de WordPress
3. Configurar la URL del servidor admin y clave API

### Aplicación Admin
1. Desplegar la aplicación web en servidor independiente
2. Configurar base de datos
3. Configurar variables de entorno
4. Acceder vía navegador web

## Desarrollo

Este proyecto utiliza tecnologías modernas para máxima escalabilidad:
- **Frontend**: React + Vite + TypeScript
- **Backend**: API REST robusta
- **Base de Datos**: Optimizada para alto rendimiento
- **Despliegue**: Aplicación web independiente

---
*Desarrollado con ❤️ para la gestión profesional de sitios WordPress*
