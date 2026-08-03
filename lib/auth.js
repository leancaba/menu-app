import crypto from 'crypto';

const SESSION_HOURS = 12;

function getSecret() {
  // Se puede fijar ADMIN_SESSION_SECRET aparte; si no, se deriva de ADMIN_PASSWORD.
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || 'menu-digital-secret';
}

export function signToken(username) {
  const payload = Buffer.from(
    JSON.stringify({ u: username, exp: Date.now() + SESSION_HOURS * 60 * 60 * 1000 })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');
  if (sig !== expected) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (!data.exp || Date.now() > data.exp) return null;
    return data.u;
  } catch (e) {
    return null;
  }
}

export function getBearerUser(request) {
  const header = request.headers.get('authorization') || '';
  const match = header.match(/^Bearer (.+)$/);
  if (!match) return null;
  return verifyToken(match[1]);
}
