export type MilestoneReference = 'INICIO_CURSO' | 'FIN_CURSO';
export type MilestoneStatus = 'pendiente' | 'completado';

export type CourseMilestoneTemplate = {
  id: string;
  relativeCode: string;
  name: string;
  reference: MilestoneReference;
  offsetDays: number;
  isMedicalOptional?: boolean;
  finalizationChain?: boolean;
  description?: string;
};

export type CourseMilestone = CourseMilestoneTemplate & {
  calculatedDate: string;
  completed: boolean;
  observations?: string;
};

export type Course = {
  id: string;
  code: string;
  name: string;
  status: string;
  type: string;
  modality: string;
  school: string;
  startDate: string;
  endDate: string;
  active: boolean;
  requiresMedicalAndPhysical: boolean;
  appointedStudents: number;
  droppedStudents: number;
  graduatedStudents: number;
  graduatedWomen: number;
  milestones: CourseMilestone[];
};

export const baseMilestoneTemplates: CourseMilestoneTemplate[] = [
  {
    id: 'draft-send',
    relativeCode: 'T-30',
    name: 'Enviar borrador de convocatoria a la escuela',
    reference: 'INICIO_CURSO',
    offsetDays: -30,
    description: 'Primer control documental para que la escuela revise fechas, estructura y condiciones del curso.',
  },
  {
    id: 'draft-receive',
    relativeCode: 'T-25',
    name: 'Recibir borrador corregido por la escuela',
    reference: 'INICIO_CURSO',
    offsetDays: -25,
    description: 'Recepción del borrador validado o corregido antes de preparar la publicación.',
  },
  {
    id: 'publish-call',
    relativeCode: 'T-18',
    name: 'Preparar/publicar convocatoria',
    reference: 'INICIO_CURSO',
    offsetDays: -18,
    description: 'Hito de control para elevar la convocatoria y evitar retrasos por publicación en BOD.',
  },
  {
    id: 'requests-close',
    relativeCode: 'T-9',
    name: 'Fin de plazo de solicitudes',
    reference: 'INICIO_CURSO',
    offsetDays: -9,
  },
  {
    id: 'visa-close',
    relativeCode: 'T-6',
    name: 'Fin de visado / extracción de peticionarios',
    reference: 'INICIO_CURSO',
    offsetDays: -6,
  },
  {
    id: 'appointment-proposal',
    relativeCode: 'T-4',
    name: 'Propuesta de nombramiento de alumnos',
    reference: 'INICIO_CURSO',
    offsetDays: -4,
  },
  {
    id: 'appointment-send',
    relativeCode: 'T-3',
    name: 'Envío de nombramiento para firma/publicación',
    reference: 'INICIO_CURSO',
    offsetDays: -3,
  },
  {
    id: 'course-start',
    relativeCode: 'T',
    name: 'Inicio del curso',
    reference: 'INICIO_CURSO',
    offsetDays: 0,
  },
  {
    id: 'course-end',
    relativeCode: 'F',
    name: 'Fin del curso',
    reference: 'FIN_CURSO',
    offsetDays: 0,
    finalizationChain: true,
    description: 'Fecha raíz de la cadena automática de finalización: novedad, acta, publicación BOD y cierre.',
  },
  {
    id: 'final-news-request',
    relativeCode: 'F+3',
    name: 'Solicitar novedad de finalización a la escuela',
    reference: 'FIN_CURSO',
    offsetDays: 3,
    finalizationChain: true,
    description: 'Solicitud de datos de finalización vinculada directamente a la fecha fin del curso.',
  },
  {
    id: 'acta-remission',
    relativeCode: 'F+5',
    name: 'Remisión de acta / relación de alumnos finalizados por la escuela',
    reference: 'FIN_CURSO',
    offsetDays: 5,
    finalizationChain: true,
    description: 'Control específico para exigir la remisión del acta o relación de alumnos finalizados tras la fecha fin.',
  },
  {
    id: 'acta-receive',
    relativeCode: 'F+6',
    name: 'Validar acta y datos de egreso en DIENA',
    reference: 'FIN_CURSO',
    offsetDays: 6,
    finalizationChain: true,
    description: 'Validación interna de egresados, bajas, mujeres egresadas y coherencia documental antes de la publicación.',
  },
  {
    id: 'bod-finalization',
    relativeCode: 'F+10',
    name: 'Preparar publicación BOD de finalización',
    reference: 'FIN_CURSO',
    offsetDays: 10,
    finalizationChain: true,
    description: 'Preparación de la resolución/oficio de finalización vinculada a la recepción y validación del acta.',
  },
  {
    id: 'admin-close',
    relativeCode: 'F+15',
    name: 'Cierre administrativo del curso',
    reference: 'FIN_CURSO',
    offsetDays: 15,
    finalizationChain: true,
    description: 'Cierre de expediente operativo una vez tramitada la publicación de finalización.',
  },
];

