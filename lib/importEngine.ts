import { Course, generateCourseMilestones } from './courseMilestones';
import { ManualTaskSeed, TaskPriority, TaskStatus } from './courseTasks';
import { AdministrativeInstance, InstancePriority, InstanceStatus } from './instances';

export type ImportEntity = 'courses' | 'tasks' | 'instances';
export type ImportSeverity = 'error' | 'warning';

export type ImportIssue = {
  row: number;
  field?: string;
  severity: ImportSeverity;
  message: string;
};

export type ImportPreview<T> = {
  entity: ImportEntity;
  rows: T[];
  issues: ImportIssue[];
  validRows: number;
  invalidRows: number;
};

const courseHeaderMap: Record<string, keyof Course> = {
  codigo: 'code',
  code: 'code',
  curso: 'name',
  nombre: 'name',
  name: 'name',
  estado: 'status',
  status: 'status',
  tipo: 'type',
  type: 'type',
  modalidad: 'modality',
  escuela: 'school',
  centro: 'school',
  inicio: 'startDate',
  fecha_inicio: 'startDate',
  fin: 'endDate',
  fecha_fin: 'endDate',
  activo: 'active',
  alumnos_nombrados: 'appointedStudents',
  nombrados: 'appointedStudents',
  mujeres_nombradas: 'appointedWomen',
  nombradas: 'appointedWomen',
  bajas: 'droppedStudents',
  alumnos_baja: 'droppedStudents',
  egresados: 'graduatedStudents',
  alumnos_egresados: 'graduatedStudents',
  mujeres_egresadas: 'graduatedWomen',
  reconocimiento: 'requiresMedicalAndPhysical',
  reconocimiento_medico: 'requiresMedicalAndPhysical',
};

