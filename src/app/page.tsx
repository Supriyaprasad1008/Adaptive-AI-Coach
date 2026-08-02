'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  supabase,
  type Difficulty,
  type FocusArea,
  type InterviewExchange,
  type InterviewSession,
} from '@/lib/supabase';
import { computeOverallScore } from '@/lib/scoring';
import Dashboard from '@/components/Dashboard';
import InterviewView from '@/components/InterviewView';
import ReportView from '@/components/ReportView';
import { Brain } from 'lucide-react';
import styles from '@/styles/AppLayout.module.scss';

type View =
  | { name: 'dashboard' }
  | { name: 'interview'; session: InterviewSession; exchanges: InterviewExchange[] }
  | { name: 'report'; sessionId: string };

export default function Home() {
  const [view, setView] = useState<View>({ name: 'dashboard' });
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
      setView({
        name: 'interview',
        session: data as InterviewSession,
        exchanges: [],
      });
    },
    [],
  );

  const handleExchangesChange = useCallback(
    (exchanges: InterviewExchange[]) => {
      setView((prev) =>
        prev.name === 'interview' ? { ...prev, exchanges } : prev,
      );
    },
    [],
  );

  const endSession = useCallback(
    async (sessionId: string, exchanges: InterviewExchange[]) => {
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
      setRefreshKey((k) => k + 1);
    },
    [],
  );

  const handleEndSession = useCallback(() => {
    if (view.name === 'interview') {
      endSession(view.session.id, view.exchanges).then(() => {
        setView({ name: 'report', sessionId: view.session.id });
      });
    }
  }, [view, endSession]);

  const handleViewReport = useCallback((sessionId: string) => {
    setView({ name: 'report', sessionId });
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setView({ name: 'dashboard' });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  return (
    <div className={styles.layoutContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <button onClick={handleBackToDashboard} className={styles.logoBtn}>
            <div className={styles.logoIcon}>
              <Brain size={20} />
            </div>
            <div>
              <p className={styles.logoTitle}>Interview Coach</p>
              <p className={styles.logoSubtitle}>Adaptive AI Prep</p>
            </div>
          </button>
          {view.name !== 'dashboard' && (
            <button onClick={handleBackToDashboard} className={styles.dashboardNavBtn}>
              Dashboard
            </button>
          )}
        </div>
      </header>

      <main className={styles.mainContent}>
        {view.name === 'dashboard' && (
          <Dashboard
            onStartSession={handleStartSession}
            onViewReport={handleViewReport}
            refreshKey={refreshKey}
          />
        )}
        {view.name === 'interview' && (
          <InterviewView
            session={view.session}
            exchanges={view.exchanges}
            onExchangesChange={handleExchangesChange}
            onEndSession={handleEndSession}
          />
        )}
        {view.name === 'report' && (
          <ReportView
            sessionId={view.sessionId}
            onBack={handleBackToDashboard}
            onViewReport={handleViewReport}
          />
        )}
      </main>

      <footer className={styles.footer}>
        <p>Adaptive AI Interview Prep Coach — Practice makes prepared</p>
      </footer>
    </div>
  );
}
