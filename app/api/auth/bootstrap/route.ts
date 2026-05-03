import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { hashPassword, sanitizeUsername } from '../../../../lib/auth';

export async function POST(request: Request) {
  try {
    const existingAdmin = await prisma.appUser.findFirst({ where: { role: 'ADMIN' } });
    if (existingAdmin) {
      return NextResponse.json({ ok: false, error: 'Ya existe un administrador. El alta de usuarios debe hacerse desde /usuarios.' }, { status: 403 });
    }

    const setupToken = process.env.INITIAL_ADMIN_TOKEN;
    const body = await request.json();
    if (!setupToken || body.setupToken !== setupToken) {
      return NextResponse.json({ ok: false, error: 'Token inicial no válido.' }, { status: 401 });
    }

    const username = sanitizeUsername(String(body.username ?? ''));
    const displayName = String(body.displayName ?? '').trim();
    const password = String(body.password ?? '');

    if (!username || !displayName || password.length < 10) {
      return NextResponse.json({ ok: false, error: 'Usuario, nombre visible y contraseña de al menos 10 caracteres son obligatorios.' }, { status: 400 });
    }

    const user = await prisma.appUser.create({
      data: {
        username,
        displayName,
        passwordHash: hashPassword(password),
        role: 'ADMIN',
        active: true,
      },
      select: { id: true, username: true, displayName: true, role: true, active: true },
    });

    return NextResponse.json({ ok: true, data: user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'No se pudo crear el administrador inicial.' }, { status: 500 });
  }
}
