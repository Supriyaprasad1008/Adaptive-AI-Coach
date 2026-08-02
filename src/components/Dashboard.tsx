'use client';

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
import styles from '@/styles/Dashboard.module.scss';

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
    <div className={styles.container}>
      <section className={styles.heroBanner}>
        <div className={styles.badge}>
          <Sparkles size={14} />
          Adaptive AI-powered coaching
        </div>
        <h1 className={styles.heroTitle}>
          Master your interviews with a coach that adapts to you
        </h1>
        <p className={styles.heroDesc}>
          Practice realistic mock interviews where question difficulty rises and falls
          based on the quality of your answers. Track your growth across sessions with
          detailed performance reports.
        </p>
      </section>

      {stats && (
        <section className={styles.statsGrid}>
          <StatCard
            icon={<BarChart3 size={20} />}
            label="Sessions completed"
            value={String(stats.total)}
            tone="blue"
          />
          <StatCard
            icon={<TrendingUp size={20} />}
            label="Average score"
            value={`${stats.avg}`}
            suffix="/100"
            tone="teal"
          />
          <StatCard
            icon={<Trophy size={20} />}
            label="Best score"
            value={`${stats.best}`}
            suffix="/100"
            tone="amber"
          />
          <StatCard
            icon={<Target size={20} />}
            label="Latest trend"
            value={stats.trend > 0 ? `+${stats.trend}` : stats.trend === 0 ? '0' : `${stats.trend}`}
            tone={stats.trend >= 0 ? 'green' : 'rose'}
          />
        </section>
      )}

      <section className={styles.configSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon}>
            <Brain size={22} />
          </div>
          <div>
            <h2 className={styles.sectionTitle}>Start a new practice session</h2>
            <p className={styles.sectionSubtitle}>Configure your mock interview below</p>
          </div>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Target role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={styles.selectInput}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Focus area</label>
            <select
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value as FocusArea)}
              className={styles.selectInput}
            >
              {FOCUS_AREAS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
              {focusAreaMeta.description} - {questionCount} questions
            </span>
          </div>

          <div className={styles.formGroup}>
            <label>Starting difficulty</label>
            <div className={styles.difficultyGroup}>
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`${styles.diffBtn} ${difficulty === d ? styles.active : ''}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => onStartSession({ role, focusArea, difficulty })}
          className={styles.startBtn}
        >
          <Play size={18} />
          Begin interview
        </button>
      </section>

      <section className={styles.sessionsSection}>
        <div className={styles.sessionsHeader}>
          <h2>Recent sessions</h2>
          {sessions.length > 0 && <span>{sessions.length} total</span>}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
            Loading sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px' }}>
            <Calendar size={32} style={{ color: '#64748b', margin: '0 auto 12px' }} />
            <p style={{ color: '#f8fafc', fontWeight: 600 }}>No sessions yet</p>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Complete your first mock interview to see it here.</p>
          </div>
        ) : (
          <div className={styles.sessionsGrid}>
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
  return (
    <div className={styles.statCard}>
      <div className={`${styles.statIcon} ${styles[tone]}`}>
        {icon}
      </div>
      <p className={styles.statValue}>
        {value}
        {suffix && <span>{suffix}</span>}
      </p>
      <p className={styles.statLabel}>{label}</p>
    </div>
  );
}

function SessionCard({ session, onViewReport }: { session: InterviewSession; onViewReport: (id: string) => void }) {
  const score = session.overall_score;
  const tier = score !== null ? scoreTier(score) : null;
  const date = new Date(session.started_at);
  const isComplete = session.status === 'completed';

  const tierKey = tier ? tier.label.toLowerCase().replace(/\s+/g, '') : '';

  return (
    <button onClick={() => onViewReport(session.id)} className={styles.sessionCard}>
      <div>
        <div className={styles.sessionRole}>{session.role}</div>
        <div className={styles.sessionMeta}>
          <span className={styles.focusBadge}>{session.focus_area.replace('-', ' ')}</span>
          <span>{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          <span style={{ textTransform: 'capitalize' }}>{session.difficulty}</span>
          {isComplete && tier && (
            <span className={`${styles.tierBadge} ${styles[tierKey] || ''}`}>
              {tier.label}
            </span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {score !== null && (
          <div className={styles.scoreValue}>
            {score}<span>/100</span>
          </div>
        )}
        <ChevronRight size={20} style={{ color: '#64748b', marginLeft: '12px' }} />
      </div>
    </button>
  );
}

export type { SessionWithExchanges };
