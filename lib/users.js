import { getUsers } from './store';
import { hashPassword } from './passwords';

// Devuelve la lista de usuarios guardada, o el usuario "admin" inicial
// (superusuario) si todavía no se creó ninguno.
export async function loadUsers() {
  const existing = await getUsers();
  if (existing && existing.length > 0) {
    // por compatibilidad con usuarios guardados antes de que existieran roles
    return existing.map((u) => ({ ...u, role: u.role || (u.id === 'admin' ? 'admin' : 'editor') }));
  }
  return [
    {
      id: 'admin',
      username: 'admin',
      role: 'admin',
      passwordHash: hashPassword(process.env.ADMIN_PASSWORD || 'admin123'),
    },
  ];
}

export function findUser(users, username) {
  const needle = String(username || '').trim().toLowerCase();
  return users.find((u) => u.username.toLowerCase() === needle);
}

export function publicUser(u) {
  return { id: u.id, username: u.username, role: u.role || 'editor' };
}
