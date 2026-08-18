import fs from 'fs';
import path from 'path';
import { defaultMenu } from './defaultData';

const DATA_DIR = path.join(process.cwd(), 'data');
const MENU_FILE = path.join(DATA_DIR, 'menu.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function getUpstash() {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      // eslint-disable-next-line global-require
      const { Redis } = require('@upstash/redis');
      return Redis.fromEnv();
    } catch (e) {
      return null;
    }
  }
  return null;
}

// Conexión estándar (redis:// o rediss://), como la que agrega la opción
// genérica "Redis" del Marketplace de Vercel (variable REDIS_URL).
async function withRedisUrl(fn) {
  if (!process.env.REDIS_URL) return null;
  let client;
  try {
    // eslint-disable-next-line global-require
    const Redis = require('ioredis');
    client = new Redis(process.env.REDIS_URL);
    return await fn(client);
  } catch (e) {
    console.warn('No se pudo usar REDIS_URL:', e.message);
    return null;
  } finally {
    if (client) {
      try {
        client.disconnect();
      } catch (e) {
        // ignora
      }
    }
  }
}

async function getValue(key, file) {
  const upstash = getUpstash();
  if (upstash) {
    const data = await upstash.get(key);
    if (data) return data;
  }

  const viaRedisUrl = await withRedisUrl(async (client) => {
    const raw = await client.get(key);
    return raw ? JSON.parse(raw) : null;
  });
  if (viaRedisUrl) return viaRedisUrl;

  try {
    const raw = fs.readFileSync(file, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

async function setValue(key, file, value) {
  const upstash = getUpstash();
  if (upstash) {
    await upstash.set(key, value);
    return { persisted: true, mode: 'kv' };
  }

  const savedViaRedisUrl = await withRedisUrl(async (client) => {
    await client.set(key, JSON.stringify(value));
    return true;
  });
  if (savedViaRedisUrl) return { persisted: true, mode: 'redis' };

  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(value, null, 2));
    return { persisted: true, mode: 'file' };
  } catch (e) {
    return { persisted: false, mode: 'readonly' };
  }
}

export async function getMenu() {
  const data = await getValue('menu', MENU_FILE);
  return data || defaultMenu;
}

export async function saveMenu(menu) {
  return setValue('menu', MENU_FILE, menu);
}

// Devuelve null si todavía no se configuró ningún usuario (bootstrap con
// ADMIN_PASSWORD), o el array de usuarios guardados.
export async function getUsers() {
  const data = await getValue('admin-users', USERS_FILE);
  return data && Array.isArray(data) && data.length > 0 ? data : null;
}

export async function saveUsers(users) {
  return setValue('admin-users', USERS_FILE, users);
}
