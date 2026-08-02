'use client';

import { useRouter } from 'next/navigation';
import ReportView from '@/components/ReportView';

export default function ReportPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  return (
    <ReportView
      sessionId={params.id}
      onBack={() => router.push('/practice')}
      onViewReport={(id) => router.push(`/report/${id}`)}
    />
  );
}
