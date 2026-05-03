import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '../../../../lib/prisma';
import { AUTH_COOKIE_NAME, hashToken } from '../../../../lib/auth';

export async function POST() {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;
  if (token) {
    await prisma.appSession.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, '', { path: '/', maxAge: 0 });
  return response;
}
