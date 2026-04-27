export type MilestoneReference = 'INICIO_CURSO' | 'FIN_CURSO';
export type MilestoneStatus = 'pendiente' | 'completado';

export type CourseMilestoneTemplate = {
  id: string;
  relativeCode: string;
  name: string;
  reference: MilestoneReference;
  offsetDays: number;
  isMedicalOptional?: boolean;
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
  },
  {
    id: 'draft-receive',
    relativeCode: 'T-25',
    name: 'Recibir borrador corregido por la escuela',
    reference: 'INICIO_CURSO',
    offsetDays: -25,
  },
  {
    id: 'publish-call',
    relativeCode: 'T-18',
    name: 'Preparar/publicar convocatoria',
    reference: 'INICIO_CURSO',
    offsetDays: -18,
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
  },
  {
    id: 'final-news-request',
    relativeCode: 'F+3',
    name: 'Solicitar novedad de finalización',
    reference: 'FIN_CURSO',
    offsetDays: 3,
  },
  {
    id: 'acta-receive',
    relativeCode: 'F+5',
    name: 'Recibir acta o relación de alumnos finalizados',
    reference: 'FIN_CURSO',
    offsetDays: 5,
  },
  {
    id: 'bod-finalization',
    relativeCode: 'F+10',
    name: 'Preparar publicación BOD de finalización',
    reference: 'FIN_CURSO',
    offsetDays: 10,
  },
  {
    id: 'admin-close',
    relativeCode: 'F+15',
    name: 'Cierre administrativo del curso',
    reference: 'FIN_CURSO',
    offsetDays: 15,
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

export function isMilestoneOverdue(milestone: CourseMilestone | undefined, today = new Date()): boolean {
  if (!milestone || milestone.completed) return false;
  const todayIso = today.toISOString().slice(0, 10);
  return milestone.calculatedDate < todayIso;
}

export function getCourseTrackingLabel(milestones: CourseMilestone[]): string {
  const next = getNextPendingMilestone(milestones);
  return next ? next.name : 'Seguimiento completado';
}
