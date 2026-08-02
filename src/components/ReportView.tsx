'use client';

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
import styles from '@/styles/ReportView.module.scss';

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
      <div style={{ textAlign: 'center', padding: '96px 0', color: '#94a3b8' }}>
        Loading report...
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ textAlign: 'center', padding: '96px 0' }}>
        <p style={{ color: '#cbd5e1' }}>Session not found.</p>
        <button onClick={onBack} className={styles.backBtn} style={{ marginTop: '16px' }}>
          Back to dashboard
        </button>
      </div>
    );
  }

  const isComplete = session.status === 'completed';
  const date = new Date(session.started_at);

  return (
    <div className={styles.container}>
      <button onClick={onBack} className={styles.backBtn}>
        <ArrowLeft size={16} /> Back to dashboard
      </button>

      <div className={styles.reportHeader}>
        <div className={styles.headerInfo}>
          <h1>{session.role}</h1>
          <p>
            {date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })} • {session.focus_area.replace('-', ' ')}
          </p>
        </div>

        {isComplete && (
          <div className={styles.scoreBanner}>
            <div className={styles.scoreBig}>
              {overallScore}<span>/100</span>
            </div>
            <div>
              <div className={styles.tierLabel}>{tier.label}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Overall Score</div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.exchangesSection}>
        <h2>Question by Question Breakdown</h2>
        {exchanges.map((ex, i) => (
          <ExchangeDetail key={ex.id} exchange={ex} index={i} />
        ))}
      </div>
    </div>
  );
}

function ExchangeDetail({ exchange, index }: { exchange: InterviewExchange; index: number }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className={styles.exchangeCard}>
      <div className={styles.exchangeTop}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className={styles.qTag}>Q{index + 1} • {exchange.question_tag.replace('-', ' ')}</span>
        </div>
        {exchange.score !== null && (
          <div className={styles.qScore}>{exchange.score}/100</div>
        )}
      </div>

      <h3 className={styles.qTitle}>{exchange.question}</h3>

      {exchange.answer && (
        <div className={styles.userAnswer}>
          <strong style={{ display: 'block', marginBottom: '4px', color: '#f8fafc', fontSize: '0.8rem' }}>YOUR ANSWER:</strong>
          {exchange.answer}
        </div>
      )}

      {exchange.feedback && (
        <div className={styles.feedbackText}>
          <strong style={{ display: 'block', marginBottom: '4px', color: '#38bdf8', fontSize: '0.8rem' }}>FEEDBACK:</strong>
          {exchange.feedback}
        </div>
      )}
    </div>
  );
}
