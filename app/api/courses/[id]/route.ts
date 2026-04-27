import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        milestones: { orderBy: { calculatedDate: 'asc' } },
        tasks: { orderBy: { dueDate: 'asc' } },
        requests: { orderBy: { entryDate: 'desc' } },
        documents: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!course) {
      return NextResponse.json({ ok: false, error: 'Curso no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: course });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'No se pudo obtener el curso.' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();

    const course = await prisma.course.update({
      where: { id: params.id },
      data: {
        code: body.code,
        name: body.name,
        status: body.status,
        type: body.type,
        modality: body.modality,
        school: body.school,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        active: body.active,
        requiresMedicalAndPhysical: body.requiresMedicalAndPhysical,
        appointedStudents: body.appointedStudents,
        droppedStudents: body.droppedStudents,
        graduatedStudents: body.graduatedStudents,
        graduatedWomen: body.graduatedWomen,
        observations: body.observations,
      },
    });

    return NextResponse.json({ ok: true, data: course });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'No se pudo actualizar el curso.' },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.course.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'No se pudo eliminar el curso.' },
      { status: 500 },
    );
  }
}
