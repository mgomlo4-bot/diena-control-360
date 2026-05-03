# DIENA Control 360 como web app

## Principio operativo

DIENA Control 360 debe funcionar como una web app centralizada. Los usuarios finales no deben instalar ninguna aplicación, extensión, ejecutable ni dependencia en los ordenadores del Estado.

El acceso de usuario se realizará exclusivamente mediante navegador web y credenciales internas de usuario y contraseña.

## Arquitectura objetivo

- Aplicación Next.js desplegada en servidor o plataforma web autorizada.
- Base de datos PostgreSQL centralizada.
- Autenticación interna mediante usuario y contraseña.
- Gestión de usuarios desde la propia web, en `/usuarios`.
- Importación de datos desde la web, en `/importar`.
- Exportación Excel desde la web, en `/exportar`.
- Sin instalación local en equipos cliente.

## Variables de entorno necesarias

```env
DATABASE_URL="postgresql://usuario:password@host:puerto/base"
INITIAL_ADMIN_TOKEN="token-largo-privado-para-setup-inicial"
NEXT_PUBLIC_DATA_SOURCE_MODE="database"
```

`NEXT_PUBLIC_DATA_SOURCE_MODE` queda preparado para usar `database` por defecto. El modo `localStorage` debe reservarse únicamente para pruebas o prototipo aislado.

## Flujo de primera puesta en marcha

1. Desplegar la aplicación en servidor.
2. Configurar `DATABASE_URL`.
3. Configurar `INITIAL_ADMIN_TOKEN`.
4. Ejecutar migraciones Prisma en servidor.
5. Entrar en `/setup`.
6. Crear el primer usuario administrador.
7. Entrar en `/login`.
8. Gestionar usuarios desde `/usuarios`.

## Migración Prisma

Tras incorporar autenticación y estadísticas ampliadas de curso:

```bash
npx prisma migrate deploy
```

En entorno de desarrollo puede usarse:

```bash
npx prisma migrate dev --name add_auth_users_and_course_statistics
```

## Restricciones para equipos de usuario

Los usuarios finales solo necesitan:

- navegador web moderno;
- conexión a la URL interna o autorizada de la aplicación;
- usuario y contraseña creados por el administrador.

No deben necesitar:

- Node.js;
- npm;
- Prisma;
- PostgreSQL local;
- instaladores;
- extensiones del navegador;
- acceso al repositorio GitHub;
- comandos de terminal.

## Funciones web integradas

- Login por usuario y contraseña.
- Control de usuarios y accesos por administrador.
- Dashboard y control de cursos.
- Fichas completas de cursos.
- Fichas completas de instancias.
- Importación CSV desde navegador.
- Exportación Excel desde navegador.
- Asistente IA operativo sobre datos cargados.
- Tareas persistidas.

## Criterio de seguridad

La aplicación no tendrá registro público. Solo un administrador puede crear usuarios y retirar accesos.

Las contraseñas se guardan hasheadas. Las sesiones se almacenan mediante token aleatorio y cookie httpOnly.

## Nota para despliegue real

El despliegue definitivo deberá realizarse en infraestructura compatible con Next.js y PostgreSQL, preferentemente dentro de un entorno controlado/autorizado. El ordenador cliente no ejecuta la aplicación: únicamente visualiza la web servida desde el servidor.
