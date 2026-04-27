# Flujo de trabajo Lovable - GitHub

## Objetivo
Establecer una forma segura de trabajo para que Lovable y GitHub interactuen sin romper DIENA CONTROL 360.

## Papel de cada herramienta

### Lovable
Se usara para construir rapidamente pantallas, componentes visuales, formularios, tablas, filtros y vistas funcionales.

### GitHub
Se usara como fuente de verdad tecnica, control de versiones, revision de cambios, trazabilidad y punto de integracion con otras herramientas.

## Flujo recomendado

1. Pedir a Lovable un cambio pequeno y concreto.
2. Comprobar que la aplicacion sigue funcionando.
3. Revisar el commit generado en GitHub.
4. Si el cambio es correcto, continuar con el siguiente paso.
5. Si el cambio rompe algo, revertir o corregir desde GitHub.

## Ejemplos de buenos prompts para Lovable

### Correcto
Anade al modulo de cursos un filtro por estado normalizado, usando el catalogo de estados existente. No modifiques la estructura general de la pagina.

### Correcto
Crea una tarjeta KPI en el dashboard que muestre el numero de cursos activos. Usa datos mock si no hay base de datos conectada.

### Correcto
Mejora la tabla de cursos para mostrar codigo, nombre, estado, fecha de inicio, escuela responsable y alumnos nombrados.

### Incorrecto
Haz toda la aplicacion completa desde cero.

### Incorrecto
Redisenalo todo y cambia la arquitectura.

## Reglas para cambios grandes
Si se quiere crear un modulo completo, dividirlo en fases:

1. Ruta y pagina base.
2. Datos mock.
3. Tabla o vista principal.
4. Filtros.
5. Formulario.
6. Vista detalle.
7. Conexion futura con base de datos.

## Prioridad actual
La prioridad inicial debe ser consolidar el modulo de control de cursos, porque es el eje del sistema y la base para dashboard, tareas, hitos, instancias y documentos.

## Secuencia de desarrollo recomendada

1. Control de cursos.
2. Estados e indicadores.
3. Dashboard estadistico.
4. Hitos y calendario.
5. Tareas.
6. Instancias.
7. Documentos/oficios.
8. Importaciones Excel/CSV.
9. Asistente DIENA.
10. Configuracion.

## Control de calidad minimo
Antes de aceptar un cambio, comprobar:

- La app compila.
- La ruta afectada carga.
- No desaparecen modulos del menu.
- Los filtros no rompen la tabla.
- Los datos mock son coherentes.
- No hay informacion real sensible.
- El cambio se entiende desde GitHub.
