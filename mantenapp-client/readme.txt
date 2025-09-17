=== MantenApp Cliente ===
Contributors: mantenapp
Tags: maintenance, monitoring, client, sync, management
Requires at least: 5.0
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Plugin cliente para conectar tu sitio WordPress con la plataforma de mantenimiento MantenApp.

== Description ==

MantenApp Cliente es un plugin ligero y eficiente que permite conectar tu sitio WordPress con la plataforma de mantenimiento MantenApp. Este plugin recopila información importante de tu sitio y la envía de forma segura al sistema administrativo para su monitoreo y gestión.

= Características Principales =

* **Recopilación Automática de Datos**: Obtiene información sobre plugins, temas, usuarios, contenido, seguridad y rendimiento
* **Sincronización Segura**: Comunicación encriptada con el servidor administrativo
* **Interfaz Intuitiva**: Panel de control simple y fácil de usar
* **Configuración Flexible**: Sincronización manual o automática según tus necesidades
* **Monitoreo de Seguridad**: Detecta posibles vulnerabilidades y problemas de configuración
* **Alertas Inteligentes**: Sistema de notificaciones para actualizaciones y problemas críticos

= Datos Recopilados =

El plugin recopila la siguiente información de tu sitio:

* **Información del Sitio**: Versión de WordPress, PHP, MySQL, tema activo
* **Plugins**: Lista de plugins instalados y su estado
* **Temas**: Temas disponibles y configuración actual
* **Usuarios**: Estadísticas de usuarios (sin información personal)
* **Contenido**: Cantidad de posts, páginas, comentarios y medios
* **Seguridad**: Estado de SSL, configuraciones de seguridad
* **Rendimiento**: Uso de memoria, límites de PHP
* **Actualizaciones**: Disponibilidad de actualizaciones para core, plugins y temas

= Seguridad y Privacidad =

* Los datos se transmiten de forma encriptada (HTTPS)
* No se recopila información personal de usuarios
* Autenticación mediante clave API única
* Cumple con estándares de privacidad y GDPR

== Installation ==

= Instalación Automática =

1. Ve a Plugins > Agregar nuevo en tu panel de WordPress
2. Busca "MantenApp Cliente"
3. Haz clic en "Instalar ahora" y luego en "Activar"

= Instalación Manual =

1. Descarga el archivo ZIP del plugin
2. Ve a Plugins > Agregar nuevo > Subir plugin
3. Selecciona el archivo ZIP y haz clic en "Instalar ahora"
4. Activa el plugin

= Configuración =

1. Ve a Configuración > MantenApp Cliente
2. Ingresa la URL del servidor administrativo
3. Introduce la clave API proporcionada por tu administrador
4. Configura las opciones de sincronización
5. Haz clic en "Probar Conexión" para verificar la configuración
6. Guarda los cambios y realiza tu primera sincronización

== Frequently Asked Questions ==

= ¿Qué información recopila el plugin? =

El plugin recopila información técnica sobre tu sitio WordPress, incluyendo versiones de software, plugins instalados, configuraciones de seguridad y estadísticas de contenido. No se recopila información personal de usuarios.

= ¿Es seguro usar este plugin? =

Sí, el plugin utiliza conexiones HTTPS encriptadas y autenticación por clave API. Toda la información se transmite de forma segura y no se almacena información sensible localmente.

= ¿Afecta el rendimiento de mi sitio? =

No, el plugin está diseñado para ser ligero y no intrusivo. La recopilación de datos se realiza de forma eficiente y no afecta la velocidad de carga de tu sitio.

= ¿Puedo controlar qué datos se envían? =

Actualmente el plugin envía un conjunto predefinido de datos técnicos necesarios para el monitoreo. En futuras versiones se incluirán opciones de personalización.

= ¿Con qué frecuencia se sincronizan los datos? =

Puedes configurar la sincronización automática desde cada hora hasta semanalmente, o realizar sincronizaciones manuales cuando lo desees.

= ¿Qué pasa si cambio de servidor administrativo? =

Simplemente actualiza la URL del servidor en la configuración del plugin y obtén una nueva clave API del nuevo administrador.

== Screenshots ==

1. Panel principal de configuración
2. Estado de conexión y última sincronización
3. Información del sitio recopilada
4. Configuración de sincronización automática

== Changelog ==

= 1.0.0 =
* Lanzamiento inicial
* Recopilación completa de datos del sitio
* Sincronización automática y manual
* Interfaz de usuario intuitiva
* Sistema de autenticación por API key
* Monitoreo de seguridad básico
* Detección de actualizaciones disponibles

== Upgrade Notice ==

= 1.0.0 =
Primera versión del plugin MantenApp Cliente. Instala para comenzar a monitorear tu sitio WordPress.

== Support ==

Para soporte técnico y documentación:

* Documentación: https://docs.mantenapp.com
* Soporte: soporte@mantenapp.com
* GitHub: https://github.com/mantenapp/client

== Privacy Policy ==

MantenApp Cliente recopila información técnica de tu sitio WordPress para propósitos de monitoreo y mantenimiento. No se recopila información personal de usuarios. Todos los datos se transmiten de forma encriptada y se procesan según nuestras políticas de privacidad.

Para más información, consulta nuestra política de privacidad completa en: https://mantenapp.com/privacy
