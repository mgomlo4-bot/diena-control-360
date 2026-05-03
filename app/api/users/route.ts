import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { hashPassword, requireAdmin, sanitizeUsername } from '../../../lib/auth';

export async function GET() {
  try {
    await requireAdmin();
    const users = await prisma.appUser.findMany({
      select: { id: true, username: true, displayName: true, role: true, active: true, createdAt: true, updatedAt: true },
      orderBy: [{ role: 'asc' }, { username: 'asc' }],
    });
    return NextResponse.json({ ok: true, data: users });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'No autorizado.' }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const username = sanitizeUsername(String(body.username ?? ''));
    const displayName = String(body.displayName ?? '').trim();
    const password = String(body.password ?? '');
    const role = body.role === 'ADMIN' ? 'ADMIN' : 'USER';

    if (!username || !displayName || password.length < 8) {
      return NextResponse.json({ ok: false, error: 'Usuario, nombre visible y contraseña de al menos 8 caracteres son obligatorios.' }, { status: 400 });
    }

    const user = await prisma.appUser.create({
      data: {
        username,
        displayName,
        passwordHash: hashPassword(password),
        role,
        active: body.active ?? true,
      },
      select: { id: true, username: true, displayName: true, role: true, active: true, createdAt: true, updatedAt: true },
    });

    return NextResponse.json({ ok: true, data: user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'No se pudo crear el usuario.' }, { status: 500 });
  }
}
