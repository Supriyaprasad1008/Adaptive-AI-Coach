import { NextResponse } from 'next/server';
import { getSession, updateSession } from '@/lib/database';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  const params = await Promise.resolve(context.params);
  const practitionerId = request.headers.get('x-practitioner-id') || 'anonymous';
  const session = await getSession(params.id, practitionerId);
  return NextResponse.json({ data: session });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  const params = await Promise.resolve(context.params);
  const payload = await request.json();
  const practitionerId = request.headers.get('x-practitioner-id') || payload.practitioner_id || 'anonymous';
  const session = await updateSession(params.id, payload, practitionerId);
  return NextResponse.json({ data: session });
}
