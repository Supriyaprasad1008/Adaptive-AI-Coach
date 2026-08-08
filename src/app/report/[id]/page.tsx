'use client';

import { Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ReportView from '@/components/ReportView';

export const dynamic = 'force-dynamic';

function ReportContent() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  return (
    <ReportView
      sessionId={id}
      onBack={() => router.push('/practice')}
      onViewReport={(reportId) => router.push(`/report/${reportId}`)}
    />
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '64px', color: '#64748b' }}>Loading report...</div>}>
      <ReportContent />
    </Suspense>
  );
}
