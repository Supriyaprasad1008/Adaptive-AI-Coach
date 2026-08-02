'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import ReportView from '@/components/ReportView';

export const dynamic = 'force-dynamic';

function ReportContent({ id }: { id: string }) {
  const router = useRouter();

  return (
    <ReportView
      sessionId={id}
      onBack={() => router.push('/practice')}
      onViewReport={(reportId) => router.push(`/report/${reportId}`)}
    />
  );
}

export default function ReportPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '64px', color: '#64748b' }}>Loading report...</div>}>
      <ReportContent id={params?.id} />
    </Suspense>
  );
}
