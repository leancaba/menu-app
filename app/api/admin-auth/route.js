import { NextResponse } from 'next/server';
import { getUsers } from '@/lib/store';
import { verifyPassword } from '@/lib/passwords';
import { signToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const { username, password } = await request.json();
  const users = await getUsers();

  if (users) {
    const user = users.find(
      (u) => u.username.toLowerCase() === String(username || '').trim().toLowerCase()
    );
    if (user && verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ ok: true, username: user.username, token: signToken(user.username) });
    }
    return NextResponse.json({ ok: false, error: 'Usuario o contraseña incorrectos' }, { status: 401 });
  }

  // Todavía no se configuró ningún usuario: se acepta la contraseña única
  // definida en ADMIN_PASSWORD (compatibilidad con la versión anterior).
  const expected = process.env.ADMIN_PASSWORD || 'admin123';
  if (password === expected) {
    return NextResponse.json({ ok: true, username: 'admin', token: signToken('admin') });
  }
  return NextResponse.json({ ok: false, error: 'Contraseña incorrecta' }, { status: 401 });
}
