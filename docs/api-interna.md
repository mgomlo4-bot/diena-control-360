# DIENA CONTROL 360 - API interna

## Estado

La API interna queda preparada para funcionar con Prisma/PostgreSQL.

El frontend sigue trabajando en modo `localStorage` hasta que se active la transición en `lib/dataSource.ts`.

## Cursos

### GET /api/courses

Devuelve cursos con hitos y tareas.

### POST /api/courses

Crea un curso.

Campos principales:

- `code`
- `name`
- `status`
- `type`
- `modality`
- `school`
- `startDate`
- `endDate`
- `active`
- `requiresMedicalAndPhysical`
- `appointedStudents`
- `droppedStudents`
- `graduatedStudents`
- `graduatedWomen`
- `observations`

### GET /api/courses/[id]

Devuelve un curso completo con:

- hitos
- tareas
- instancias
- documentos

### PATCH /api/courses/[id]

Actualiza un curso.

### DELETE /api/courses/[id]

Elimina un curso.

## Hitos

### GET /api/courses/[id]/milestones

Devuelve los hitos de un curso.

### POST /api/courses/[id]/milestones

Crea un hito vinculado a un curso.

### PATCH /api/milestones/[id]

Actualiza un hito.

Uso principal:

- marcar completado
- desmarcar completado
- actualizar observaciones
- modificar fecha calculada

### DELETE /api/milestones/[id]

Elimina un hito.

## Tareas

### GET /api/tasks

Devuelve tareas con sus relaciones.

### POST /api/tasks

Crea una tarea.

Campos principales:

- `title`
- `description`
- `courseId`
- `milestoneId`
- `requestId`
- `documentId`
- `dueDate`
- `priority`
- `status`
- `responsible`
- `source`
- `linkType`
- `relatedLabel`

### GET /api/tasks/[id]

Devuelve una tarea concreta.

### PATCH /api/tasks/[id]

Actualiza una tarea.

### DELETE /api/tasks/[id]

Elimina una tarea.

## Próximo paso

Crear una capa cliente `lib/apiClient.ts` con funciones:

- `fetchCourses()`
- `createCourse()`
- `updateCourse()`
- `fetchTasks()`
- `createTask()`
- `updateTask()`
- `deleteTask()`

Después, modificar progresivamente el frontend para que pueda alternar entre:

- `localStorage`
- `database`

según `lib/dataSource.ts`.
