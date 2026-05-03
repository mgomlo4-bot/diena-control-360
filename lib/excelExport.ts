import * as XLSX from 'xlsx';
import { Course, getLastCompletedMilestone, getNextPendingMilestone, isMilestoneOverdue } from './courseMilestones';
import { AdministrativeInstance, instanceStatusLabels } from './instances';

function safeNumber(value: number | undefined): number {
  return Number.isFinite(value) ? Number(value) : 0;
}

function percent(part: number, total: number): string {
  if (!total) return '0%';
  return `${Math.round((part / total) * 100)}%`;
}

function setColumns(sheet: XLSX.WorkSheet, widths: number[]): void {
  sheet['!cols'] = widths.map((wch) => ({ wch }));
}

export function buildCoursesStatusRows(courses: Course[]) {
  return courses.map((course) => {
    const next = getNextPendingMilestone(course.milestones);
    const last = getLastCompletedMilestone(course.milestones);
    return {
      Codigo: course.code,
      Curso: course.name,
      Estado: course.status,
      Tipo: course.type,
      Modalidad: course.modality,
      Escuela: course.school,
      Inicio: course.startDate,
      Fin: course.endDate,
      Activo: course.active ? 'SI' : 'NO',
      ReconocimientoMedico: course.requiresMedicalAndPhysical ? 'SI' : 'NO',
      UltimoHitoCompletado: last?.name ?? 'Sin hitos completados',
      SiguienteHitoPendiente: next?.name ?? 'Seguimiento completado',
      FechaSiguienteHito: next?.calculatedDate ?? '',
      Alerta: next ? (isMilestoneOverdue(next) ? 'Vencido' : 'Pendiente') : 'Completado',
    };
  });
}

export function buildCourseStatisticsRows(courses: Course[]) {
  return courses.map((course) => {
    const appointed = safeNumber(course.appointedStudents);
    const appointedWomen = safeNumber(course.appointedWomen);
    const dropped = safeNumber(course.droppedStudents);
    const graduated = safeNumber(course.graduatedStudents);
    const graduatedWomen = safeNumber(course.graduatedWomen);
    return {
      Codigo: course.code,
      Curso: course.name,
      AlumnosNombrados: appointed,
      MujeresNombradas: appointedWomen,
      PorcentajeMujeresNombradas: percent(appointedWomen, appointed),
      BajasDuranteCurso: dropped,
      PorcentajeBajas: percent(dropped, appointed),
      AlumnosQuePermanecen: Math.max(appointed - dropped, 0),
      AlumnosEgresados: graduated,
      PorcentajeEgresados: percent(graduated, appointed),
      MujeresEgresadas: graduatedWomen,
      PorcentajeMujeresEgresadas: percent(graduatedWomen, graduated),
    };
  });
}

export function buildInstanceRows(instances: AdministrativeInstance[]) {
  return instances.map((item) => ({
    Referencia: item.reference,
    Instancia: item.subject,
    Interesado: item.applicant,
    DNI: item.dni ?? '',
    UnidadDestino: item.unit ?? '',
    CodigoCurso: item.courseCode ?? '',
    Curso: item.courseName ?? '',
    Estado: instanceStatusLabels[item.status],
    Prioridad: item.priority,
    FechaEntrada: item.entryDate,
    Vencimiento: item.dueDate ?? '',
    Responsable: item.responsible,
    UltimaActuacion: item.lastAction,
    SiguientePaso: item.nextAction,
    Observaciones: item.observations ?? '',
  }));
}

export function buildSummaryRows(courses: Course[], instances: AdministrativeInstance[]) {
  const activeCourses = courses.filter((course) => course.active).length;
  const overdueCourses = courses.filter((course) => isMilestoneOverdue(getNextPendingMilestone(course.milestones))).length;
  const totalAppointed = courses.reduce((sum, course) => sum + safeNumber(course.appointedStudents), 0);
  const totalAppointedWomen = courses.reduce((sum, course) => sum + safeNumber(course.appointedWomen), 0);
  const totalDropped = courses.reduce((sum, course) => sum + safeNumber(course.droppedStudents), 0);
  const totalGraduated = courses.reduce((sum, course) => sum + safeNumber(course.graduatedStudents), 0);
  const totalGraduatedWomen = courses.reduce((sum, course) => sum + safeNumber(course.graduatedWomen), 0);
  return [
    { Indicador: 'Cursos cargados', Valor: courses.length },
    { Indicador: 'Cursos activos', Valor: activeCourses },
    { Indicador: 'Cursos con hito vencido', Valor: overdueCourses },
    { Indicador: 'Alumnos nombrados', Valor: totalAppointed },
    { Indicador: 'Mujeres nombradas', Valor: totalAppointedWomen },
    { Indicador: 'Bajas durante curso', Valor: totalDropped },
    { Indicador: 'Alumnos egresados', Valor: totalGraduated },
    { Indicador: 'Mujeres egresadas', Valor: totalGraduatedWomen },
    { Indicador: 'Instancias cargadas', Valor: instances.length },
    { Indicador: 'Fecha de exportación', Valor: new Date().toISOString().slice(0, 10) },
  ];
}

export function exportDienaWorkbook(courses: Course[], instances: AdministrativeInstance[]): void {
  const workbook = XLSX.utils.book_new();
  const summarySheet = XLSX.utils.json_to_sheet(buildSummaryRows(courses, instances));
  const coursesSheet = XLSX.utils.json_to_sheet(buildCoursesStatusRows(courses));
  const statsSheet = XLSX.utils.json_to_sheet(buildCourseStatisticsRows(courses));
  const instancesSheet = XLSX.utils.json_to_sheet(buildInstanceRows(instances));

  setColumns(summarySheet, [32, 24]);
  setColumns(coursesSheet, [18, 42, 28, 14, 16, 30, 14, 14, 10, 20, 38, 38, 18, 14]);
  setColumns(statsSheet, [18, 42, 18, 18, 26, 20, 18, 22, 18, 20, 18, 24]);
  setColumns(instancesSheet, [22, 46, 28, 14, 28, 18, 36, 24, 14, 16, 16, 30, 42, 42, 42]);

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');
  XLSX.utils.book_append_sheet(workbook, coursesSheet, 'Estado cursos');
  XLSX.utils.book_append_sheet(workbook, statsSheet, 'Estadisticas cursos');
  XLSX.utils.book_append_sheet(workbook, instancesSheet, 'Instancias');

  XLSX.writeFile(workbook, `DIENA_CONTROL_360_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
