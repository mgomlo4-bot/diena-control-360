# DIENA Control 360 como web app online

## Principio rector

DIENA Control 360 se plantea como una **web app online privada**, no como una aplicación instalable.

El usuario final debe poder utilizarla únicamente con:

1. Navegador moderno.
2. URL estable.
3. Usuario autorizado.

## Flujo previsto

```text
Usuario autorizado
  ↓
Accede a la URL online
  ↓
Inicia sesión
  ↓
Gestiona cursos, hitos, instancias, tareas, documentos e importaciones
  ↓
La información queda centralizada en PostgreSQL mediante Prisma
```

## Qué no debe hacer el usuario final

El usuario final no debe:

- Instalar Node.js.
- Clonar GitHub.
- Ejecutar `npm install`.
- Ejecutar `npm run dev`.
- Configurar variables de entorno.
- Manipular Prisma o PostgreSQL.

## Qué corresponde al entorno técnico

Las siguientes tareas son propias del despliegue o mantenimiento:

- Instalación de dependencias.
- Generación del cliente Prisma.
- Build de Next.js.
- Migraciones de base de datos.
- Configuración de variables de entorno.
- Revisión de seguridad.
- Publicación en hosting online.

## Arquitectura objetivo

```text
Next.js App Router
  ↓
Hosting online, preferentemente Vercel
  ↓
PostgreSQL gestionado
  ↓
Prisma ORM
  ↓
Autenticación propia AppUser/AppSession
  ↓
Roles, auditoría y trazabilidad
```

## Criterio de aceptación

La app podrá considerarse lista para uso online interno cuando:

- Exista URL estable.
- El build pase automáticamente en CI.
- La base de datos esté en PostgreSQL gestionado.
- `DATABASE_URL` esté configurada como secreto.
- La autenticación esté activa.
- Las sesiones estén protegidas.
- Los usuarios tengan roles.
- El modelo `AuditLog` registre acciones relevantes.
- No haya documentos reales ni datos personales versionados en GitHub.
