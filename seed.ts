import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.course.upsert({
    where: { code: 'C-2026-001' },
    update: {},
    create: {
      code: 'C-2026-001',
      name: 'Curso de Navegación Básica',
      status: 'ACTIVADO',
      type: 'INFORMATIVO',
      modality: 'Presencial',
      school: 'Escuela Naval de Operaciones',
      startDate: new Date('2026-01-15'),
      endDate: new Date('2026-01-30'),
      active: true,
      appointedStudents: 18,
      appointedWomen: 3,
      droppedStudents: 1,
      graduatedStudents: 17,
      graduatedWomen: 3,
      observations: 'Curso demo inicial.',
    },
  });

  await prisma.course.upsert({
    where: { code: 'C-2026-002' },
    update: {},
    create: {
      code: 'C-2026-002',
      name: 'Curso Avanzado de ECOM',
      status: 'PENDIENTE_NOMBRAMIENTO_ALUMNOS',
      type: 'ECOM',
      modality: 'Mixta',
      school: 'Centro de Formación Técnica',
      startDate: new Date('2026-03-05'),
      endDate: new Date('2026-03-20'),
      active: true,
      requiresMedicalAndPhysical: true,
      appointedStudents: 0,
      appointedWomen: 0,
      observations: 'Curso demo pendiente de nombramiento.',
    },
  });

  console.log('Seed DIENA Control 360 completado correctamente.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });