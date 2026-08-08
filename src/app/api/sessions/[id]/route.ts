import { NextResponse } from 'next/server';
import { getSession, updateSession } from '@/lib/database';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const practitionerId = request.headers.get('x-practitioner-id') || 'anonymous';
  const session = await getSession(params.id, practitionerId);
  return NextResponse.json({ data: session });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const payload = await request.json();
  const practitionerId = request.headers.get('x-practitioner-id') || payload.practitioner_id || 'anonymous';
  const session = await updateSession(params.id, payload, practitionerId);
  return NextResponse.json({ data: session });
}
