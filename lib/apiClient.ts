import { Course } from './courseMilestones';
import { CourseTask, ManualTaskSeed } from './courseTasks';

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
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

export async function fetchCoursesFromApi(): Promise<Course[]> {
  return requestJson<Course[]>('/api/courses');
}

export async function fetchCourseFromApi(id: string): Promise<Course> {
  return requestJson<Course>(`/api/courses/${id}`);
}

export async function createCourseInApi(course: Partial<Course>): Promise<Course> {
  return requestJson<Course>('/api/courses', {
    method: 'POST',
    body: JSON.stringify(course),
  });
}

export async function updateCourseInApi(id: string, course: Partial<Course>): Promise<Course> {
  return requestJson<Course>(`/api/courses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(course),
  });
}

export async function deleteCourseInApi(id: string): Promise<void> {
  await requestJson<{ ok: true }>(`/api/courses/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchTasksFromApi(): Promise<CourseTask[]> {
  return requestJson<CourseTask[]>('/api/tasks');
}

export async function createTaskInApi(task: Partial<ManualTaskSeed>): Promise<CourseTask> {
  return requestJson<CourseTask>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  });
}

export async function updateTaskInApi(id: string, task: Partial<CourseTask>): Promise<CourseTask> {
  return requestJson<CourseTask>(`/api/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(task),
  });
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
