'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, type Difficulty, type FocusArea } from '@/lib/supabase';
import Dashboard from '@/components/Dashboard';

export default function PracticePage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStartSession = useCallback(
    async (config: { role: string; focusArea: FocusArea; difficulty: Difficulty }) => {
      setErrorMessage(null);
      try {
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
          setErrorMessage('Unable to start practice session. Please check your connection and try again.');
          return;
        }

        router.push(`/interview?sessionId=${data.id}`);
      } catch (err) {
        setErrorMessage('An unexpected error occurred while launching the session.');
      }
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
    <>
      {errorMessage && (
        <div
          style={{
            maxWidth: '80rem',
            margin: '0 auto 1.5rem',
            padding: '12px 20px',
            borderRadius: '12px',
            background: 'rgba(225, 29, 72, 0.15)',
            border: '1px solid rgba(225, 29, 72, 0.3)',
            color: '#fecdd3',
            fontSize: '0.9rem',
          }}
        >
          {errorMessage}
        </div>
      )}
      <Dashboard
        onStartSession={handleStartSession}
        onViewReport={handleViewReport}
        refreshKey={refreshKey}
      />
    </>
  );
}
