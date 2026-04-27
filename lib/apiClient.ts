import { Course } from './courseMilestones';
import { CourseTask, ManualTaskSeed } from './courseTasks';
import {
  fromDbTaskLinkType,
  fromDbTaskPriority,
  fromDbTaskSource,
  fromDbTaskStatus,
  normalizeDateValue,
  toDbTaskLinkType,
  toDbTaskPriority,
  toDbTaskSource,
  toDbTaskStatus,
} from './typeMappers';

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

type ApiTask = Omit<CourseTask, 'priority' | 'status' | 'source' | 'linkType' | 'dueDate' | 'createdAt'> & {
  priority: string;
  status: string;
  source: string;
  linkType: string;
  dueDate: string | Date;
  createdAt: string | Date;
};

type ApiCourse = Omit<Course, 'startDate' | 'endDate'> & {
  startDate: string | Date;
  endDate: string | Date;
};

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.ok) {
    throw new Error(payload.error ?? `Error HTTP ${response.status}`);
  }

  return payload.data as T;
}

function normalizeCourseFromApi(course: ApiCourse): Course {
  return {
    ...course,
    startDate: normalizeDateValue(course.startDate),
    endDate: normalizeDateValue(course.endDate),
    milestones: (course.milestones ?? []).map((milestone) => ({
      ...milestone,
      calculatedDate: normalizeDateValue(milestone.calculatedDate),
      observations: milestone.observations ?? '',
    })),
  };
}

function normalizeTaskFromApi(task: ApiTask): CourseTask {
  return {
    ...task,
    priority: fromDbTaskPriority(task.priority),
    status: fromDbTaskStatus(task.status),
    source: fromDbTaskSource(task.source),
    linkType: fromDbTaskLinkType(task.linkType),
    dueDate: normalizeDateValue(task.dueDate),
    createdAt: normalizeDateValue(task.createdAt),
  };
}

function serializeTaskForApi(task: Partial<ManualTaskSeed | CourseTask>) {
  return {
    ...task,
    priority: task.priority ? toDbTaskPriority(task.priority) : undefined,
    status: task.status ? toDbTaskStatus(task.status) : undefined,
    source: task.source ? toDbTaskSource(task.source) : undefined,
    linkType: task.linkType ? toDbTaskLinkType(task.linkType) : undefined,
  };
}

export async function fetchCoursesFromApi(): Promise<Course[]> {
  const courses = await requestJson<ApiCourse[]>('/api/courses');
  return courses.map(normalizeCourseFromApi);
}

export async function fetchCourseFromApi(id: string): Promise<Course> {
  const course = await requestJson<ApiCourse>(`/api/courses/${id}`);
  return normalizeCourseFromApi(course);
}

export async function createCourseInApi(course: Partial<Course>): Promise<Course> {
  const created = await requestJson<ApiCourse>('/api/courses', {
    method: 'POST',
    body: JSON.stringify(course),
  });
  return normalizeCourseFromApi(created);
}

export async function updateCourseInApi(id: string, course: Partial<Course>): Promise<Course> {
  const updated = await requestJson<ApiCourse>(`/api/courses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(course),
  });
  return normalizeCourseFromApi(updated);
}

export async function deleteCourseInApi(id: string): Promise<void> {
  await requestJson<{ ok: true }>(`/api/courses/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchTasksFromApi(): Promise<CourseTask[]> {
  const tasks = await requestJson<ApiTask[]>('/api/tasks');
  return tasks.map(normalizeTaskFromApi);
}

export async function createTaskInApi(task: Partial<ManualTaskSeed>): Promise<CourseTask> {
  const created = await requestJson<ApiTask>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(serializeTaskForApi(task)),
  });
  return normalizeTaskFromApi(created);
}

export async function updateTaskInApi(id: string, task: Partial<CourseTask>): Promise<CourseTask> {
  const updated = await requestJson<ApiTask>(`/api/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(serializeTaskForApi(task)),
  });
  return normalizeTaskFromApi(updated);
}

export async function deleteTaskInApi(id: string): Promise<void> {
  await requestJson<{ ok: true }>(`/api/tasks/${id}`, {
    method: 'DELETE',
  });
}

export async function updateMilestoneInApi(
  id: string,
  milestone: {
    completed?: boolean;
    completedBy?: string;
    observations?: string;
    calculatedDate?: string;
    name?: string;
    relativeCode?: string;
    isManual?: boolean;
  },
) {
  return requestJson(`/api/milestones/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(milestone),
  });
}