function normalizeHeader(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function parseBoolean(value: unknown): boolean {
  const text = String(value ?? '').trim().toLowerCase();
  return ['si', 'sí', 's', 'true', '1', 'x', 'activo'].includes(text);
}

function parseNumber(value: unknown): number {
  const number = Number(String(value ?? '0').replace(',', '.'));
  return Number.isFinite(number) ? number : 0;
}

function normalizeDate(value: unknown): string {
  const text = String(value ?? '').trim();
  if (!text) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const match = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (!match) return text;
  const day = match[1].padStart(2, '0');
  const month = match[2].padStart(2, '0');
  const year = match[3].length === 2 ? `20${match[3]}` : match[3];
  return `${year}-${month}-${day}`;
}

export function parseDelimitedText(text: string): Record<string, string>[] {
  const clean = text.replace(/^\uFEFF/, '').trim();
  if (!clean) return [];
  const lines = clean.split(/\r?\n/).filter(Boolean);
  const delimiter = (lines[0].match(/;/g)?.length ?? 0) >= (lines[0].match(/,/g)?.length ?? 0) ? ';' : ',';
  const headers = lines[0].split(delimiter).map((item) => item.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map((line) => {
    const values = line.split(delimiter).map((item) => item.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
    return headers.reduce<Record<string, string>>((acc, header, index) => {
      acc[header] = values[index] ?? '';
      return acc;
    }, {});
  });
}

function validateCourse(course: Course, row: number): ImportIssue[] {
  const issues: ImportIssue[] = [];
  if (!course.code) issues.push({ row, field: 'code', severity: 'error', message: 'Falta el código del curso.' });
  if (!course.name) issues.push({ row, field: 'name', severity: 'error', message: 'Falta el nombre del curso.' });
  if (!course.startDate) issues.push({ row, field: 'startDate', severity: 'error', message: 'Falta la fecha de inicio.' });
  if (!course.endDate) issues.push({ row, field: 'endDate', severity: 'error', message: 'Falta la fecha de fin.' });
  if (course.startDate && course.endDate && course.startDate > course.endDate) issues.push({ row, field: 'endDate', severity: 'error', message: 'La fecha de fin es anterior a la fecha de inicio.' });
  if (!course.status) issues.push({ row, field: 'status', severity: 'warning', message: 'Sin estado informado. Se usará PLANIFICACION.' });
  return issues;
}

export function previewCourseImport(rawRows: Record<string, unknown>[]): ImportPreview<Course> {
  const issues: ImportIssue[] = [];
  const rows = rawRows.map((raw, index) => {
    const mapped: Partial<Course> = {};
    Object.entries(raw).forEach(([header, value]) => {
      const target = courseHeaderMap[normalizeHeader(header)];
      if (!target) return;
      if (['appointedStudents', 'appointedWomen', 'droppedStudents', 'graduatedStudents', 'graduatedWomen'].includes(target)) {
        (mapped as Record<string, unknown>)[target] = parseNumber(value);
      } else if (['active', 'requiresMedicalAndPhysical'].includes(target)) {
        (mapped as Record<string, unknown>)[target] = parseBoolean(value);
      } else if (['startDate', 'endDate'].includes(target)) {
        (mapped as Record<string, unknown>)[target] = normalizeDate(value);
      } else {
        (mapped as Record<string, unknown>)[target] = String(value ?? '').trim();
      }
    });

    const course: Course = {
      id: String(mapped.code ?? `curso-import-${index + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      code: mapped.code ?? '',
      name: mapped.name ?? '',
      status: mapped.status ?? 'PLANIFICACION',
      type: mapped.type ?? 'SIN TIPO',
      modality: mapped.modality ?? 'No informada',
      school: mapped.school ?? 'No informada',
      startDate: mapped.startDate ?? '',
      endDate: mapped.endDate ?? '',
      active: mapped.active ?? true,
      requiresMedicalAndPhysical: mapped.requiresMedicalAndPhysical ?? false,
      appointedStudents: mapped.appointedStudents ?? 0,
      appointedWomen: mapped.appointedWomen ?? 0,
      droppedStudents: mapped.droppedStudents ?? 0,
      graduatedStudents: mapped.graduatedStudents ?? 0,
      graduatedWomen: mapped.graduatedWomen ?? 0,
      milestones: [],
    };
    course.milestones = generateCourseMilestones(course.startDate, course.endDate, course.requiresMedicalAndPhysical);
    issues.push(...validateCourse(course, index + 2));
    return course;
  });
  const invalidRows = new Set(issues.filter((issue) => issue.severity === 'error').map((issue) => issue.row)).size;
  return { entity: 'courses', rows, issues, validRows: rows.length - invalidRows, invalidRows };
}

export function buildTaskFromRow(raw: Record<string, unknown>, index: number): ManualTaskSeed {
  const title = String(raw.title ?? raw.titulo ?? raw.Titulo ?? raw.TAREA ?? raw.tarea ?? '').trim();
  const dueDate = normalizeDate(raw.dueDate ?? raw.vencimiento ?? raw.fecha ?? raw.Fecha ?? '');
  return {
    id: `task-import-${Date.now()}-${index}`,
    title,
    description: String(raw.description ?? raw.descripcion ?? raw.observaciones ?? '').trim(),
    courseCode: String(raw.courseCode ?? raw.codigo_curso ?? raw.Codigo ?? '').trim() || undefined,
    dueDate,
    priority: (String(raw.priority ?? raw.prioridad ?? 'media').toLowerCase() as TaskPriority) || 'media',
    status: (String(raw.status ?? raw.estado ?? 'pendiente').toLowerCase() as TaskStatus) || 'pendiente',
    responsible: String(raw.responsible ?? raw.responsable ?? 'DIENA - Sección de Perfeccionamiento'),
    linkType: 'general',
    relatedLabel: String(raw.relatedLabel ?? raw.relacion ?? 'Importación'),
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

export function buildInstanceFromRow(raw: Record<string, unknown>, index: number): AdministrativeInstance {
  return {
    id: `inst-import-${Date.now()}-${index}`,
    reference: String(raw.reference ?? raw.referencia ?? raw['S/REF'] ?? '').trim(),
    subject: String(raw.subject ?? raw.asunto ?? '').trim(),
    applicant: String(raw.applicant ?? raw.interesado ?? '').trim(),
    unit: String(raw.unit ?? raw.destino ?? '').trim() || undefined,
    courseCode: String(raw.courseCode ?? raw.codigo_curso ?? '').trim() || undefined,
    status: (String(raw.status ?? raw.estado ?? 'recibida').toLowerCase() as InstanceStatus) || 'recibida',
    priority: (String(raw.priority ?? raw.prioridad ?? 'media').toLowerCase() as InstancePriority) || 'media',
    entryDate: normalizeDate(raw.entryDate ?? raw.fecha_entrada ?? raw.fecha ?? ''),
    dueDate: normalizeDate(raw.dueDate ?? raw.vencimiento ?? '') || undefined,
    responsible: String(raw.responsible ?? raw.responsable ?? 'DIENA - Sección de Perfeccionamiento'),
    lastAction: String(raw.lastAction ?? raw.ultima_actuacion ?? '').trim(),
    nextAction: String(raw.nextAction ?? raw.siguiente_paso ?? '').trim(),
    observations: String(raw.observations ?? raw.observaciones ?? '').trim() || undefined,
  };
}
