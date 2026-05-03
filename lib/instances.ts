export type InstanceStatus =
  | 'recibida'
  | 'pendiente_informe'
  | 'informe_solicitado'
  | 'informe_recibido'
  | 'borrador_resolucion'
  | 'notificada'
  | 'recurso_alzada'
  | 'cerrada';

export type InstancePriority = 'critica' | 'alta' | 'media' | 'baja';

export type AdministrativeInstance = {
  id: string;
  reference: string;
  subject: string;
  applicant: string;
  dni?: string;
  unit?: string;
  courseId?: string;
  courseCode?: string;
  courseName?: string;
  status: InstanceStatus;
  priority: InstancePriority;
  entryDate: string;
  dueDate?: string;
  responsible: string;
  lastAction: string;
  nextAction: string;
  observations?: string;
};

export const instanceStatusLabels: Record<InstanceStatus, string> = {
  recibida: 'Recibida',
  pendiente_informe: 'Pendiente de informe',
  informe_solicitado: 'Informe solicitado',
  informe_recibido: 'Informe recibido',
  borrador_resolucion: 'Borrador de resolución',
  notificada: 'Notificada',
  recurso_alzada: 'Recurso de alzada',
  cerrada: 'Cerrada',
};

export const mockInstances: AdministrativeInstance[] = [];

export function findInstanceByText(instances: AdministrativeInstance[], text: string): AdministrativeInstance | undefined {
  const normalized = text.toLowerCase().trim();
  if (!normalized) return undefined;

  return instances.find((item) =>
    [item.reference, item.subject, item.applicant, item.courseCode, item.courseName, item.status, item.unit]
      .filter(Boolean)
      .some((value) => {
        const candidate = String(value).toLowerCase();
        return candidate.includes(normalized) || normalized.includes(candidate);
      }),
  );
}