export const medicalAndPhysicalTemplate: CourseMilestoneTemplate = {
  id: 'medical-physical-results',
  relativeCode: 'T-5',
  name: 'Recepción de resultados de pruebas físicas y reconocimiento médico',
  reference: 'INICIO_CURSO',
  offsetDays: -5,
  isMedicalOptional: true,
};

function addDays(dateAsIso: string, days: number): string {
  const date = new Date(`${dateAsIso}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function getDaysUntil(date: string, today = new Date()): number {
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const target = new Date(date + 'T00:00:00');
  return Math.ceil((target.getTime() - todayStart.getTime()) / 86400000);
}

export function getMilestoneTemplates(requiresMedicalAndPhysical: boolean): CourseMilestoneTemplate[] {
  const templates = [...baseMilestoneTemplates];

  if (requiresMedicalAndPhysical) {
    const proposalIndex = templates.findIndex((item) => item.id === 'appointment-proposal');
    templates.splice(proposalIndex >= 0 ? proposalIndex : 5, 0, medicalAndPhysicalTemplate);
  }

  return templates;
}

export function generateCourseMilestones(
  startDate: string,
  endDate: string,
  requiresMedicalAndPhysical: boolean,
  previousMilestones: CourseMilestone[] = [],
): CourseMilestone[] {
  const previousById = new Map(previousMilestones.map((milestone) => [milestone.id, milestone]));

  return getMilestoneTemplates(requiresMedicalAndPhysical)
    .map((template) => {
      const referenceDate = template.reference === 'INICIO_CURSO' ? startDate : endDate;
      const previous = previousById.get(template.id);

      return {
        ...template,
        calculatedDate: addDays(referenceDate, template.offsetDays),
        completed: previous?.completed ?? false,
        observations: previous?.observations ?? '',
      };
    })
    .sort((a, b) => a.calculatedDate.localeCompare(b.calculatedDate));
}

export function getLastCompletedMilestone(milestones: CourseMilestone[]): CourseMilestone | undefined {
  return [...milestones]
    .filter((milestone) => milestone.completed)
    .sort((a, b) => b.calculatedDate.localeCompare(a.calculatedDate))[0];
}

export function getNextPendingMilestone(milestones: CourseMilestone[]): CourseMilestone | undefined {
  return [...milestones]
    .filter((milestone) => !milestone.completed)
    .sort((a, b) => a.calculatedDate.localeCompare(b.calculatedDate))[0];
}

export function getFinalizationMilestones(milestones: CourseMilestone[]): CourseMilestone[] {
  return milestones.filter((milestone) => milestone.finalizationChain || milestone.reference === 'FIN_CURSO');
}

export function getPendingFinalizationMilestones(milestones: CourseMilestone[]): CourseMilestone[] {
  return getFinalizationMilestones(milestones).filter((milestone) => !milestone.completed);
}

export function isMilestoneOverdue(milestone: CourseMilestone | undefined, today = new Date()): boolean {
  if (!milestone || milestone.completed) return false;
  const todayIso = today.toISOString().slice(0, 10);
  return milestone.calculatedDate < todayIso;
}

export function getCourseTrackingLabel(milestones: CourseMilestone[]): string {
  const next = getNextPendingMilestone(milestones);
  return next ? next.name : 'Seguimiento completado';
}
