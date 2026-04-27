# AGENTS.md - DIENA CONTROL 360

## Rol
Este repositorio corresponde al proyecto DIENA CONTROL 360. Cualquier herramienta o agente que modifique este código debe actuar como integrador entre Lovable y GitHub.

GitHub es la fuente de verdad tecnica. Lovable es el constructor visual rapido.

## Stack
- Next.js 14
- React 18
- TypeScript
- Prisma
- Tailwind CSS
- Recharts
- FullCalendar
- XLSX/PapaParse
- Zod

## Reglas
1. No eliminar funcionalidades existentes sin motivo claro.
2. No renombrar rutas, modelos, componentes o campos clave salvo necesidad justificada.
3. No introducir datos reales sensibles.
4. Usar datos ficticios realistas.
5. Mantener estetica sobria, profesional y administrativa.
6. Priorizar utilidad operativa sobre decoracion.
7. Hacer cambios pequenos e incrementales.
8. Dejar la aplicacion ejecutable tras cada cambio.
9. No mezclar grandes cambios de UI, base de datos y logica en una sola intervencion.
10. Documentar decisiones estructurales importantes.

## Modulos objetivo
- Dashboard principal
- Control de cursos
- Estados normalizados de curso
- Hitos y calendario
- Instancias y expedientes
- Oficios y documentos
- Tareas operativas
- Responsables y centros
- Importaciones Excel/CSV
- Asistente DIENA
- Configuracion y tablas maestras

## Estados normalizados de curso
1. NO ACTIVADO
2. ACTIVADO
3. PENDIENTE DE BORRADOR DE CONVOCATORIA
4. BORRADOR RECIBIDO
5. CONVOCATORIA PENDIENTE DE PUBLICACION
6. CONVOCATORIA PUBLICADA
7. PLAZO DE SOLICITUDES ABIERTO
8. PLAZO DE SOLICITUDES CERRADO
9. PENDIENTE DE VISADO
10. VISADO FINALIZADO
11. PENDIENTE PRUEBAS FISICAS Y RECONOCIMIENTO MEDICO
12. PENDIENTE DE NOMBRAMIENTO DE ALUMNOS
13. ALUMNOS NOMBRADOS
14. FASE A DISTANCIA EN CURSO
15. EXAMEN PREVIO PENDIENTE
16. FASE PRESENCIAL PENDIENTE
17. FASE PRESENCIAL EN CURSO
18. CURSO FINALIZADO
19. PENDIENTE DE ACTA
20. PENDIENTE DE PUBLICACION BOD FINALIZACION
21. FINALIZADO Y PUBLICADO

## Flujo Lovable-GitHub
Cuando se trabaje desde Lovable, pedir cambios concretos, revisar el commit en GitHub y evitar prompts globales que reconstruyan toda la aplicacion.

Cuando se trabaje desde GitHub, mantener compatibilidad con la estructura que Lovable pueda leer y renderizar.

## Ramas recomendadas
- main: version estable sincronizable con Lovable
- dev: integracion previa
- feature/nombre: modulo nuevo
- fix/nombre: correccion concreta
- docs/nombre: documentacion

## Criterio de aceptacion
Un cambio es aceptable si compila, no rompe rutas existentes, mantiene coherencia visual, mejora una funcion concreta y puede revertirse con claridad.

## Prioridad
La prioridad es construir una herramienta operativa real para DIENA: control de cursos, estados, plazos, instancias, documentos, tareas, estadisticas y trazabilidad administrativa.
