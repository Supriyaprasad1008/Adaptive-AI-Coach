import { NextResponse } from 'next/server';
import { updateExchange } from '@/lib/database';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const payload = await request.json();
  const practitionerId = request.headers.get('x-practitioner-id') || payload.practitioner_id || 'anonymous';
  const exchange = await updateExchange(params.id, payload, practitionerId);
  return NextResponse.json({ data: exchange });
}
