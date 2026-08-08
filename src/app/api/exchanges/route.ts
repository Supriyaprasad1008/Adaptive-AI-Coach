import { NextResponse } from 'next/server';
import { createExchange, listExchanges } from '@/lib/database';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');
  const sort = searchParams.get('sort');
  const order = searchParams.get('order') === 'desc' ? 'desc' : 'asc';
  const limit = Number(searchParams.get('limit') || 0);
  const practitionerId = request.headers.get('x-practitioner-id') || searchParams.get('practitioner_id') || 'anonymous';

  const items = await listExchanges({
    practitionerId,
    filters: sessionId ? { session_id: sessionId } : {},
    orderBy: sort ? { field: sort, ascending: order === 'asc' } : undefined,
    limit: limit || undefined,
  });

  return NextResponse.json({ data: items });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const practitionerId = request.headers.get('x-practitioner-id') || payload.practitioner_id || 'anonymous';
  const exchange = await createExchange(payload, practitionerId);
  return NextResponse.json({ data: exchange });
}
