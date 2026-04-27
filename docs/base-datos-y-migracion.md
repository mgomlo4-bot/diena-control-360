# DIENA CONTROL 360 - Base de datos y migración

## Estado actual

La aplicación funciona en modo prototipo operativo con `localStorage`.

Datos persistidos localmente:

- Cursos.
- Hitos de curso.
- Checks de hitos completados.
- Observaciones de hitos.
- Tareas manuales.
- Backups JSON.

La capa local está centralizada en:

```txt
lib/localStorage.ts
```

El selector de origen de datos está en:

```txt
lib/dataSource.ts
```

Por ahora:

```ts
export const DATA_SOURCE_MODE = 'localStorage';
```

## Objetivo de la migración

Migrar progresivamente de `localStorage` a PostgreSQL/Supabase usando Prisma sin romper la interfaz existente.

## Esquema Prisma

El esquema base está en:

```txt
prisma/schema.prisma
```

Incluye las siguientes entidades principales:

- `Course`.
- `CourseMilestone`.
- `Task`.
- `AdministrativeRequest`.
- `Document`.
- `AuditLog`.

También incluye enums para estados, prioridades, origen de tareas, tipos documentales y estados de tramitación.

## Variables necesarias

Crear `.env` con:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

En Supabase, usar la cadena PostgreSQL del proyecto.

## Comandos Prisma

Instalar dependencias si no están instaladas:

```bash
npm install
```

Generar cliente Prisma:

```bash
npx prisma generate
```

Crear primera migración:

```bash
npx prisma migrate dev --name init
```

Abrir Prisma Studio:

```bash
npx prisma studio
```

## Orden recomendado de migración

### Fase 1 - No romper nada

Mantener la app usando `localStorage`.

Crear base de datos y migración Prisma.

### Fase 2 - API interna

Crear rutas API:

```txt
app/api/courses/route.ts
app/api/tasks/route.ts
app/api/courses/[id]/route.ts
app/api/courses/[id]/milestones/route.ts
```

### Fase 3 - Migrador desde backup JSON

Usar la pantalla `/respaldo` para exportar JSON y crear importador hacia base de datos.

### Fase 4 - Activar modo database

Cambiar en `lib/dataSource.ts`:

```ts
export const DATA_SOURCE_MODE = 'database';
```

### Fase 5 - Retirar dependencia funcional de localStorage

Mantener `/respaldo` solo como exportación/importación auxiliar.

## Reglas de seguridad

- No guardar DNI completo.
- Usar siempre DNI anonimizado.
- No subir datos personales reales al repositorio.
- La auditoría debe registrar cambios sensibles.
- Las tareas y documentos deben conservar trazabilidad.

## Clave funcional del modelo

El código del curso debe seguir siendo el identificador operativo principal visible.

En base de datos, `Course.id` será identificador interno y `Course.code` será único.

## Próximo paso técnico

Crear rutas API para cursos y tareas manteniendo compatibilidad con los tipos actuales de frontend.
