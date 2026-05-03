import { Course } from './courseMilestones';
import { ManualTaskSeed } from './courseTasks';
import { AdministrativeInstance, mockInstances } from './instances';
import { mockCourses } from './mockCourses';
import { mockManualTasks } from './mockTasks';

export const STORAGE_KEYS = {
  courses: 'diena-control-360.courses',
  manualTasks: 'diena-control-360.manualTasks',
  instances: 'diena-control-360.instances',
} as const;

function canUseBrowserStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readJsonFromStorage<T>(key: string, fallback: T): T {
  if (!canUseBrowserStorage()) return fallback;

  try {
    const storedValue = window.localStorage.getItem(key);
    if (!storedValue) return fallback;
    return JSON.parse(storedValue) as T;
  } catch {
    return fallback;
  }
}

function writeJsonToStorage<T>(key: string, value: T): void {
  if (!canUseBrowserStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function readStoredCourses(): Course[] {
  const courses = readJsonFromStorage<Course[]>(STORAGE_KEYS.courses, mockCourses);
  return Array.isArray(courses) && courses.length ? courses : mockCourses;
}

export function writeStoredCourses(courses: Course[]): void {
  writeJsonToStorage(STORAGE_KEYS.courses, courses);
}

export function resetStoredCourses(): Course[] {
  writeStoredCourses(mockCourses);
  return mockCourses;
}

export function readStoredManualTasks(): ManualTaskSeed[] {
  const tasks = readJsonFromStorage<ManualTaskSeed[]>(STORAGE_KEYS.manualTasks, mockManualTasks);
  return Array.isArray(tasks) ? tasks : mockManualTasks;
}

export function writeStoredManualTasks(tasks: ManualTaskSeed[]): void {
  writeJsonToStorage(STORAGE_KEYS.manualTasks, tasks);
}

export function resetStoredManualTasks(): ManualTaskSeed[] {
  writeStoredManualTasks(mockManualTasks);
  return mockManualTasks;
}

export function readStoredInstances(): AdministrativeInstance[] {
  const instances = readJsonFromStorage<AdministrativeInstance[]>(STORAGE_KEYS.instances, mockInstances);
  return Array.isArray(instances) ? instances : mockInstances;
}

export function writeStoredInstances(instances: AdministrativeInstance[]): void {
  writeJsonToStorage(STORAGE_KEYS.instances, instances);
}

export function resetStoredInstances(): AdministrativeInstance[] {
  writeStoredInstances(mockInstances);
  return mockInstances;
}
