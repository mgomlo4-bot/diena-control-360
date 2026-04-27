import { Course } from './courseMilestones';
import { ManualTaskSeed } from './courseTasks';
import { mockCourses } from './mockCourses';
import { mockManualTasks } from './mockTasks';

export type DienaBackup = {
  app: 'DIENA_CONTROL_360';
  version: 1;
  exportedAt: string;
  courses: Course[];
  manualTasks: ManualTaskSeed[];
};

export function createBackup(courses: Course[], manualTasks: ManualTaskSeed[]): DienaBackup {
  return {
    app: 'DIENA_CONTROL_360',
    version: 1,
    exportedAt: new Date().toISOString(),
    courses,
    manualTasks,
  };
}

export function backupToJson(backup: DienaBackup): string {
  return JSON.stringify(backup, null, 2);
}

export function parseBackupJson(rawJson: string): DienaBackup {
  const parsed = JSON.parse(rawJson) as DienaBackup;

  if (parsed.app !== 'DIENA_CONTROL_360') {
    throw new Error('El archivo no pertenece a DIENA CONTROL 360.');
  }

  if (parsed.version !== 1) {
    throw new Error('Versión de backup no soportada.');
  }

  if (!Array.isArray(parsed.courses) || !Array.isArray(parsed.manualTasks)) {
    throw new Error('El archivo de backup no contiene cursos y tareas válidas.');
  }

  return parsed;
}

export function createEmptyDemoBackup(): DienaBackup {
  return createBackup(mockCourses, mockManualTasks);
}
