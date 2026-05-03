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
    appointedWomen: 3,
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
    appointedWomen: 2,
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
    appointedWomen: 1,
    droppedStudents: 0,
    graduatedStudents: 0,
    graduatedWomen: 0,
  }),
];

export function findCourseById(id: string): Course | undefined {
  return mockCourses.find((course) => course.id === id);
}
