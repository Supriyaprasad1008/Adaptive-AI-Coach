import { useEffect, useMemo, useState } from 'react';
import {
  supabase,
  type InterviewSession,
  type SessionWithExchanges,
  FOCUS_AREAS,
  ROLES,
  type Difficulty,
  type FocusArea,
} from '@/lib/supabase';
import { scoreTier } from '@/lib/scoring';
import { QUESTION_BANK } from '@/lib/questions';
import {
  Brain,
  TrendingUp,
  Trophy,
  Clock,
  ChevronRight,
  Target,
  Sparkles,
  BarChart3,
  Play,
  Calendar,
} from 'lucide-react';

interface DashboardProps {
  onStartSession: (config: { role: string; focusArea: FocusArea; difficulty: Difficulty }) => void;
  onViewReport: (sessionId: string) => void;
  refreshKey: number;
}

export default function Dashboard({ onStartSession, onViewReport, refreshKey }: DashboardProps) {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [role, setRole] = useState(ROLES[0]);
  const [focusArea, setFocusArea] = useState<FocusArea>('behavioral');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('interview_sessions')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(20);
      if (!cancelled) {
        setSessions((data as InterviewSession[]) ?? []);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const completedSessions = useMemo(
    () => sessions.filter((s) => s.status === 'completed'),
    [sessions],
  );

  const stats = useMemo(() => {
    if (completedSessions.length === 0) return null;
    const scores = completedSessions
      .map((s) => s.overall_score ?? 0)
      .filter((s) => s > 0);
    const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const best = scores.length > 0 ? Math.max(...scores) : 0;
    const latest = scores.length > 0 ? scores[0] : 0;
    const previous = scores.length > 1 ? scores[1] : 0;
    const trend = latest - previous;
    return { avg, best, latest, trend, total: completedSessions.length };
  }, [completedSessions]);

  const focusAreaMeta = FOCUS_AREAS.find((f) => f.value === focusArea)!;
  const questionCount = QUESTION_BANK.filter((q) => q.area === focusArea).length;

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-8 shadow-[0_30px_90px_-40px_rgba(14,165,233,0.45)] sm:p-12">
        <div className="absolute inset-0 opacity-70">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl" />
        </div>
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-sky-200 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Adaptive AI-powered coaching
          </div>
          <h1 className="mt-5 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            Master your interviews with a coach that adapts to you
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300">
            Practice realistic mock interviews where question difficulty rises and falls
            based on the quality of your answers. Track your growth across sessions with
            detailed performance reports.
          </p>
        </div>
      </section>

      {stats && (
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            icon={<BarChart3 className="h-5 w-5" />}
            label="Sessions completed"
            value={String(stats.total)}
            tone="blue"
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Average score"
            value={`${stats.avg}`}
            suffix="/100"
            tone="teal"
          />
          <StatCard
            icon={<Trophy className="h-5 w-5" />}
            label="Best score"
            value={`${stats.best}`}
            suffix="/100"
            tone="amber"
          />
          <StatCard
            icon={<Target className="h-5 w-5" />}
            label="Latest trend"
            value={stats.trend > 0 ? `+${stats.trend}` : stats.trend === 0 ? '0' : `${stats.trend}`}
            tone={stats.trend >= 0 ? 'green' : 'rose'}
          />
        </section>
      )}

      <section className="rounded-[2rem] border border-white/10 bg-slate-900/75 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.95)] backdrop-blur-sm sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/12 text-sky-200 ring-1 ring-sky-400/20">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Start a new practice session</h2>
            <p className="text-sm text-slate-400">Configure your mock interview below</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Target role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm font-medium text-slate-100 outline-none transition focus:border-sky-400/70 focus:bg-slate-900 focus:ring-2 focus:ring-sky-500/20"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Focus area</label>
            <select
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value as FocusArea)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm font-medium text-slate-100 outline-none transition focus:border-sky-400/70 focus:bg-slate-900 focus:ring-2 focus:ring-sky-500/20"
            >
              {FOCUS_AREAS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-slate-500">
              {focusAreaMeta.description} - {questionCount} questions
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Starting difficulty</label>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium capitalize transition ${
                    difficulty === d
                      ? 'border-sky-400/60 bg-sky-500/15 text-sky-100 ring-1 ring-sky-400/20'
                      : 'border-white/10 bg-slate-950/70 text-slate-300 hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => onStartSession({ role, focusArea, difficulty })}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/20 transition hover:bg-sky-400 active:scale-[0.98]"
        >
          <Play className="h-4 w-4" />
          Begin interview
        </button>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">Recent sessions</h2>
          {sessions.length > 0 && (
            <span className="text-sm text-slate-500">{sessions.length} total</span>
          )}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/75 p-12 text-center text-sm text-slate-500 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.95)]">
            Loading sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-slate-900/60 p-12 text-center backdrop-blur-sm">
            <Calendar className="mx-auto h-8 w-8 text-slate-600" />
            <p className="mt-3 text-sm font-medium text-slate-300">No sessions yet</p>
            <p className="mt-1 text-sm text-slate-500">Complete your first mock interview to see it here.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} onViewReport={onViewReport} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  suffix,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  suffix?: string;
  tone: 'blue' | 'teal' | 'amber' | 'green' | 'rose';
}) {
  const toneMap = {
    blue: 'bg-sky-500/12 text-sky-200 ring-1 ring-sky-400/20',
    teal: 'bg-teal-500/12 text-teal-200 ring-1 ring-teal-400/20',
    amber: 'bg-amber-500/12 text-amber-200 ring-1 ring-amber-400/20',
    green: 'bg-emerald-500/12 text-emerald-200 ring-1 ring-emerald-400/20',
    rose: 'bg-rose-500/12 text-rose-200 ring-1 ring-rose-400/20',
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/75 p-5 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.95)] backdrop-blur-sm">
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${toneMap[tone]}`}>
        {icon}
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-100">
        {value}
        {suffix && <span className="text-base font-medium text-slate-500">{suffix}</span>}
      </p>
      <p className="mt-0.5 text-xs font-medium text-slate-400">{label}</p>
    </div>
  );
}

function SessionCard({ session, onViewReport }: { session: InterviewSession; onViewReport: (id: string) => void }) {
  const score = session.overall_score;
  const tier = score !== null ? scoreTier(score) : null;
  const date = new Date(session.started_at);
  const isComplete = session.status === 'completed';

  return (
    <button
      onClick={() => onViewReport(session.id)}
      className="group flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/75 p-5 text-left shadow-[0_20px_60px_-35px_rgba(15,23,42,0.95)] transition hover:border-white/20 hover:bg-slate-900"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-slate-100">{session.role}</span>
          <span className="inline-flex shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-xs font-medium capitalize text-slate-300">
            {session.focus_area.replace('-', ' ')}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
          <span className="capitalize">{session.difficulty}</span>
          {isComplete ? (
            tier && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${tier.bg} ${tier.color}`}>
                {tier.label}
              </span>
            )
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 font-medium text-sky-200">
              In progress
            </span>
          )}
        </div>
      </div>
      {score !== null && (
        <div className="ml-4 flex flex-col items-end">
          <span className="text-xl font-bold text-slate-100">{score}</span>
          <span className="text-xs text-slate-500">/100</span>
        </div>
      )}
      <ChevronRight className="ml-3 h-5 w-5 shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-slate-300" />
    </button>
  );
}

export type { SessionWithExchanges };
