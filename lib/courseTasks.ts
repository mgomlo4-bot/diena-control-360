import { Course, CourseMilestone, getNextPendingMilestone, isMilestoneOverdue } from './courseMilestones';

export type TaskPriority = 'critica' | 'alta' | 'media' | 'baja';
export type TaskStatus = 'pendiente' | 'en_curso' | 'bloqueada' | 'finalizada';

export type CourseTask = {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  milestoneId: string;
  milestoneCode: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  responsible: string;
  source: 'hito_automatico' | 'manual';
};

function daysUntil(date: string): number {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const target = new Date(date + 'T00:00:00');
  return Math.ceil((target.getTime() - todayStart.getTime()) / 86400000);
}

export function getTaskPriority(milestone: CourseMilestone): TaskPriority {
  if (isMilestoneOverdue(milestone)) return 'critica';
  const days = daysUntil(milestone.calculatedDate);
  if (days <= 2) return 'alta';
  if (days <= 7) return 'media';
  return 'baja';
}

export function milestoneToTask(course: Course, milestone: CourseMilestone): CourseTask {
  const priority = getTaskPriority(milestone);
  return {
    id: `${course.id}-${milestone.id}`,
    title: milestone.name,
    description: `Acción derivada del hito ${milestone.relativeCode} del curso ${course.code}.`,
    courseId: course.id,
    courseCode: course.code,
    courseName: course.name,
    milestoneId: milestone.id,
    milestoneCode: milestone.relativeCode,
    dueDate: milestone.calculatedDate,
    priority,
    status: priority === 'critica' ? 'bloqueada' : 'pendiente',
    responsible: 'DIENA - Sección de Perfeccionamiento',
    source: 'hito_automatico',
  };
}

export function getNextActionTask(course: Course): CourseTask | undefined {
  const next = getNextPendingMilestone(course.milestones);
  return next ? milestoneToTask(course, next) : undefined;
}

export function getCourseTasks(courses: Course[]): CourseTask[] {
  return courses
    .flatMap((course) => course.milestones.filter((milestone) => !milestone.completed).map((milestone) => milestoneToTask(course, milestone)))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function getTodayTasks(tasks: CourseTask[]): CourseTask[] {
  const todayIso = new Date().toISOString().slice(0, 10);
  return tasks.filter((task) => task.dueDate <= todayIso && task.status !== 'finalizada');
}

export function getUpcomingTasks(tasks: CourseTask[], daysAhead = 7): CourseTask[] {
  return tasks.filter((task) => {
    const days = daysUntil(task.dueDate);
    return days > 0 && days <= daysAhead && task.status !== 'finalizada';
  });
}

export function getTaskSummary(tasks: CourseTask[]) {
  return {
    total: tasks.length,
    critical: tasks.filter((task) => task.priority === 'critica').length,
    high: tasks.filter((task) => task.priority === 'alta').length,
    blocked: tasks.filter((task) => task.status === 'bloqueada').length,
  };
}
