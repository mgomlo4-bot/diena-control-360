import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();

    const milestone = await prisma.courseMilestone.update({
      where: { id: params.id },
      data: {
        name: body.name,
        relativeCode: body.relativeCode,
        calculatedDate: body.calculatedDate ? new Date(body.calculatedDate) : undefined,
        completed: body.completed,
        completedAt: body.completed === true ? new Date() : body.completed === false ? null : undefined,
        completedBy: body.completedBy,
        observations: body.observations,
        isManual: body.isManual,
      },
    });

    return NextResponse.json({ ok: true, data: milestone });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'No se pudo actualizar el hito.' },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.courseMilestone.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'No se pudo eliminar el hito.' },
      { status: 500 },
    );
  }
}
