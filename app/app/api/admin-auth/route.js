import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const { password } = await request.json();
  const expected = process.env.ADMIN_PASSWORD || 'admin123';

  if (password === expected) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false, error: 'Contraseña incorrecta' }, { status: 401 });
}
