import { NextResponse } from 'next/server';
import { getMenu, saveMenu } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const menu = await getMenu();
  return NextResponse.json(menu);
}

const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;

function dataUrlSize(dataUrl) {
  // aproxima el tamaño real en bytes de un dataURL base64
  const base64 = dataUrl.split(',')[1] || '';
  return Math.ceil((base64.length * 3) / 4);
}

function validateImages(menu) {
  const images = [menu?.settings?.logoImage, ...(menu?.products || []).map((p) => p.image)];
  for (const img of images) {
    if (img && typeof img === 'string' && img.startsWith('data:') && dataUrlSize(img) > MAX_IMAGE_BYTES) {
      return false;
    }
  }
  return true;
}

export async function PUT(request) {
  const body = await request.json();

  if (!body || !Array.isArray(body.categories) || !Array.isArray(body.products)) {
    return NextResponse.json({ error: 'Formato de menú inválido' }, { status: 400 });
  }

  if (!validateImages(body)) {
    return NextResponse.json(
      { error: 'Alguna imagen supera el máximo permitido de 1.5 MB' },
      { status: 413 }
    );
  }

  const result = await saveMenu(body);
  return NextResponse.json({ ok: true, ...result });
}
