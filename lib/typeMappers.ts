import { TaskLinkType, TaskPriority, TaskSource, TaskStatus } from './courseTasks';

export function toDbTaskPriority(priority: TaskPriority): string {
  const map: Record<TaskPriority, string> = {
    critica: 'CRITICA',
    alta: 'ALTA',
    media: 'MEDIA',
    baja: 'BAJA',
  };
  return map[priority];
}

export function fromDbTaskPriority(priority: string): TaskPriority {
  const map: Record<string, TaskPriority> = {
    CRITICA: 'critica',
    ALTA: 'alta',
    MEDIA: 'media',
    BAJA: 'baja',
  };
  return map[priority] ?? 'media';
}

export function toDbTaskStatus(status: TaskStatus): string {
  const map: Record<TaskStatus, string> = {
    pendiente: 'PENDIENTE',
    en_curso: 'EN_CURSO',
    bloqueada: 'BLOQUEADA',
    finalizada: 'FINALIZADA',
  };
  return map[status];
}

export function fromDbTaskStatus(status: string): TaskStatus {
  const map: Record<string, TaskStatus> = {
    PENDIENTE: 'pendiente',
    EN_CURSO: 'en_curso',
    BLOQUEADA: 'bloqueada',
    FINALIZADA: 'finalizada',
  };
  return map[status] ?? 'pendiente';
}

export function toDbTaskSource(source: TaskSource): string {
  const map: Record<TaskSource, string> = {
    hito_automatico: 'HITO_AUTOMATICO',
    manual: 'MANUAL',
  };
  return map[source];
}

export function fromDbTaskSource(source: string): TaskSource {
  const map: Record<string, TaskSource> = {
    HITO_AUTOMATICO: 'hito_automatico',
    MANUAL: 'manual',
  };
  return map[source] ?? 'manual';
}

export function toDbTaskLinkType(linkType: TaskLinkType): string {
  const map: Record<TaskLinkType, string> = {
    curso: 'CURSO',
    hito: 'HITO',
    instancia: 'INSTANCIA',
    documento: 'DOCUMENTO',
    general: 'GENERAL',
  };
  return map[linkType];
}

export function fromDbTaskLinkType(linkType: string): TaskLinkType {
  const map: Record<string, TaskLinkType> = {
    CURSO: 'curso',
    HITO: 'hito',
    INSTANCIA: 'instancia',
    DOCUMENTO: 'documento',
    GENERAL: 'general',
  };
  return map[linkType] ?? 'general';
}

export function normalizeDateValue(value: string | Date | null | undefined): string {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}
