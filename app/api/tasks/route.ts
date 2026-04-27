import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        course: true,
        milestone: true,
        request: true,
        document: true,
      },
      orderBy: [{ dueDate: 'asc' }, { priority: 'asc' }],
    });

    return NextResponse.json({ ok: true, data: tasks });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'No se pudieron obtener las tareas.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description ?? null,
        courseId: body.courseId ?? null,
        milestoneId: body.milestoneId ?? null,
        requestId: body.requestId ?? null,
        documentId: body.documentId ?? null,
        dueDate: new Date(body.dueDate),
        priority: body.priority ?? 'MEDIA',
        status: body.status ?? 'PENDIENTE',
        responsible: body.responsible,
        source: body.source ?? 'MANUAL',
        linkType: body.linkType ?? 'GENERAL',
        relatedLabel: body.relatedLabel ?? 'Tarea general',
      },
    });

    return NextResponse.json({ ok: true, data: task }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'No se pudo crear la tarea.' },
      { status: 500 },
    );
  }
}
