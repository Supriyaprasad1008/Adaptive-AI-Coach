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

type View =
  | { name: 'dashboard' }
  | { name: 'interview'; session: InterviewSession; exchanges: InterviewExchange[] }
  | { name: 'report'; sessionId: string };

export default function App() {
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
    <div className="min-h-screen bg-transparent text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
          <button
            onClick={handleBackToDashboard}
            className="group flex items-center gap-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-200 ring-1 ring-sky-400/20 transition group-hover:bg-sky-500/20">
              <Brain className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold leading-tight text-slate-100">Interview Coach</p>
              <p className="text-xs leading-tight text-slate-400">Adaptive prep</p>
            </div>
          </button>
          {view.name !== 'dashboard' && (
            <button
              onClick={handleBackToDashboard}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              Dashboard
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
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

      <footer className="border-t border-white/10 py-6">
        <p className="text-center text-xs text-slate-500">
          Adaptive Interview Prep Coach - Practice makes prepared
        </p>
      </footer>
    </div>
  );
}
