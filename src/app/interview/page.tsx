'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  supabase,
  type InterviewExchange,
  type InterviewSession,
} from '@/lib/supabase';
import { computeOverallScore } from '@/lib/scoring';
import InterviewView from '@/components/InterviewView';

function InterviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [exchanges, setExchanges] = useState<InterviewExchange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      router.push('/practice');
      return;
    }

    async function loadSession() {
      setLoading(true);
      const { data: sess } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (!sess) {
        router.push('/practice');
        return;
      }

      setSession(sess as InterviewSession);

      const { data: exch } = await supabase
        .from('interview_exchanges')
        .select('*')
        .eq('session_id', sessionId)
        .order('question_number', { ascending: true });

      setExchanges((exch as InterviewExchange[]) ?? []);
      setLoading(false);
    }

    loadSession();
  }, [sessionId, router]);

  const handleEndSession = useCallback(async () => {
    if (!sessionId) return;
    const scored = exchanges.filter((e) => e.score !== null);
    if (scored.length > 0) {
      const overall = computeOverallScore(scored);
      await supabase
        .from('interview_sessions')
        .update({
          status: 'completed',
          overall_score: overall,
          completed_at: new Date().toISOString(),
        })
        .eq('id', sessionId);
    }
    router.push(`/report/${sessionId}`);
  }, [sessionId, exchanges, router]);

  if (loading || !session) {
    return (
      <div style={{ textAlign: 'center', padding: '64px', color: '#a1a1aa' }}>
        Loading session...
      </div>
    );
  }

  return (
    <InterviewView
      session={session}
      exchanges={exchanges}
      onExchangesChange={setExchanges}
      onEndSession={handleEndSession}
    />
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '64px', color: '#a1a1aa' }}>Loading session...</div>}>
      <InterviewContent />
    </Suspense>
  );
}
