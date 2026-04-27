import { Course, getNextPendingMilestone, isMilestoneOverdue } from './courseMilestones';
import { normalizeCourseText } from './courseUtils';

export type QuickFilter =
  | 'todos'
  | 'activos'
  | 'vencidos'
  | 'proximos30'
  | 'pendienteBod'
  | 'reconocimientoMedico'
  | 'seguimientoCompletado';

function daysUntil(date: string): number {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const target = new Date(date + 'T00:00:00');
  return Math.ceil((target.getTime() - todayStart.getTime()) / 86400000);
}

export function searchCourses(courses: Course[], query: string): Course[] {
  const cleanQuery = normalizeCourseText(query);
  if (!cleanQuery) return courses;

  return courses.filter((course) => {
    const next = getNextPendingMilestone(course.milestones);
    const text = [
      course.code,
      course.name,
      course.status,
      course.type,
      course.modality,
      course.school,
      next?.name ?? '',
    ]
      .join(' ')
      .toLowerCase();

    return text.includes(cleanQuery);
  });
}

export function applyQuickFilter(courses: Course[], filter: QuickFilter): Course[] {
  if (filter === 'todos') return courses;

  return courses.filter((course) => {
    const next = getNextPendingMilestone(course.milestones);

    if (filter === 'activos') return course.active;
    if (filter === 'vencidos') return isMilestoneOverdue(next);
    if (filter === 'proximos30') return next ? daysUntil(next.calculatedDate) >= 0 && daysUntil(next.calculatedDate) <= 30 : false;
    if (filter === 'pendienteBod') return course.status.toLowerCase().includes('bod') || (next?.name.toLowerCase().includes('bod') ?? false);
    if (filter === 'reconocimientoMedico') return course.requiresMedicalAndPhysical;
    if (filter === 'seguimientoCompletado') return !next;

    return true;
  });
}
