import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { AUTH_COOKIE_NAME, createSession, sanitizeUsername, verifyPassword, SESSION_TTL_DAYS } from '../../../../lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = sanitizeUsername(String(body.username ?? ''));
    const password = String(body.password ?? '');

    if (!username || !password) {
      return NextResponse.json({ ok: false, error: 'Usuario y contraseña son obligatorios.' }, { status: 400 });
    }

    const user = await prisma.appUser.findUnique({ where: { username } });
    if (!user || !user.active || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ ok: false, error: 'Usuario, contraseña o acceso no válido.' }, { status: 401 });
    }

    const token = await createSession(user.id);
    const response = NextResponse.json({ ok: true, data: { username: user.username, displayName: user.displayName, role: user.role } });
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
    });
    return response;
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'No se pudo iniciar sesión.' }, { status: 500 });
  }
}
