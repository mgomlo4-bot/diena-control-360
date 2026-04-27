import { Course, getLastCompletedMilestone, getNextPendingMilestone, isMilestoneOverdue } from './courseMilestones';

function csvEscape(value: string | number | boolean): string {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

export function coursesToCsv(courses: Course[]): string {
  const headers = [
    'Codigo',
    'Nombre',
    'Estado',
    'Tipo',
    'Modalidad',
    'Escuela',
    'Inicio',
    'Fin',
    'Activo',
    'Ultimo hito completado',
    'Siguiente hito pendiente',
    'Fecha siguiente hito',
    'Aviso',
  ];

  const rows = courses.map((course) => {
    const last = getLastCompletedMilestone(course.milestones);
    const next = getNextPendingMilestone(course.milestones);
    return [
      course.code,
      course.name,
      course.status,
      course.type,
      course.modality,
      course.school,
      course.startDate,
      course.endDate,
      course.active ? 'SI' : 'NO',
      last?.name ?? 'Sin hitos completados',
      next?.name ?? 'Seguimiento completado',
      next?.calculatedDate ?? '',
      next ? (isMilestoneOverdue(next) ? 'Vencido' : 'Pendiente') : 'Completado',
    ];
  });

  return [headers, ...rows].map((row) => row.map(csvEscape).join(';')).join('\n');
}
