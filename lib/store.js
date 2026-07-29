import fs from 'fs';
import path from 'path';
import { defaultMenu } from './defaultData';

const DATA_FILE = path.join(process.cwd(), 'data', 'menu.json');

function getKv() {
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

export async function getMenu() {
  const kv = getKv();
  if (kv) {
    const data = await kv.get('menu');
    return data || defaultMenu;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return defaultMenu;
  }
}

export async function saveMenu(menu) {
  const kv = getKv();
  if (kv) {
    await kv.set('menu', menu);
    return { persisted: true, mode: 'kv' };
  }
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(menu, null, 2));
    return { persisted: true, mode: 'file' };
  } catch (e) {
    return { persisted: false, mode: 'readonly' };
  }
}
