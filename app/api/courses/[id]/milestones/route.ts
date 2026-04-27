import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const milestones = await prisma.courseMilestone.findMany({
      where: { courseId: params.id },
      orderBy: { calculatedDate: 'asc' },
    });

    return NextResponse.json({ ok: true, data: milestones });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'No se pudieron obtener los hitos.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();

    const milestone = await prisma.courseMilestone.create({
      data: {
        courseId: params.id,
        templateKey: body.templateKey ?? null,
        relativeCode: body.relativeCode,
        name: body.name,
        reference: body.reference,
        offsetDays: body.offsetDays,
        calculatedDate: new Date(body.calculatedDate),
        completed: body.completed ?? false,
        observations: body.observations ?? null,
        isManual: body.isManual ?? false,
      },
    });

    return NextResponse.json({ ok: true, data: milestone }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'No se pudo crear el hito.' },
      { status: 500 },
    );
  }
}
