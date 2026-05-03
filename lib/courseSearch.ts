import {
  Course,
  getDaysUntil,
  getNextPendingMilestone,
  getPendingFinalizationMilestones,
  isMilestoneOverdue,
} from './courseMilestones';
import {
  CourseStatus,
  OperationalPhase,
  getCoursePhase,
  hasPendingActa,
  hasPendingFinalizationPublication,
  normalizeStatus,
} from './courseStatus';
import { normalizeCourseText } from './courseUtils';

export type QuickFilter =
  | 'todos'
  | 'activos'
  | 'vencidos'
  | 'proximos30'
  | 'pendienteBod'
  | 'reconocimientoMedico'
  | 'seguimientoCompletado'
  | 'enCurso'
  | 'pendienteActa'
  | 'finalizacionPendiente'
  | 'cerrados'
  | 'incidencias';

export type CourseFilterState = {
  query?: string;
  quickFilter?: QuickFilter;
  status?: CourseStatus | 'todos';
  phase?: OperationalPhase | 'todas';
  type?: string | 'todos';
  school?: string | 'todas';
};

export function searchCourses(courses: Course[], query: string): Course[] {
  const cleanQuery = normalizeCourseText(query);
  if (!cleanQuery) return courses;

  return courses.filter((course) => {
    const next = getNextPendingMilestone(course.milestones);
    const finalization = getPendingFinalizationMilestones(course.milestones).map((milestone) => milestone.name).join(' ');
    const text = [
      course.code,
      course.name,
      course.status,
      course.type,
      course.modality,
      course.school,
      next?.name ?? '',
      next?.relativeCode ?? '',
      finalization,
    ]
      .join(' ')
      .toLowerCase();

    return normalizeCourseText(text).includes(cleanQuery);
  });
}

export function applyQuickFilter(courses: Course[], filter: QuickFilter): Course[] {
  if (filter === 'todos') return courses;

  return courses.filter((course) => {
    const next = getNextPendingMilestone(course.milestones);
    const phase = getCoursePhase(course.status);

    if (filter === 'activos') return course.active;
    if (filter === 'vencidos') return isMilestoneOverdue(next);
    if (filter === 'proximos30') return next ? getDaysUntil(next.calculatedDate) >= 0 && getDaysUntil(next.calculatedDate) <= 30 : false;
    if (filter === 'pendienteBod') return hasPendingFinalizationPublication(course) || normalizeStatus(course.status).includes('bod');
    if (filter === 'reconocimientoMedico') return course.requiresMedicalAndPhysical;
    if (filter === 'seguimientoCompletado') return !next;
    if (filter === 'enCurso') return normalizeStatus(course.status) === normalizeStatus('EN CURSO') || phase === 'ejecucion';
    if (filter === 'pendienteActa') return hasPendingActa(course) || normalizeStatus(course.status).includes('acta');
    if (filter === 'finalizacionPendiente') return phase === 'finalizacion' || getPendingFinalizationMilestones(course.milestones).length > 0;
    if (filter === 'cerrados') return phase === 'cierre' || !course.active;
    if (filter === 'incidencias') return phase === 'incidencia';

    return true;
  });
}

export function applyCourseFilters(courses: Course[], filters: CourseFilterState): Course[] {
  let filtered = searchCourses(courses, filters.query ?? '');
  filtered = applyQuickFilter(filtered, filters.quickFilter ?? 'todos');

  if (filters.status && filters.status !== 'todos') {
    filtered = filtered.filter((course) => normalizeStatus(course.status) === normalizeStatus(filters.status as string));
  }

  if (filters.phase && filters.phase !== 'todas') {
    filtered = filtered.filter((course) => getCoursePhase(course.status) === filters.phase);
  }

  if (filters.type && filters.type !== 'todos') {
    filtered = filtered.filter((course) => normalizeCourseText(course.type) === normalizeCourseText(filters.type as string));
  }

  if (filters.school && filters.school !== 'todas') {
    filtered = filtered.filter((course) => normalizeCourseText(course.school) === normalizeCourseText(filters.school as string));
  }

  return filtered;
}

export function getUniqueCourseTypes(courses: Course[]): string[] {
  return [...new Set(courses.map((course) => course.type).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

export function getUniqueCourseSchools(courses: Course[]): string[] {
  return [...new Set(courses.map((course) => course.school).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}
