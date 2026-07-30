import fs from 'fs';
import path from 'path';
import { defaultMenu } from './defaultData';

const DATA_FILE = path.join(process.cwd(), 'data', 'menu.json');
const KEY = 'menu';

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
    const result = await fn(client);
    return result;
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

export async function getMenu() {
  const upstash = getUpstash();
  if (upstash) {
    const data = await upstash.get(KEY);
    if (data) return data;
  }

  const viaRedisUrl = await withRedisUrl(async (client) => {
    const raw = await client.get(KEY);
    return raw ? JSON.parse(raw) : null;
  });
  if (viaRedisUrl) return viaRedisUrl;

  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return defaultMenu;
  }
}

export async function saveMenu(menu) {
  const upstash = getUpstash();
  if (upstash) {
    await upstash.set(KEY, menu);
    return { persisted: true, mode: 'kv' };
  }

  const savedViaRedisUrl = await withRedisUrl(async (client) => {
    await client.set(KEY, JSON.stringify(menu));
    return true;
  });
  if (savedViaRedisUrl) return { persisted: true, mode: 'redis' };

  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(menu, null, 2));
    return { persisted: true, mode: 'file' };
  } catch (e) {
    return { persisted: false, mode: 'readonly' };
  }
}
