import { NextResponse } from 'next/server';
import { saveUsers } from '@/lib/store';
import { loadUsers, findUser, publicUser } from '@/lib/users';
import { hashPassword } from '@/lib/passwords';
import { getBearerUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function getActingUser(request) {
  const username = getBearerUser(request);
  if (!username) return null;
  const users = await loadUsers();
  return findUser(users, username) || null;
}

export async function GET(request) {
  const acting = await getActingUser(request);
  if (!acting) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (acting.role !== 'admin') {
    return NextResponse.json({ error: 'Solo el usuario administrador puede ver la lista de usuarios' }, { status: 403 });
  }

  const users = await loadUsers();
  return NextResponse.json({ users: users.map(publicUser) });
}

export async function POST(request) {
  const acting = await getActingUser(request);
  if (!acting) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await request.json();
  const { action } = body;
  let users = await loadUsers();

  if (action === 'add') {
    if (acting.role !== 'admin') {
      return NextResponse.json({ error: 'Solo el usuario administrador puede crear usuarios' }, { status: 403 });
    }
    const username = String(body.username || '').trim();
    const { password } = body;
    if (!username || !password || password.length < 4) {
      return NextResponse.json(
        { error: 'Usuario y contraseña (mínimo 4 caracteres) son obligatorios' },
        { status: 400 }
      );
    }
    if (findUser(users, username)) {
      return NextResponse.json({ error: 'Ese usuario ya existe' }, { status: 400 });
    }
    users.push({ id: `u-${Date.now()}`, username, role: 'editor', passwordHash: hashPassword(password) });
  } else if (action === 'change-password') {
    const targetUsername = String(body.username || acting.username).trim();
    const isSelf = targetUsername.toLowerCase() === acting.username.toLowerCase();
    if (!isSelf && acting.role !== 'admin') {
      return NextResponse.json({ error: 'Solo podés cambiar tu propia contraseña' }, { status: 403 });
    }
    const { password } = body;
    if (!password || password.length < 4) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 4 caracteres' }, { status: 400 });
    }
    const user = findUser(users, targetUsername);
    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    user.passwordHash = hashPassword(password);
  } else if (action === 'delete') {
    if (acting.role !== 'admin') {
      return NextResponse.json({ error: 'Solo el usuario administrador puede eliminar usuarios' }, { status: 403 });
    }
    const targetUsername = String(body.username || '').trim();
    const target = findUser(users, targetUsername);
    if (!target) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    if (target.role === 'admin') {
      return NextResponse.json({ error: 'El usuario administrador no se puede eliminar' }, { status: 400 });
    }
    users = users.filter((u) => u.username.toLowerCase() !== targetUsername.toLowerCase());
  } else {
    return NextResponse.json({ error: 'Acción inválida' }, { status: 400 });
  }

  const result = await saveUsers(users);
  return NextResponse.json({ ok: true, users: users.map(publicUser), ...result });
}
