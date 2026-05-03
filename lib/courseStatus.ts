import { Course, CourseMilestone, getNextPendingMilestone, isMilestoneOverdue } from './courseMilestones';
import { normalizeCourseText } from './courseUtils';

export const courseStatusCatalog = [
  'PLANIFICACION',
  'BORRADOR CONVOCATORIA',
  'CONVOCATORIA PENDIENTE BOD',
  'CONVOCADO',
  'SOLICITUDES ABIERTAS',
  'VISADO UNIDADES',
  'PENDIENTE DE NOMBRAMIENTO DE ALUMNOS',
  'NOMBRAMIENTO PENDIENTE BOD',
  'PENDIENTE PRUEBAS FISICAS Y RECONOCIMIENTO MEDICO',
  'ACTIVADO',
  'EN CURSO',
  'FINALIZADO PENDIENTE ACTA',
  'ACTA RECIBIDA PENDIENTE PUBLICACION FINALIZACION',
  'FINALIZACION PENDIENTE BOD',
  'FINALIZADO Y PUBLICADO',
  'CERRADO',
  'APLAZADO',
  'BAJA',
  'CANCELADO',
] as const;

export type CourseStatus = (typeof courseStatusCatalog)[number];
export type OperationalPhase = 'preconvocatoria' | 'convocatoria' | 'nombramiento' | 'ejecucion' | 'finalizacion' | 'cierre' | 'incidencia';

export type CourseStatusOption = {
  value: CourseStatus;
  label: string;
  phase: OperationalPhase;
};

export const courseStatusOptions: CourseStatusOption[] = [
  { value: 'PLANIFICACION', label: 'Planificación', phase: 'preconvocatoria' },
  { value: 'BORRADOR CONVOCATORIA', label: 'Borrador convocatoria', phase: 'preconvocatoria' },
  { value: 'CONVOCATORIA PENDIENTE BOD', label: 'Convocatoria pendiente BOD', phase: 'convocatoria' },
  { value: 'CONVOCADO', label: 'Convocado', phase: 'convocatoria' },
  { value: 'SOLICITUDES ABIERTAS', label: 'Solicitudes abiertas', phase: 'convocatoria' },
  { value: 'VISADO UNIDADES', label: 'Visado unidades', phase: 'convocatoria' },
  { value: 'PENDIENTE DE NOMBRAMIENTO DE ALUMNOS', label: 'Pendiente nombramiento alumnos', phase: 'nombramiento' },
  { value: 'NOMBRAMIENTO PENDIENTE BOD', label: 'Nombramiento pendiente BOD', phase: 'nombramiento' },
  { value: 'PENDIENTE PRUEBAS FISICAS Y RECONOCIMIENTO MEDICO', label: 'Pendiente pruebas físicas / reconocimiento médico', phase: 'nombramiento' },
  { value: 'ACTIVADO', label: 'Activado', phase: 'ejecucion' },
  { value: 'EN CURSO', label: 'En curso', phase: 'ejecucion' },
  { value: 'FINALIZADO PENDIENTE ACTA', label: 'Finalizado pendiente acta', phase: 'finalizacion' },
  { value: 'ACTA RECIBIDA PENDIENTE PUBLICACION FINALIZACION', label: 'Acta recibida pendiente publicación finalización', phase: 'finalizacion' },
  { value: 'FINALIZACION PENDIENTE BOD', label: 'Finalización pendiente BOD', phase: 'finalizacion' },
  { value: 'FINALIZADO Y PUBLICADO', label: 'Finalizado y publicado', phase: 'cierre' },
  { value: 'CERRADO', label: 'Cerrado', phase: 'cierre' },
  { value: 'APLAZADO', label: 'Aplazado', phase: 'incidencia' },
  { value: 'BAJA', label: 'Baja', phase: 'incidencia' },
  { value: 'CANCELADO', label: 'Cancelado', phase: 'incidencia' },
];

export function normalizeStatus(status: string): string {
  return normalizeCourseText(status).replace(/\s+/g, ' ').trim();
}

export function getCourseStatusOption(status: string): CourseStatusOption {
  const normalized = normalizeStatus(status);
  return courseStatusOptions.find((option) => normalizeStatus(option.value) === normalized) ?? {
    value: 'PLANIFICACION',
    label: status || 'Sin estado definido',
    phase: 'preconvocatoria',
  };
}

export function getCourseStatusLabel(status: string): string {
  return getCourseStatusOption(status).label;
}

export function getCoursePhase(status: string): OperationalPhase {
  return getCourseStatusOption(status).phase;
}

export function getMilestone(course: Course, milestoneId: string): CourseMilestone | undefined {
  return course.milestones.find((milestone) => milestone.id === milestoneId);
}

export function isMilestonePending(course: Course, milestoneId: string): boolean {
  const milestone = getMilestone(course, milestoneId);
  return Boolean(milestone && !milestone.completed);
}

export function hasPendingActa(course: Course): boolean {
  return isMilestonePending(course, 'acta-remission') || isMilestonePending(course, 'acta-receive');
}

export function hasPendingFinalizationPublication(course: Course): boolean {
  return isMilestonePending(course, 'bod-finalization') || normalizeStatus(course.status).includes('bod');
}

export function inferAutomaticCourseStatus(course: Course, today = new Date()): CourseStatus {
  const todayIso = today.toISOString().slice(0, 10);
  const next = getNextPendingMilestone(course.milestones);

  if (!course.active) return 'CERRADO';
  if (course.startDate <= todayIso && course.endDate >= todayIso) return 'EN CURSO';
  if (course.endDate < todayIso) {
    if (isMilestonePending(course, 'acta-remission') || isMilestonePending(course, 'acta-receive')) return 'FINALIZADO PENDIENTE ACTA';
    if (isMilestonePending(course, 'bod-finalization')) return 'FINALIZACION PENDIENTE BOD';
    if (isMilestonePending(course, 'admin-close')) return 'FINALIZADO Y PUBLICADO';
    return 'CERRADO';
  }

  if (next?.id === 'draft-send' || next?.id === 'draft-receive') return 'BORRADOR CONVOCATORIA';
  if (next?.id === 'publish-call') return 'CONVOCATORIA PENDIENTE BOD';
  if (next?.id === 'requests-close') return 'SOLICITUDES ABIERTAS';
  if (next?.id === 'visa-close') return 'VISADO UNIDADES';
  if (next?.id === 'medical-physical-results') return 'PENDIENTE PRUEBAS FISICAS Y RECONOCIMIENTO MEDICO';
  if (next?.id === 'appointment-proposal' || next?.id === 'appointment-send') return 'PENDIENTE DE NOMBRAMIENTO DE ALUMNOS';
  if (next?.id === 'course-start') return 'ACTIVADO';

  return isMilestoneOverdue(next) ? 'PLANIFICACION' : 'PLANIFICACION';
}
