import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getCurrentUser, hashPassword, requireAdmin } from '../../../../lib/auth';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const data: { displayName?: string; role?: 'ADMIN' | 'USER'; active?: boolean; passwordHash?: string } = {};

    if (typeof body.displayName === 'string') data.displayName = body.displayName.trim();
    if (body.role === 'ADMIN' || body.role === 'USER') data.role = body.role;
    if (typeof body.active === 'boolean') data.active = body.active;
    if (typeof body.password === 'string' && body.password.length >= 8) data.passwordHash = hashPassword(body.password);

    if (currentUser?.id === params.id && data.active === false) {
      return NextResponse.json({ ok: false, error: 'No puede desactivar su propio usuario administrador.' }, { status: 400 });
    }

    const user = await prisma.appUser.update({
      where: { id: params.id },
      data,
      select: { id: true, username: true, displayName: true, role: true, active: true, createdAt: true, updatedAt: true },
    });

    if (data.active === false) {
      await prisma.appSession.deleteMany({ where: { userId: params.id } });
    }

    return NextResponse.json({ ok: true, data: user });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'No se pudo actualizar el usuario.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const currentUser = await requireAdmin();
    if (currentUser.id === params.id) {
      return NextResponse.json({ ok: false, error: 'No puede eliminar su propio usuario administrador.' }, { status: 400 });
    }
    await prisma.appSession.deleteMany({ where: { userId: params.id } });
    await prisma.appUser.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'No se pudo eliminar el usuario.' }, { status: 500 });
  }
}
