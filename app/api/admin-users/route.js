import { NextResponse } from 'next/server';
import { getUsers, saveUsers } from '@/lib/store';
import { hashPassword } from '@/lib/passwords';
import { getBearerUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function bootstrapUsers(existing) {
  if (existing && existing.length > 0) return existing;
  return [
    {
      id: 'admin',
      username: 'admin',
      passwordHash: hashPassword(process.env.ADMIN_PASSWORD || 'admin123'),
    },
  ];
}

export async function GET(request) {
  const actingUser = getBearerUser(request);
  if (!actingUser) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const users = bootstrapUsers(await getUsers());
  return NextResponse.json({ users: users.map((u) => ({ id: u.id, username: u.username })) });
}

export async function POST(request) {
  const actingUser = getBearerUser(request);
  if (!actingUser) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await request.json();
  const { action } = body;
  let users = bootstrapUsers(await getUsers());

  if (action === 'add') {
    const username = String(body.username || '').trim();
    const { password } = body;
    if (!username || !password || password.length < 4) {
      return NextResponse.json(
        { error: 'Usuario y contraseña (mínimo 4 caracteres) son obligatorios' },
        { status: 400 }
      );
    }
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      return NextResponse.json({ error: 'Ese usuario ya existe' }, { status: 400 });
    }
    users.push({ id: `u-${Date.now()}`, username, passwordHash: hashPassword(password) });
  } else if (action === 'change-password') {
    const targetUsername = String(body.username || actingUser).trim();
    const { password } = body;
    if (!password || password.length < 4) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 4 caracteres' }, { status: 400 });
    }
    const user = users.find((u) => u.username.toLowerCase() === targetUsername.toLowerCase());
    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    user.passwordHash = hashPassword(password);
  } else if (action === 'delete') {
    const targetUsername = String(body.username || '').trim();
    if (users.length <= 1) {
      return NextResponse.json({ error: 'Tiene que quedar al menos un usuario' }, { status: 400 });
    }
    if (targetUsername.toLowerCase() === actingUser.toLowerCase()) {
      return NextResponse.json({ error: 'No podés eliminar el usuario con el que estás conectado' }, { status: 400 });
    }
    users = users.filter((u) => u.username.toLowerCase() !== targetUsername.toLowerCase());
  } else {
    return NextResponse.json({ error: 'Acción inválida' }, { status: 400 });
  }

  const result = await saveUsers(users);
  return NextResponse.json({
    ok: true,
    users: users.map((u) => ({ id: u.id, username: u.username })),
    ...result,
  });
}
