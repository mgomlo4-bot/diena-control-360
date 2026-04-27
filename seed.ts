import { PrismaClient, EstadoHito, EstadoTarea, PrioridadTarea, EstadoInstancia, EstadoImportacion, EstadoFilaImportacion } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Crear responsable por defecto
  const sinAsignar = await prisma.responsable.upsert({
    where: { nombre: 'SIN ASIGNAR' },
    update: {},
    create: {
      nombre: 'SIN ASIGNAR',
      rolApp: 'sistema',
      activo: true,
    },
  });

  // Lista oficial de estados de curso
  const estadosCurso = [
    { orden: 1, codigo: 'NO_ACTIVADO', nombre: 'NO ACTIVADO', color: '#6b7280' },
    { orden: 2, codigo: 'ACTIVADO', nombre: 'ACTIVADO', color: '#10b981' },
    { orden: 3, codigo: 'BORRADOR_CONVOCATORIA_PENDIENTE', nombre: 'BORRADOR CONVOCATORIA PENDIENTE', color: '#f59e0b' },
    { orden: 4, codigo: 'BORRADOR_ENVIADO_A_ESCUELA', nombre: 'BORRADOR ENVIADO A ESCUELA', color: '#f59e0b' },
    { orden: 5, codigo: 'BORRADOR_CORREGIDO_RECIBIDO', nombre: 'BORRADOR CORREGIDO RECIBIDO', color: '#f59e0b' },
    { orden: 6, codigo: 'CONVOCATORIA_PENDIENTE_DE_PUBLICAR', nombre: 'CONVOCATORIA PENDIENTE DE PUBLICAR', color: '#eab308' },
    { orden: 7, codigo: 'CONVOCATORIA_PUBLICADA', nombre: 'CONVOCATORIA PUBLICADA', color: '#eab308' },
    { orden: 8, codigo: 'SOLICITUDES_VISADO_EN_CURSO', nombre: 'SOLICITUDES / VISADO EN CURSO', color: '#22d3ee' },
    { orden: 9, codigo: 'VISADO_FINALIZADO', nombre: 'VISADO FINALIZADO', color: '#22d3ee' },
    { orden: 10, codigo: 'NOMBRAMIENTO_PENDIENTE', nombre: 'NOMBRAMIENTO PENDIENTE', color: '#3b82f6' },
    { orden: 11, codigo: 'PENDIENTE_PRUEBAS_FISICAS_Y_RECONOCIMIENTO_MEDICO', nombre: 'PENDIENTE PRUEBAS FISICAS Y RECONOCIMIENTO MEDICO', color: '#ec4899' },
    { orden: 12, codigo: 'ALUMNOS_NOMBRADOS', nombre: 'ALUMNOS NOMBRADOS', color: '#3b82f6' },
    { orden: 13, codigo: 'PENDIENTE_DE_INICIO', nombre: 'PENDIENTE DE INICIO', color: '#64748b' },
    { orden: 14, codigo: 'EN_EJECUCION', nombre: 'EN EJECUCION', color: '#0ea5e9' },
    { orden: 15, codigo: 'FINALIZADO_PENDIENTE_DE_ACTA', nombre: 'FINALIZADO PENDIENTE DE ACTA', color: '#8b5cf6' },
    { orden: 16, codigo: 'ACTA_NOVEDAD_RECIBIDA', nombre: 'ACTA / NOVEDAD RECIBIDA', color: '#a855f7' },
    { orden: 17, codigo: 'PENDIENTE_ENVIO_A_BOD', nombre: 'PENDIENTE ENVIO A BOD', color: '#d97706' },
    { orden: 18, codigo: 'ENVIADO_A_BOD', nombre: 'ENVIADO A BOD', color: '#d97706' },
    { orden: 19, codigo: 'PENDIENTE_PUBLICACION_FINALIZACION_BOD', nombre: 'PENDIENTE PUBLICACION FINALIZACION BOD', color: '#16a34a' },
    { orden: 20, codigo: 'FINALIZACION_PUBLICADA_EN_BOD', nombre: 'FINALIZACION PUBLICADA EN BOD', color: '#16a34a' },
    { orden: 21, codigo: 'CERRADO', nombre: 'CERRADO', color: '#6b21a8' },
  ];

  for (const estado of estadosCurso) {
    await prisma.estadoCurso.upsert({
      where: { orden: estado.orden },
      update: {},
      create: {
        orden: estado.orden,
        codigo: estado.codigo,
        nombre: estado.nombre,
        color: estado.color,
      },
    });
  }

  // Crear algunos centros demo
  const centro1 = await prisma.centroOrganismo.upsert({
    where: { sigla: 'ESCUELA1' },
    update: {},
    create: {
      nombre: 'Escuela Naval de Operaciones',
      sigla: 'ESCUELA1',
      tipo: 'Escuela',
      localidad: 'San Fernando',
    },
  });
  const centro2 = await prisma.centroOrganismo.upsert({
    where: { sigla: 'CENTRO2' },
    update: {},
    create: {
      nombre: 'Centro de Formación Técnica',
      sigla: 'CENTRO2',
      tipo: 'Centro docente',
      localidad: 'Madrid',
    },
  });

  // Crear algunos cursos demo
  const estadoActivado = await prisma.estadoCurso.findFirst({ where: { codigo: 'ACTIVADO' } });
  const curso1 = await prisma.curso.upsert({
    where: { codigoCurso: 'C-2026-001' },
    update: {},
    create: {
      codigoCurso: 'C-2026-001',
      nombreCurso: 'Curso de Navegación Básica',
      tipoCurso: 'INFORMATIVO',
      categoriaOperativa: 'INFORMATIVO',
      estadoCursoId: estadoActivado!.id,
      escuelaCentroId: centro1.id,
      responsableId: sinAsignar.id,
      mesComienzo: 1,
      anio: 2026,
      fechaInicio: new Date('2026-01-15'),
      fechaFin: new Date('2026-01-30'),
    },
  });
  const curso2 = await prisma.curso.upsert({
    where: { codigoCurso: 'C-2026-002' },
    update: {},
    create: {
      codigoCurso: 'C-2026-002',
      nombreCurso: 'Curso Avanzado de ECOM',
      tipoCurso: 'ECOM',
      categoriaOperativa: 'ECOM',
      estadoCursoId: estadoActivado!.id,
      escuelaCentroId: centro2.id,
      responsableId: sinAsignar.id,
      mesComienzo: 3,
      anio: 2026,
      fechaInicio: new Date('2026-03-05'),
      fechaFin: new Date('2026-03-20'),
    },
  });

  console.log('Datos de ejemplo insertados correctamente');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });