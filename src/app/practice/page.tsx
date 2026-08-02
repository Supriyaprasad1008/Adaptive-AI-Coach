'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, type Difficulty, type FocusArea } from '@/lib/supabase';
import Dashboard from '@/components/Dashboard';

export default function PracticePage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleStartSession = useCallback(
    async (config: { role: string; focusArea: FocusArea; difficulty: Difficulty }) => {
      const { data, error } = await supabase
        .from('interview_sessions')
        .insert({
          role: config.role,
          focus_area: config.focusArea,
          difficulty: config.difficulty,
          status: 'in_progress',
        })
        .select()
        .single();

      if (error || !data) {
        return;
      }

      router.push(`/interview?sessionId=${data.id}`);
    },
    [router],
  );

  const handleViewReport = useCallback(
    (sessionId: string) => {
      router.push(`/report/${sessionId}`);
    },
    [router],
  );

  return (
    <Dashboard
      onStartSession={handleStartSession}
      onViewReport={handleViewReport}
      refreshKey={refreshKey}
    />
  );
}
