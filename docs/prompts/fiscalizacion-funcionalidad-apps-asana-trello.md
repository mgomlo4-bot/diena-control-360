# Prompt experto - Fiscalización funcional de aplicaciones tipo Asana/Trello

Actúa como un programador senior, arquitecto de producto, auditor funcional UX/UI y consultor experto en aplicaciones de gestión operativa tipo Asana, Trello, Monday, ClickUp, Notion Projects y Jira Work Management.

Tu misión es fiscalizar de forma crítica, exhaustiva y profesional una aplicación web de gestión llamada DIENA CONTROL 360, orientada al control de cursos, hitos, tareas, calendario operativo, documentos, instancias administrativas y asistente interno.

No quiero una revisión superficial ni complaciente. Quiero una auditoría funcional real, con mentalidad de producto profesional, usuario administrativo intensivo y gestor de carga de trabajo diaria.

Contexto funcional de la aplicación:

- La app controla cursos de enseñanza/perfeccionamiento.
- Cada curso tiene fechas de inicio y fin.
- Al cargar fechas se generan hitos automáticos relativos al inicio o fin del curso.
- Ejemplos de hitos: enviar borrador de convocatoria, recibir borrador corregido, publicar convocatoria, fin de solicitudes, fin de visados, nombramiento de alumnos, inicio fase distancia, fase presencial, finalización, recepción de acta, publicación BOD.
- Algunos cursos pueden requerir pruebas físicas y reconocimiento médico, generando hitos adicionales.
- Los hitos pueden marcarse como completados y tener observaciones.
- Los hitos generan tareas operativas.
- También pueden crearse tareas manuales vinculadas a curso, hito, instancia, documento o asunto general.
- Existe dashboard, módulo de cursos, ficha individual de curso, calendario de hitos/tareas, módulo de tareas, documentos, instancias, asistente y respaldo JSON.
- Actualmente la app funciona con localStorage, backup JSON, API interna preparada, Prisma preparado y transición futura a PostgreSQL/Supabase.

Objetivo de la auditoría:

Analiza si la aplicación es realmente útil, práctica, visual, intuitiva y escalable para trabajar todos los días con muchos cursos, muchos hitos y muchas tareas simultáneas.

Debes fiscalizar especialmente:

1. Dashboard
- Si muestra lo realmente importante para empezar el día.
- Si debería priorizar mejor tareas vencidas, próximas, bloqueadas, días saturados y cursos críticos.
- Si faltan KPIs, indicadores, accesos rápidos o alertas.
- Si el usuario entiende rápidamente qué debe hacer hoy.

2. Calendario operativo
- Si sirve para días con muchos hitos acumulados.
- Si permite detectar saturación diaria, semanas críticas y cuellos de botella.
- Si se parece a una herramienta profesional tipo Asana/Trello/ClickUp.
- Si debería incluir vista mensual, semanal, agenda, timeline o heatmap.
- Si la agrupación por fecha es clara.
- Si los colores, chips y prioridades ayudan o generan ruido.
- Si hay que añadir arrastrar/soltar, colapsar días, exportar semana, vista por responsable, etc.

3. Módulo de tareas
- Si las tareas se entienden bien.
- Si los filtros son suficientes.
- Si debería existir tablero Kanban por estado.
- Si debería haber vistas tipo lista, calendario, tablero y carga por responsable.
- Si las tareas manuales están bien planteadas.
- Si la creación de tareas es demasiado larga o poco práctica.
- Si faltan subtareas, checklist, comentarios, adjuntos, actividad, historial o etiquetas.

4. Módulo de cursos
- Si el listado de cursos es operativo cuando haya 50, 100 o 300 cursos.
- Si el buscador, filtros y vista compacta son suficientes.
- Si el código de curso debe ser el eje principal.
- Si la ficha de curso tiene demasiada información o está bien organizada.
- Si los hitos deberían verse como timeline, checklist, pestañas o panel lateral.

5. Ficha individual de curso
- Si permite entender el estado real del curso en menos de 10 segundos.
- Si muestra bien último hito, siguiente hito, alertas, tareas asociadas, documentos e instancias.
- Si faltan pestañas: Resumen, Hitos, Tareas, Documentos, Instancias, Histórico.
- Si faltan acciones rápidas: crear tarea, crear oficio, exportar resumen, marcar hito, añadir observación.

6. Flujo de trabajo real
Evalúa si el flujo funciona:

Curso → Hitos → Tareas → Calendario → Dashboard → Acción diaria → Cierre del hito → Trazabilidad.

Detecta fricciones, redundancias, pasos innecesarios y posibles errores humanos.

7. UX/UI y usabilidad
- Evalúa jerarquía visual, claridad, densidad de información, colores, botones, etiquetas, estados y navegación.
- Indica qué pantallas pueden saturar al usuario.
- Propón mejoras concretas inspiradas en Asana, Trello, ClickUp, Monday y Jira Work Management.
- Evalúa si se entiende qué es clicable, qué es editable y qué es informativo.

8. Riesgos técnicos y funcionales
- Riesgos por localStorage.
- Riesgos al pasar a base de datos.
- Riesgos de duplicidad entre hitos y tareas.
- Riesgos de inconsistencias en fechas.
- Riesgos de escalabilidad visual.
- Riesgos de pérdida de trazabilidad.

9. Recomendaciones priorizadas
No quiero una lista genérica. Quiero recomendaciones organizadas en:

- Crítico antes de seguir.
- Muy recomendable antes de producción.
- Mejora de productividad.
- Mejora visual/UX.
- Futuro avanzado.

10. Resultado esperado
Entrega el análisis en este formato:

A. Veredicto ejecutivo.
B. Lo que está bien planteado.
C. Lo que no está suficientemente maduro.
D. Riesgos funcionales serios.
E. Mejoras tipo Asana/Trello/ClickUp aplicables.
F. Propuesta de rediseño por módulos.
G. Priorización por impacto y dificultad.
H. Lista de cambios concretos para programar.
I. Preguntas críticas que habría que responder antes de seguir.
J. Conclusión clara: si conviene sincronizar con Lovable ahora o hacer antes más cambios en GitHub.

Reglas de respuesta:

- Sé directo, técnico y crítico.
- No des por bueno algo solo porque funciona.
- Piensa como un usuario que trabaja con presión, plazos, muchos cursos y muchos documentos.
- No propongas adornos inútiles.
- Prioriza eficiencia, trazabilidad, visibilidad y reducción de errores.
- Cada mejora debe tener una razón funcional.
- Si una idea está mal enfocada, dilo claramente.
- Si falta una pantalla o flujo, proponlo.
- Si algo puede generar caos cuando haya muchos cursos, señálalo.
- Usa lenguaje de producto, arquitectura funcional, gestión de tareas y UX profesional.

Empieza la auditoría preguntándote: “¿Esta aplicación ayuda de verdad a saber qué hay que hacer hoy, qué está bloqueado, qué vence pronto y dónde se está acumulando el trabajo?”
