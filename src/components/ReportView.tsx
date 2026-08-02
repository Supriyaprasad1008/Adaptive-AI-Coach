import { useEffect, useMemo, useState } from 'react';
import {
  supabase,
  type InterviewExchange,
  type InterviewSession,
  DIFFICULTY_META,
  type Difficulty,
} from '@/lib/supabase';
import { computeOverallScore, scoreTier } from '@/lib/scoring';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Target,
  Clock,
  CheckCircle2,
  Lightbulb,
  BarChart3,
} from 'lucide-react';

interface ReportViewProps {
  sessionId: string;
  onBack: () => void;
  onViewReport: (id: string) => void;
}

export default function ReportView({ sessionId, onBack, onViewReport }: ReportViewProps) {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [exchanges, setExchanges] = useState<InterviewExchange[]>([]);
  const [allSessions, setAllSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [{ data: sess }, { data: exch }, { data: all }] = await Promise.all([
        supabase.from('interview_sessions').select('*').eq('id', sessionId).maybeSingle(),
        supabase.from('interview_exchanges').select('*').eq('session_id', sessionId).order('created_at', { ascending: true }),
        supabase.from('interview_sessions').select('*').order('started_at', { ascending: false }).limit(20),
      ]);
      if (cancelled) return;
      setSession(sess as InterviewSession | null);
      setExchanges((exch as InterviewExchange[]) ?? []);
      setAllSessions((all as InterviewSession[]) ?? []);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const overallScore = useMemo(() => computeOverallScore(exchanges), [exchanges]);
  const tier = scoreTier(overallScore);

  const comparisonData = useMemo(() => {
    const completed = allSessions.filter((s) => s.status === 'completed' && s.overall_score !== null);
    const currentIdx = completed.findIndex((s) => s.id === sessionId);
    const previous = currentIdx >= 0 && currentIdx < completed.length - 1 ? completed[currentIdx + 1] : null;
    const previousScore = previous?.overall_score ?? null;
    const delta = previousScore !== null ? overallScore - previousScore : null;

    const scoreHistory = [...completed].reverse().map((s) => ({
      id: s.id,
      score: s.overall_score ?? 0,
      date: new Date(s.started_at),
      role: s.role,
      area: s.focus_area,
      isCurrent: s.id === sessionId,
    }));

    return { previous, previousScore, delta, scoreHistory, completedCount: completed.length };
  }, [allSessions, sessionId, overallScore]);

  const tagBreakdown = useMemo(() => {
    const map = new Map<string, { scores: number[]; count: number }>();
    exchanges.filter((e) => e.score !== null).forEach((e) => {
      const tag = e.question_tag;
      if (!map.has(tag)) map.set(tag, { scores: [], count: 0 });
      const entry = map.get(tag)!;
      entry.scores.push(e.score!);
      entry.count++;
    });
    return Array.from(map.entries())
      .map(([tag, { scores, count }]) => ({
        tag,
        avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        count,
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [exchanges]);

  const difficultyBreakdown = useMemo(() => {
    const map: Record<Difficulty, { scores: number[]; count: number }> = {
      easy: { scores: [], count: 0 },
      medium: { scores: [], count: 0 },
      hard: { scores: [], count: 0 },
    };
    exchanges.filter((e) => e.score !== null).forEach((e) => {
      map[e.difficulty].scores.push(e.score!);
      map[e.difficulty].count++;
    });
    return (['easy', 'medium', 'hard'] as Difficulty[]).map((d) => ({
      difficulty: d,
      avg: map[d].scores.length > 0 ? Math.round(map[d].scores.reduce((a, b) => a + b, 0) / map[d].scores.length) : 0,
      count: map[d].count,
    }));
  }, [exchanges]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-sm text-slate-500">Loading report...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm text-slate-400">Session not found.</p>
        <button onClick={onBack} className="mt-4 text-sm font-medium text-sky-300 hover:text-sky-200">
          Back to dashboard
        </button>
      </div>
    );
  }

  const isComplete = session.status === 'completed';
  const date = new Date(session.started_at);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-slate-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </button>

      <div className="rounded-[2rem] border border-white/10 bg-slate-900/75 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.95)] backdrop-blur-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-100">{session.role}</h1>
              {!isComplete && (
                <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold text-sky-200">
                  In progress
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-xs font-medium capitalize text-slate-300">
                {session.focus_area.replace('-', ' ')}
              </span>
              <span className="capitalize">{session.difficulty} start</span>
            </div>
          </div>
          {isComplete && (
            <div className={`rounded-2xl px-5 py-3 ${tier.bg}`}>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">Overall score</p>
              <p className="mt-0.5 text-3xl font-bold text-slate-100">
                {overallScore}<span className="text-base font-medium text-slate-500">/100</span>
              </p>
              <p className={`text-xs font-semibold ${tier.color}`}>{tier.label}</p>
            </div>
          )}
        </div>

        {isComplete && comparisonData.delta !== null && (
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            {comparisonData.delta > 0 ? (
              <TrendingUp className="h-5 w-5 text-emerald-300" />
            ) : comparisonData.delta < 0 ? (
              <TrendingDown className="h-5 w-5 text-rose-300" />
            ) : (
              <Minus className="h-5 w-5 text-slate-400" />
            )}
            <p className="text-sm text-slate-300">
              {comparisonData.delta > 0
                ? `Up ${comparisonData.delta} points from your previous session (${comparisonData.previousScore}).`
                : comparisonData.delta < 0
                  ? `Down ${Math.abs(comparisonData.delta)} points from your previous session (${comparisonData.previousScore}).`
                  : `Same as your previous session (${comparisonData.previousScore}).`}
            </p>
          </div>
        )}
      </div>

      {comparisonData.scoreHistory.length > 1 && (
        <div className="rounded-2xl border border-white/10 bg-slate-900/75 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.95)] backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-100">Score history across sessions</h2>
          </div>
          <ScoreChart data={comparisonData.scoreHistory} onViewReport={onViewReport} />
        </div>
      )}

      {exchanges.filter((e) => e.score !== null).length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-900/75 p-5 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.95)] backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-100">By topic</h2>
            </div>
            <div className="mt-4 space-y-3">
              {tagBreakdown.map((t) => (
                <div key={t.tag}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium capitalize text-slate-300">{t.tag.replace('-', ' ')}</span>
                    <span className="text-slate-500">{t.avg} avg / {t.count}Q</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                    <div
                      className={`h-full rounded-full ${t.avg >= 70 ? 'bg-emerald-400' : t.avg >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`}
                      style={{ width: `${t.avg}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/75 p-5 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.95)] backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-100">By difficulty</h2>
            </div>
            <div className="mt-4 space-y-3">
              {difficultyBreakdown.filter((d) => d.count > 0).map((d) => {
                const meta = DIFFICULTY_META[d.difficulty];
                return (
                  <div key={d.difficulty}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className={`font-medium ${meta.color}`}>{meta.label}</span>
                      <span className="text-slate-500">{d.avg} avg / {d.count}Q</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-slate-200"
                        style={{ width: `${d.avg}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {difficultyBreakdown.every((d) => d.count === 0) && (
                <p className="text-xs text-slate-500">No scored answers yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-slate-900/75 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.95)] backdrop-blur-sm">
        <h2 className="text-sm font-semibold text-slate-100">Question by question breakdown</h2>
        <div className="mt-4 space-y-4">
          {exchanges.map((ex, i) => (
            <ExchangeDetail key={ex.id} exchange={ex} index={i} />
          ))}
          {exchanges.length === 0 && (
            <p className="text-sm text-slate-500">No questions in this session.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreChart({
  data,
  onViewReport,
}: {
  data: { id: string; score: number; date: Date; role: string; area: string; isCurrent: boolean }[];
  onViewReport: (id: string) => void;
}) {
  const width = 600;
  const height = 160;
  const padding = { top: 20, right: 20, bottom: 30, left: 36 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  if (data.length < 2) return null;

  const xStep = data.length > 1 ? chartW / (data.length - 1) : 0;
  const hitWidth = Math.max(xStep, 24);
  const points = data.map((d, i) => ({
    x: padding.left + i * xStep,
    y: padding.top + chartH - (d.score / 100) * chartH,
    ...d,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  return (
    <div className="mt-4 overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[400px]" style={{ height }}>
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 25, 50, 75, 100].map((v) => {
          const y = padding.top + chartH - (v / 100) * chartH;
          return (
            <g key={v}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#1e293b" strokeWidth="1" />
              <text x={padding.left - 8} y={y + 3} textAnchor="end" className="fill-slate-500" style={{ fontSize: 10 }}>
                {v}
              </text>
            </g>
          );
        })}
        <path d={areaD} fill="url(#scoreGrad)" />
        <path d={pathD} fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p) => (
          <g key={p.id}>
            <circle
              cx={p.x}
              cy={p.y}
              r={p.isCurrent ? 5 : 3.5}
              fill={p.isCurrent ? '#e2e8f0' : '#38bdf8'}
              stroke="#020617"
              strokeWidth="2"
              className="cursor-pointer transition hover:r-6"
            />
            <text x={p.x} y={padding.top + chartH + 18} textAnchor="middle" className="fill-slate-500" style={{ fontSize: 9 }}>
              {p.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </text>
            {p.isCurrent && (
              <text x={p.x} y={p.y - 10} textAnchor="middle" className="fill-slate-100 font-semibold" style={{ fontSize: 11 }}>
                {p.score}
              </text>
            )}
            <title>{`${p.role} - ${p.score}/100`}</title>
            <rect
              x={p.x - hitWidth / 2}
              y={padding.top}
              width={hitWidth}
              height={chartH}
              fill="transparent"
              className="cursor-pointer"
              onClick={() => onViewReport(p.id)}
            />
          </g>
        ))}
      </svg>
      <p className="mt-2 text-center text-xs text-slate-500">Click a point to view that session report</p>
    </div>
  );
}

function ExchangeDetail({ exchange, index }: { exchange: InterviewExchange; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const score = exchange.score;
  const tier = score !== null ? scoreTier(score) : null;
  const diffMeta = DIFFICULTY_META[exchange.difficulty];

  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/40">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-xs font-bold text-slate-200">
          {index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-200">{exchange.question}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-xs capitalize text-slate-400">
              {exchange.question_tag.replace('-', ' ')}
            </span>
            <span className={`inline-flex items-center gap-1 text-xs ${diffMeta.color}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${diffMeta.dot}`} />
              {diffMeta.label}
            </span>
          </div>
        </div>
        {score !== null && tier && (
          <div className="flex shrink-0 flex-col items-end">
            <span className="text-lg font-bold text-slate-100">{score}</span>
            <span className={`text-xs ${tier.color}`}>{tier.label}</span>
          </div>
        )}
      </button>

      {expanded && (
        <div className="border-t border-white/10 px-4 pb-4 pt-3">
          {exchange.answer ? (
            <>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">Your answer</p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{exchange.answer}</p>

              {exchange.feedback && (
                <>
                  <p className="mt-4 text-xs font-medium uppercase tracking-[0.24em] text-slate-500">Feedback</p>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-400">{exchange.feedback}</p>
                </>
              )}

              {exchange.strengths && (
                <div className="mt-3">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                    <p className="text-xs font-semibold text-emerald-200">Strengths</p>
                  </div>
                  <ul className="mt-1 space-y-1">
                    {exchange.strengths.split('\n').filter(Boolean).map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-emerald-100">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {exchange.improvements && (
                <div className="mt-3">
                  <div className="flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-300" />
                    <p className="text-xs font-semibold text-amber-200">Areas to improve</p>
                  </div>
                  <ul className="mt-1 space-y-1">
                    {exchange.improvements.split('\n').filter(Boolean).map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-amber-100">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500">Not yet answered.</p>
          )}
        </div>
      )}
    </div>
  );
}
