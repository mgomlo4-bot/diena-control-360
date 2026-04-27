# DIENA CONTROL 360 - Capa de datos

## Objetivo

Permitir que la aplicación pueda funcionar en dos modos:

- `localStorage`: prototipo operativo local actual.
- `database`: base de datos real mediante API interna y Prisma.

## Archivos principales

```txt
lib/dataSource.ts
lib/apiClient.ts
lib/dataRepository.ts
lib/localStorage.ts
```

## Selector de modo

El modo se controla en:

```txt
lib/dataSource.ts
```

Estado actual:

```ts
export const DATA_SOURCE_MODE = 'localStorage';
```

Cuando la base de datos esté configurada y migrada:

```ts
export const DATA_SOURCE_MODE = 'database';
```

## Cliente API

Archivo:

```txt
lib/apiClient.ts
```

Contiene funciones de bajo nivel contra endpoints internos:

- `fetchCoursesFromApi()`
- `fetchCourseFromApi(id)`
- `createCourseInApi(course)`
- `updateCourseInApi(id, course)`
- `deleteCourseInApi(id)`
- `fetchTasksFromApi()`
- `createTaskInApi(task)`
- `updateTaskInApi(id, task)`
- `deleteTaskInApi(id)`
- `updateMilestoneInApi(id, milestone)`

## Repositorio de datos

Archivo:

```txt
lib/dataRepository.ts
```

Es la capa que deben usar progresivamente los componentes.

Funciones principales:

- `getCourses()`
- `getCourse(id)`
- `saveCourses(courses)`
- `createCourse(course)`
- `updateCourse(id, course)`
- `deleteCourse(id)`
- `resetCourses()`
- `getManualTasks()`
- `saveManualTasks(tasks)`
- `createTask(task)`
- `updateTask(id, task)`
- `deleteTask(id)`
- `resetManualTasks()`
- `updateMilestone(id, milestone)`

## Regla de arquitectura

Los componentes de UI no deberían llamar directamente a `fetch`, Prisma o `localStorage`.

Deben usar:

```txt
lib/dataRepository.ts
```

Así el cambio de `localStorage` a `database` será controlado.

## Migración recomendada del frontend

1. Mantener el sistema actual funcionando.
2. Sustituir lecturas directas de `localStorage` por `dataRepository`.
3. Probar en modo `localStorage`.
4. Configurar `DATABASE_URL`.
5. Ejecutar migraciones Prisma.
6. Poblar datos desde backup JSON.
7. Cambiar `DATA_SOURCE_MODE` a `database`.
8. Probar endpoints y pantallas.

## Advertencias

- `saveCourses()` y `saveManualTasks()` son válidas en modo `localStorage`.
- En modo `database`, se deben usar operaciones individuales: create, update, delete.
- En modo `localStorage`, los hitos se actualizan guardando el curso completo.
- En modo `database`, los hitos se actualizan mediante `/api/milestones/[id]`.
