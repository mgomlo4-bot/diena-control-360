import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        milestones: {
          orderBy: { calculatedDate: 'asc' },
        },
        tasks: {
          orderBy: { dueDate: 'asc' },
        },
      },
      orderBy: [{ startDate: 'asc' }, { code: 'asc' }],
    });

    return NextResponse.json({ ok: true, data: courses });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'No se pudieron obtener los cursos.',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const course = await prisma.course.create({
      data: {
        code: body.code,
        name: body.name,
        status: body.status ?? 'NO_ACTIVADO',
        type: body.type,
        modality: body.modality,
        school: body.school,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        active: body.active ?? true,
        requiresMedicalAndPhysical: body.requiresMedicalAndPhysical ?? false,
        appointedStudents: body.appointedStudents ?? 0,
        droppedStudents: body.droppedStudents ?? 0,
        graduatedStudents: body.graduatedStudents ?? 0,
        graduatedWomen: body.graduatedWomen ?? 0,
        observations: body.observations ?? null,
      },
    });

    return NextResponse.json({ ok: true, data: course }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'No se pudo crear el curso.',
      },
      { status: 500 },
    );
  }
}
