import { NextResponse } from 'next/server';
import { loadUsers, findUser } from '@/lib/users';
import { verifyPassword } from '@/lib/passwords';
import { signToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const { username, password } = await request.json();
  const users = await loadUsers();
  const user = findUser(users, username || 'admin');

  if (user && verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({
      ok: true,
      username: user.username,
      role: user.role || 'editor',
      token: signToken(user.username),
    });
  }
  return NextResponse.json({ ok: false, error: 'Usuario o contraseña incorrectos' }, { status: 401 });
}
