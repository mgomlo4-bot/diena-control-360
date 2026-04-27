import { Course } from './courseMilestones';
import { CourseTask, ManualTaskSeed, getCourseTasks } from './courseTasks';

export type CalendarItemType = 'hito' | 'tarea';
export type CalendarLoadLevel = 'normal' | 'alta' | 'critica';

export type CalendarItem = {
  id: string;
  type: CalendarItemType;
  date: string;
  title: string;
  courseId?: string;
  courseCode?: string;
  courseName?: string;
  label: string;
  completed: boolean;
  overdue: boolean;
  priority: 'critica' | 'alta' | 'media' | 'baja';
  source: string;
};

export type CalendarDay = {
  date: string;
  items: CalendarItem[];
  total: number;
  milestones: number;
  tasks: number;
  pending: number;
  completed: number;
  overdue: number;
  loadLevel: CalendarLoadLevel;
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function getLoadLevel(total: number, overdue: number): CalendarLoadLevel {
  if (overdue > 0 || total >= 8) return 'critica';
  if (total >= 4) return 'alta';
  return 'normal';
}

function taskToCalendarItem(task: CourseTask): CalendarItem {
  const today = todayIso();
  return {
    id: `task-${task.id}`,
    type: 'tarea',
    date: task.dueDate,
    title: task.title,
    courseId: task.courseId,
    courseCode: task.courseCode,
    courseName: task.courseName,
    label: task.milestoneCode ?? task.linkType,
    completed: task.status === 'finalizada',
    overdue: task.dueDate < today && task.status !== 'finalizada',
    priority: task.priority,
    source: task.source,
  };
}

export function buildCalendarItems(courses: Course[], manualTasks: ManualTaskSeed[]): CalendarItem[] {
  const today = todayIso();
  const milestoneItems: CalendarItem[] = courses.flatMap((course) =>
    course.milestones.map((milestone) => ({
      id: `milestone-${course.id}-${milestone.id}`,
      type: 'hito' as const,
      date: milestone.calculatedDate,
      title: milestone.name,
      courseId: course.id,
      courseCode: course.code,
      courseName: course.name,
      label: milestone.relativeCode,
      completed: milestone.completed,
      overdue: milestone.calculatedDate < today && !milestone.completed,
      priority: milestone.calculatedDate < today && !milestone.completed ? 'critica' : 'media',
      source: 'hito_curso',
    })),
  );

  const taskItems = getCourseTasks(courses, manualTasks).map(taskToCalendarItem);
  return [...milestoneItems, ...taskItems].sort((a, b) => a.date.localeCompare(b.date));
}

export function groupCalendarItemsByDay(items: CalendarItem[]): CalendarDay[] {
  const byDate = new Map<string, CalendarItem[]>();

  for (const item of items) {
    const current = byDate.get(item.date) ?? [];
    current.push(item);
    byDate.set(item.date, current);
  }

  return Array.from(byDate.entries())
    .map(([date, dayItems]) => {
      const sortedItems = [...dayItems].sort((a, b) => {
        if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
        if (a.type !== b.type) return a.type === 'hito' ? -1 : 1;
        return a.title.localeCompare(b.title);
      });

      const total = sortedItems.length;
      const overdue = sortedItems.filter((item) => item.overdue).length;

      return {
        date,
        items: sortedItems,
        total,
        milestones: sortedItems.filter((item) => item.type === 'hito').length,
        tasks: sortedItems.filter((item) => item.type === 'tarea').length,
        pending: sortedItems.filter((item) => !item.completed).length,
        completed: sortedItems.filter((item) => item.completed).length,
        overdue,
        loadLevel: getLoadLevel(total, overdue),
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getCalendarMonthDays(days: CalendarDay[], month: string): CalendarDay[] {
  return days.filter((day) => day.date.startsWith(month));
}

export function getCriticalCalendarDays(days: CalendarDay[]): CalendarDay[] {
  return days.filter((day) => day.loadLevel === 'critica').sort((a, b) => b.total - a.total || a.date.localeCompare(b.date));
}

export function getAvailableMonths(items: CalendarItem[]): string[] {
  return Array.from(new Set(items.map((item) => item.date.slice(0, 7)))).sort();
}
