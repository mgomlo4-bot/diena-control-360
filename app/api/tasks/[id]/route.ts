import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        course: true,
        milestone: true,
        request: true,
        document: true,
      },
    });

    if (!task) {
      return NextResponse.json({ ok: false, error: 'Tarea no encontrada.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: task });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'No se pudo obtener la tarea.' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();

    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        courseId: body.courseId,
        milestoneId: body.milestoneId,
        requestId: body.requestId,
        documentId: body.documentId,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        priority: body.priority,
        status: body.status,
        responsible: body.responsible,
        source: body.source,
        linkType: body.linkType,
        relatedLabel: body.relatedLabel,
      },
    });

    return NextResponse.json({ ok: true, data: task });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'No se pudo actualizar la tarea.' },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.task.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'No se pudo eliminar la tarea.' },
      { status: 500 },
    );
  }
}
