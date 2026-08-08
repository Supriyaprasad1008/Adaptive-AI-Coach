import { NextResponse } from 'next/server';
import { updateExchange } from '@/lib/database';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  const params = await Promise.resolve(context.params);
  const payload = await request.json();
  const practitionerId = request.headers.get('x-practitioner-id') || payload.practitioner_id || 'anonymous';
  const exchange = await updateExchange(params.id, payload, practitionerId);
  if (!exchange) {
    return NextResponse.json({ error: 'Exchange not found or could not be updated' }, { status: 404 });
  }
  return NextResponse.json({ data: exchange });
}
