import { Course, generateCourseMilestones } from './courseMilestones';

export type CourseSeed = Omit<Course, 'milestones'>;

export function buildCourse(course: CourseSeed): Course {
  return {
    ...course,
    milestones: generateCourseMilestones(course.startDate, course.endDate, course.requiresMedicalAndPhysical),
  };
}

export const mockCourses: Course[] = [
  buildCourse({
    id: 'ecom-tci-2026',
    code: '60046 2026 001',
    name: 'ECOM TCI para Suboficiales',
    status: 'ACTIVADO',
    type: 'ECOM',
    modality: 'Mixto',
    school: 'Escuela Antonio de Escaño',
    startDate: '2026-09-14',
    endDate: '2026-10-09',
    active: true,
    requiresMedicalAndPhysical: false,
    appointedStudents: 24,
    droppedStudents: 1,
    graduatedStudents: 0,
    graduatedWomen: 0,
  }),
  buildCourse({
    id: 'ecom-seg-2026',
    code: '60181 2026 001',
    name: 'ECOM SEG para Suboficiales',
    status: 'PENDIENTE PRUEBAS FISICAS Y RECONOCIMIENTO MEDICO',
    type: 'ECOM',
    modality: 'Presencial',
    school: 'CESUPAR',
    startDate: '2026-06-22',
    endDate: '2026-07-03',
    active: true,
    requiresMedicalAndPhysical: true,
    appointedStudents: 18,
    droppedStudents: 0,
    graduatedStudents: 0,
    graduatedWomen: 0,
  }),
  buildCourse({
    id: 'e2t-tci-ciber-2026',
    code: '62T04 2026 001',
    name: 'E2T TCI-Ciber para Oficiales',
    status: 'PENDIENTE DE NOMBRAMIENTO DE ALUMNOS',
    type: 'E2T',
    modality: 'Mixto',
    school: 'DIENA / Defensa',
    startDate: '2026-11-02',
    endDate: '2026-12-18',
    active: true,
    requiresMedicalAndPhysical: false,
    appointedStudents: 12,
    droppedStudents: 0,
    graduatedStudents: 0,
    graduatedWomen: 0,
  }),
  buildCourse({
    id: 'apt-tyc-finalizacion-2026',
    code: '60479 2026 001',
    name: 'APT TYC para Suboficiales CSS',
    status: 'FINALIZADO PENDIENTE ACTA',
    type: 'APT',
    modality: 'Mixto',
    school: 'Escuela Antonio de Escaño',
    startDate: '2026-03-02',
    endDate: '2026-04-17',
    active: true,
    requiresMedicalAndPhysical: false,
    appointedStudents: 20,
    droppedStudents: 2,
    graduatedStudents: 18,
    graduatedWomen: 3,
  }),
  buildCourse({
    id: 'cadec-xvi-2026',
    code: 'CADEC XVI 2026 002',
    name: 'Curso de Ascenso a Comandante - tanda 2',
    status: 'ACTA RECIBIDA PENDIENTE PUBLICACION FINALIZACION',
    type: 'CADEC',
    modality: 'Mixto',
    school: 'DIENA / CEVACO',
    startDate: '2026-01-12',
    endDate: '2026-02-20',
    active: true,
    requiresMedicalAndPhysical: false,
    appointedStudents: 36,
    droppedStudents: 1,
    graduatedStudents: 35,
    graduatedWomen: 5,
  }),
];

export function findCourseById(id: string): Course | undefined {
  return mockCourses.find((course) => course.id === id);
}
