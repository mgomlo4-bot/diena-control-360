import { Course, getNextPendingMilestone, isMilestoneOverdue } from './courseMilestones';

export type CourseAlert = {
  id: string;
  level: 'critica' | 'alta' | 'media' | 'informativa';
  title: string;
  description: string;
};

function daysUntil(date: string): number {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const target = new Date(date + 'T00:00:00');
  return Math.ceil((target.getTime() - todayStart.getTime()) / 86400000);
}

export function getCourseAlerts(course: Course): CourseAlert[] {
  const alerts: CourseAlert[] = [];
  const next = getNextPendingMilestone(course.milestones);

  if (isMilestoneOverdue(next)) {
    alerts.push({
      id: 'next-overdue',
      level: 'critica',
      title: 'Hito vencido',
      description: `El siguiente hito pendiente está vencido: ${next?.name}.`,
    });
  }

  if (next) {
    const days = daysUntil(next.calculatedDate);
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

  const actaMilestone = course.milestones.find((milestone) => milestone.id === 'acta-receive');
  if (actaMilestone && !actaMilestone.completed && isMilestoneOverdue(actaMilestone)) {
    alerts.push({
      id: 'acta-pending',
      level: 'media',
      title: 'Acta pendiente',
      description: 'El hito de recepción de acta o relación de alumnos finalizados está pendiente.',
    });
  }

  const bodMilestone = course.milestones.find((milestone) => milestone.id === 'bod-finalization');
  if (bodMilestone && !bodMilestone.completed && isMilestoneOverdue(bodMilestone)) {
    alerts.push({
      id: 'bod-pending',
      level: 'media',
      title: 'BOD de finalización pendiente',
      description: 'El curso tiene pendiente la preparación de publicación BOD de finalización.',
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
