import { Course, CourseMilestone, getDaysUntil, getNextPendingMilestone, isMilestoneOverdue } from './courseMilestones';

export type TaskPriority = 'critica' | 'alta' | 'media' | 'baja';
export type TaskStatus = 'pendiente' | 'en_curso' | 'bloqueada' | 'finalizada';
export type TaskSource = 'hito_automatico' | 'manual';
export type TaskLinkType = 'curso' | 'hito' | 'instancia' | 'documento' | 'general';

export type CourseTask = {
  id: string;
  title: string;
  description: string;
  courseId?: string;
  courseCode?: string;
  courseName?: string;
  milestoneId?: string;
  milestoneCode?: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  responsible: string;
  source: TaskSource;
  linkType: TaskLinkType;
  relatedLabel: string;
  createdAt: string;
};

export type ManualTaskSeed = {
  id: string;
  title: string;
  description: string;
  courseId?: string;
  courseCode?: string;
  courseName?: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  responsible: string;
  linkType: TaskLinkType;
  relatedLabel: string;
  createdAt: string;
};

export function getTaskPriority(milestone: CourseMilestone): TaskPriority {
  if (isMilestoneOverdue(milestone)) return 'critica';
  const days = getDaysUntil(milestone.calculatedDate);
  if (days <= 2) return 'alta';
  if (days <= 7) return 'media';
  return 'baja';
}

function getTaskDescription(course: Course, milestone: CourseMilestone): string {
  if (milestone.finalizationChain) {
    return `Acción posterior a la fecha fin del curso ${course.code}. ${milestone.description ?? 'Control de finalización, acta, publicación BOD o cierre administrativo.'}`;
  }

  return milestone.description ?? `Acción derivada del hito ${milestone.relativeCode} del curso ${course.code}.`;
}

export function milestoneToTask(course: Course, milestone: CourseMilestone): CourseTask {
  const priority = getTaskPriority(milestone);
  return {
    id: `${course.id}-${milestone.id}`,
    title: milestone.name,
    description: getTaskDescription(course, milestone),
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
    linkType: 'hito',
    relatedLabel: `${course.code} · ${milestone.relativeCode}`,
    createdAt: milestone.calculatedDate,
  };
}

export function manualTaskToCourseTask(task: ManualTaskSeed): CourseTask {
  return {
    ...task,
    source: 'manual',
    milestoneId: undefined,
    milestoneCode: undefined,
  };
}

export function getNextActionTask(course: Course): CourseTask | undefined {
  const next = getNextPendingMilestone(course.milestones);
  return next ? milestoneToTask(course, next) : undefined;
}

export function getAutomaticCourseTasks(courses: Course[]): CourseTask[] {
  return courses.flatMap((course) =>
    course.milestones.filter((milestone) => !milestone.completed).map((milestone) => milestoneToTask(course, milestone)),
  );
}

export function getFinalizationTasks(courses: Course[]): CourseTask[] {
  return getAutomaticCourseTasks(courses).filter((task) =>
    ['F', 'F+3', 'F+5', 'F+6', 'F+10', 'F+15'].includes(task.milestoneCode ?? ''),
  );
}

export function getCourseTasks(courses: Course[], manualTasks: ManualTaskSeed[] = []): CourseTask[] {
  return [...getAutomaticCourseTasks(courses), ...manualTasks.map(manualTaskToCourseTask)].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function getTodayTasks(tasks: CourseTask[]): CourseTask[] {
  const todayIso = new Date().toISOString().slice(0, 10);
  return tasks.filter((task) => task.dueDate <= todayIso && task.status !== 'finalizada');
}

export function getUpcomingTasks(tasks: CourseTask[], daysAhead = 7): CourseTask[] {
  return tasks.filter((task) => {
    const days = getDaysUntil(task.dueDate);
    return days > 0 && days <= daysAhead && task.status !== 'finalizada';
  });
}

export function getTaskSummary(tasks: CourseTask[]) {
  return {
    total: tasks.length,
    automatic: tasks.filter((task) => task.source === 'hito_automatico').length,
    manual: tasks.filter((task) => task.source === 'manual').length,
    critical: tasks.filter((task) => task.priority === 'critica').length,
    high: tasks.filter((task) => task.priority === 'alta').length,
    blocked: tasks.filter((task) => task.status === 'bloqueada').length,
    completed: tasks.filter((task) => task.status === 'finalizada').length,
    finalization: tasks.filter((task) => ['F', 'F+3', 'F+5', 'F+6', 'F+10', 'F+15'].includes(task.milestoneCode ?? '')).length,
  };
}

export function filterTasksByStatus(tasks: CourseTask[], status: TaskStatus | 'todas'): CourseTask[] {
  if (status === 'todas') return tasks;
  return tasks.filter((task) => task.status === status);
}

export function filterTasksBySource(tasks: CourseTask[], source: TaskSource | 'todas'): CourseTask[] {
  if (source === 'todas') return tasks;
  return tasks.filter((task) => task.source === source);
}
