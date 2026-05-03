import { CourseStatus } from './courseStatus';
import { TaskLinkType, TaskPriority, TaskSource, TaskStatus } from './courseTasks';

export function toDbCourseStatus(status: string | undefined | null): string {
  const normalized = String(status ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

  const map: Record<string, string> = {
    '': 'NO_ACTIVADO',
    PLANIFICACION: 'NO_ACTIVADO',
    'NO ACTIVADO': 'NO_ACTIVADO',
    ACTIVADO: 'ACTIVADO',
    'BORRADOR CONVOCATORIA': 'PENDIENTE_BORRADOR_CONVOCATORIA',
    'PENDIENTE BORRADOR CONVOCATORIA': 'PENDIENTE_BORRADOR_CONVOCATORIA',
    'BORRADOR RECIBIDO': 'BORRADOR_RECIBIDO',
    'CONVOCATORIA PENDIENTE BOD': 'CONVOCATORIA_PENDIENTE_PUBLICACION',
    'CONVOCATORIA PENDIENTE PUBLICACION': 'CONVOCATORIA_PENDIENTE_PUBLICACION',
    CONVOCADO: 'CONVOCATORIA_PUBLICADA',
    'CONVOCATORIA PUBLICADA': 'CONVOCATORIA_PUBLICADA',
    'SOLICITUDES ABIERTAS': 'PLAZO_SOLICITUDES_ABIERTO',
    'PLAZO SOLICITUDES ABIERTO': 'PLAZO_SOLICITUDES_ABIERTO',
    'PLAZO SOLICITUDES CERRADO': 'PLAZO_SOLICITUDES_CERRADO',
    'VISADO UNIDADES': 'PENDIENTE_VISADO',
    'PENDIENTE VISADO': 'PENDIENTE_VISADO',
    'VISADO FINALIZADO': 'VISADO_FINALIZADO',
    'PENDIENTE PRUEBAS FISICAS Y RECONOCIMIENTO MEDICO': 'PENDIENTE_PRUEBAS_FISICAS_RECONOCIMIENTO_MEDICO',
    'PENDIENTE PRUEBAS FISICAS RECONOCIMIENTO MEDICO': 'PENDIENTE_PRUEBAS_FISICAS_RECONOCIMIENTO_MEDICO',
    'PENDIENTE DE NOMBRAMIENTO DE ALUMNOS': 'PENDIENTE_NOMBRAMIENTO_ALUMNOS',
    'PENDIENTE NOMBRAMIENTO ALUMNOS': 'PENDIENTE_NOMBRAMIENTO_ALUMNOS',
    'NOMBRAMIENTO PENDIENTE BOD': 'PENDIENTE_NOMBRAMIENTO_ALUMNOS',
    'ALUMNOS NOMBRADOS': 'ALUMNOS_NOMBRADOS',
    'EN CURSO': 'FASE_PRESENCIAL_EN_CURSO',
    'FASE DISTANCIA EN CURSO': 'FASE_DISTANCIA_EN_CURSO',
    'EXAMEN PREVIO PENDIENTE': 'EXAMEN_PREVIO_PENDIENTE',
    'FASE PRESENCIAL PENDIENTE': 'FASE_PRESENCIAL_PENDIENTE',
    'FASE PRESENCIAL EN CURSO': 'FASE_PRESENCIAL_EN_CURSO',
    'CURSO FINALIZADO': 'CURSO_FINALIZADO',
    'FINALIZADO PENDIENTE ACTA': 'PENDIENTE_ACTA',
    'PENDIENTE ACTA': 'PENDIENTE_ACTA',
    'ACTA RECIBIDA PENDIENTE PUBLICACION FINALIZACION': 'PENDIENTE_PUBLICACION_BOD_FINALIZACION',
    'FINALIZACION PENDIENTE BOD': 'PENDIENTE_PUBLICACION_BOD_FINALIZACION',
    'PENDIENTE PUBLICACION BOD FINALIZACION': 'PENDIENTE_PUBLICACION_BOD_FINALIZACION',
    'FINALIZADO Y PUBLICADO': 'FINALIZADO_PUBLICADO',
    'FINALIZADO PUBLICADO': 'FINALIZADO_PUBLICADO',
    CERRADO: 'FINALIZADO_PUBLICADO',
    APLAZADO: 'NO_ACTIVADO',
    BAJA: 'NO_ACTIVADO',
    CANCELADO: 'NO_ACTIVADO',
  };

  return map[normalized] ?? normalized.replace(/\s+/g, '_');
}

export function fromDbCourseStatus(status: string | undefined | null): CourseStatus {
  const map: Record<string, CourseStatus> = {
    NO_ACTIVADO: 'PLANIFICACION',
    ACTIVADO: 'ACTIVADO',
    PENDIENTE_BORRADOR_CONVOCATORIA: 'BORRADOR CONVOCATORIA',
    BORRADOR_RECIBIDO: 'BORRADOR CONVOCATORIA',
    CONVOCATORIA_PENDIENTE_PUBLICACION: 'CONVOCATORIA PENDIENTE BOD',
    CONVOCATORIA_PUBLICADA: 'CONVOCADO',
    PLAZO_SOLICITUDES_ABIERTO: 'SOLICITUDES ABIERTAS',
    PLAZO_SOLICITUDES_CERRADO: 'VISADO UNIDADES',
    PENDIENTE_VISADO: 'VISADO UNIDADES',
    VISADO_FINALIZADO: 'VISADO UNIDADES',
    PENDIENTE_PRUEBAS_FISICAS_RECONOCIMIENTO_MEDICO: 'PENDIENTE PRUEBAS FISICAS Y RECONOCIMIENTO MEDICO',
    PENDIENTE_NOMBRAMIENTO_ALUMNOS: 'PENDIENTE DE NOMBRAMIENTO DE ALUMNOS',
    ALUMNOS_NOMBRADOS: 'NOMBRAMIENTO PENDIENTE BOD',
    FASE_DISTANCIA_EN_CURSO: 'EN CURSO',
    EXAMEN_PREVIO_PENDIENTE: 'ACTIVADO',
    FASE_PRESENCIAL_PENDIENTE: 'ACTIVADO',
    FASE_PRESENCIAL_EN_CURSO: 'EN CURSO',
    CURSO_FINALIZADO: 'FINALIZADO PENDIENTE ACTA',
    PENDIENTE_ACTA: 'FINALIZADO PENDIENTE ACTA',
    PENDIENTE_PUBLICACION_BOD_FINALIZACION: 'FINALIZACION PENDIENTE BOD',
    FINALIZADO_PUBLICADO: 'FINALIZADO Y PUBLICADO',
  };

  return map[String(status ?? 'NO_ACTIVADO')] ?? 'PLANIFICACION';
}

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
