import { Course } from './courseMilestones';
import { CourseTask, ManualTaskSeed } from './courseTasks';
import { DATA_SOURCE_MODE } from './dataSource';
import {
  createCourseInApi,
  createTaskInApi,
  deleteCourseInApi,
  deleteTaskInApi,
  fetchCourseFromApi,
  fetchCoursesFromApi,
  fetchTasksFromApi,
  updateCourseInApi,
  updateMilestoneInApi,
  updateTaskInApi,
} from './apiClient';
import {
  readStoredCourses,
  readStoredManualTasks,
  resetStoredCourses,
  resetStoredManualTasks,
  writeStoredCourses,
  writeStoredManualTasks,
} from './localStorage';

function courseTaskToManualTask(task: CourseTask): ManualTaskSeed {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    courseId: task.courseId,
    courseCode: task.courseCode,
    courseName: task.courseName,
    dueDate: task.dueDate,
    priority: task.priority,
    status: task.status,
    responsible: task.responsible,
    linkType: task.linkType,
    relatedLabel: task.relatedLabel,
    createdAt: task.createdAt,
  };
}

export async function getCourses(): Promise<Course[]> {
  if (DATA_SOURCE_MODE === 'database') return fetchCoursesFromApi();
  return readStoredCourses();
}

export async function getCourse(id: string): Promise<Course | undefined> {
  if (DATA_SOURCE_MODE === 'database') return fetchCourseFromApi(id);
  return readStoredCourses().find((course) => course.id === id);
}

export async function saveCourses(courses: Course[]): Promise<Course[]> {
  if (DATA_SOURCE_MODE === 'database') {
    throw new Error('saveCourses no debe usarse en modo database. Use updateCourse o createCourse.');
  }
  writeStoredCourses(courses);
  return courses;
}

export async function createCourse(course: Partial<Course>): Promise<Course> {
  if (DATA_SOURCE_MODE === 'database') return createCourseInApi(course);
  const courses = readStoredCourses();
  const newCourse = course as Course;
  writeStoredCourses([newCourse, ...courses]);
  return newCourse;
}

export async function updateCourse(id: string, course: Partial<Course>): Promise<Course> {
  if (DATA_SOURCE_MODE === 'database') return updateCourseInApi(id, course);

  const courses = readStoredCourses();
  const updatedCourses = courses.map((item) => (item.id === id ? { ...item, ...course } : item));
  const updated = updatedCourses.find((item) => item.id === id);
  if (!updated) throw new Error('Curso no encontrado.');
  writeStoredCourses(updatedCourses);
  return updated;
}

export async function deleteCourse(id: string): Promise<void> {
  if (DATA_SOURCE_MODE === 'database') return deleteCourseInApi(id);
  writeStoredCourses(readStoredCourses().filter((course) => course.id !== id));
}

export async function resetCourses(): Promise<Course[]> {
  if (DATA_SOURCE_MODE === 'database') {
    throw new Error('No se puede restaurar demo desde base de datos mediante esta función.');
  }
  return resetStoredCourses();
}

export async function getManualTasks(): Promise<ManualTaskSeed[]> {
  if (DATA_SOURCE_MODE === 'database') {
    const tasks = await fetchTasksFromApi();
    return tasks.filter((task) => task.source === 'manual').map(courseTaskToManualTask);
  }
  return readStoredManualTasks();
}

export async function getPersistedTasks(): Promise<CourseTask[]> {
  if (DATA_SOURCE_MODE === 'database') return fetchTasksFromApi();
  return readStoredManualTasks().map((task) => ({
    ...task,
    source: 'manual',
    milestoneId: undefined,
    milestoneCode: undefined,
  }));
}

export async function saveManualTasks(tasks: ManualTaskSeed[]): Promise<ManualTaskSeed[]> {
  if (DATA_SOURCE_MODE === 'database') {
    return tasks;
  }
  writeStoredManualTasks(tasks);
  return tasks;
}

export async function createTask(task: Partial<ManualTaskSeed>): Promise<CourseTask | ManualTaskSeed> {
  if (DATA_SOURCE_MODE === 'database') return createTaskInApi(task);
  const tasks = readStoredManualTasks();
  const newTask = task as ManualTaskSeed;
  writeStoredManualTasks([newTask, ...tasks]);
  return newTask;
}

export async function updateTask(id: string, task: Partial<CourseTask>): Promise<CourseTask | ManualTaskSeed> {
  if (DATA_SOURCE_MODE === 'database') return updateTaskInApi(id, task);

  const tasks = readStoredManualTasks();
  const updatedTasks = tasks.map((item) => (item.id === id ? { ...item, ...task } : item));
  const updated = updatedTasks.find((item) => item.id === id);
  if (!updated) throw new Error('Tarea no encontrada.');
  writeStoredManualTasks(updatedTasks);
  return updated;
}

export async function deleteTask(id: string): Promise<void> {
  if (DATA_SOURCE_MODE === 'database') return deleteTaskInApi(id);
  writeStoredManualTasks(readStoredManualTasks().filter((task) => task.id !== id));
}

export async function resetManualTasks(): Promise<ManualTaskSeed[]> {
  if (DATA_SOURCE_MODE === 'database') {
    throw new Error('No se puede restaurar demo desde base de datos mediante esta función.');
  }
  return resetStoredManualTasks();
}

export async function updateMilestone(
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
  if (DATA_SOURCE_MODE === 'database') return updateMilestoneInApi(id, milestone);
  throw new Error('En modo localStorage los hitos se actualizan guardando el curso completo.');
}
