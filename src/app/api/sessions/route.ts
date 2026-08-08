import { NextResponse } from 'next/server';
import { createSession, getSession, listSessions, updateSession } from '@/lib/database';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const sort = searchParams.get('sort');
  const order = searchParams.get('order') === 'desc' ? 'desc' : 'asc';
  const limit = Number(searchParams.get('limit') || 0);
  const practitionerId = request.headers.get('x-practitioner-id') || searchParams.get('practitioner_id') || 'anonymous';

  if (id) {
    const session = await getSession(id, practitionerId);
    return NextResponse.json({ data: session });
  }

  const items = await listSessions({
    practitionerId,
    orderBy: sort ? { field: sort, ascending: order === 'asc' } : undefined,
    limit: limit || undefined,
  });

  return NextResponse.json({ data: items });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const practitionerId = request.headers.get('x-practitioner-id') || payload.practitioner_id || 'anonymous';
  const session = await createSession(payload, practitionerId);
  return NextResponse.json({ data: session });
}

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing session id' }, { status: 400 });
  }

  const payload = await request.json();
  const practitionerId = request.headers.get('x-practitioner-id') || payload.practitioner_id || 'anonymous';
  const session = await updateSession(id, payload, practitionerId);
  return NextResponse.json({ data: session });
}
