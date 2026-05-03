import {
  Course,
  getDaysUntil,
  getFinalizationMilestones,
  getNextPendingMilestone,
  isMilestoneOverdue,
} from './courseMilestones';
import { getCoursePhase, hasPendingActa, hasPendingFinalizationPublication } from './courseStatus';

export type CourseAlert = {
  id: string;
  level: 'critica' | 'alta' | 'media' | 'informativa';
  title: string;
  description: string;
};

export function getCourseAlerts(course: Course): CourseAlert[] {
  const alerts: CourseAlert[] = [];
  const next = getNextPendingMilestone(course.milestones);
  const phase = getCoursePhase(course.status);

  if (isMilestoneOverdue(next)) {
    alerts.push({
      id: 'next-overdue',
      level: 'critica',
      title: 'Hito vencido',
      description: `El siguiente hito pendiente está vencido: ${next?.name}.`,
    });
  }

  if (next) {
    const days = getDaysUntil(next.calculatedDate);
    if (days >= 0 && days <= 7) {
      alerts.push({
        id: 'next-close',
        level: 'alta',
        title: 'Hito próximo',
        description: `El siguiente hito vence en ${days} día/s.`,
      });
    }
  }

  const medicalMilestone = course.milestones.find((milestone) => milestone.id === 'medical-physical-results');
  if (course.requiresMedicalAndPhysical && medicalMilestone && !medicalMilestone.completed) {
    alerts.push({
      id: 'medical-pending',
      level: 'alta',
      title: 'Resultados médicos pendientes',
      description: 'El curso requiere pruebas físicas y reconocimiento médico y aún no consta recepción de resultados.',
    });
  }

  const endMilestone = course.milestones.find((milestone) => milestone.id === 'course-end');
  const finalizationMilestones = getFinalizationMilestones(course.milestones).filter((milestone) => milestone.id !== 'course-end');
  const overdueFinalization = finalizationMilestones.filter((milestone) => !milestone.completed && isMilestoneOverdue(milestone));

  if (endMilestone && endMilestone.calculatedDate < new Date().toISOString().slice(0, 10) && phase !== 'cierre' && phase !== 'incidencia') {
    alerts.push({
      id: 'post-end-chain-open',
      level: 'alta',
      title: 'Cadena posterior a fin abierta',
      description: 'El curso ya ha finalizado y mantiene actuaciones posteriores pendientes: novedad, acta, publicación o cierre.',
    });
  }

  if (hasPendingActa(course)) {
    const level = overdueFinalization.some((milestone) => milestone.id === 'acta-remission' || milestone.id === 'acta-receive') ? 'critica' : 'media';
    alerts.push({
      id: 'acta-pending',
      level,
      title: 'Acta pendiente',
      description: 'La remisión/validación del acta o relación de alumnos finalizados sigue pendiente y está vinculada a la fecha fin del curso.',
    });
  }

  if (hasPendingFinalizationPublication(course)) {
    const bodMilestone = course.milestones.find((milestone) => milestone.id === 'bod-finalization');
    alerts.push({
      id: 'bod-pending',
      level: bodMilestone && isMilestoneOverdue(bodMilestone) ? 'critica' : 'media',
      title: 'Publicación de finalización pendiente',
      description: 'Pendiente preparar o controlar la publicación BOD de finalización del curso.',
    });
  }

  if (!alerts.length) {
    alerts.push({
      id: 'ok',
      level: 'informativa',
      title: 'Sin alertas críticas',
      description: 'No se detectan bloqueos operativos inmediatos para este curso.',
    });
  }

  return alerts;
}

export function getHighestAlertLevel(course: Course): CourseAlert['level'] {
  const alerts = getCourseAlerts(course);
  if (alerts.some((alert) => alert.level === 'critica')) return 'critica';
  if (alerts.some((alert) => alert.level === 'alta')) return 'alta';
  if (alerts.some((alert) => alert.level === 'media')) return 'media';
  return 'informativa';
}
