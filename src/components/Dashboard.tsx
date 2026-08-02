'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  supabase,
  type InterviewSession,
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
  ChevronRight,
  Target,
  BarChart3,
  Play,
  Calendar,
  Briefcase,
  Sparkles,
  Lightbulb,
  UserCheck,
} from 'lucide-react';
import styles from '@/styles/Dashboard.module.scss';

interface DashboardProps {
  onStartSession: (config: { role: string; focusArea: FocusArea; difficulty: Difficulty }) => void;
  onViewReport: (sessionId: string) => void;
  refreshKey: number;
}

export default function Dashboard({ onStartSession, onViewReport, refreshKey }: DashboardProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [role, setRole] = useState(ROLES[0]);
  const [focusArea, setFocusArea] = useState<FocusArea>('behavioral');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Guest Practitioner');

  useEffect(() => {
    const saved = localStorage.getItem('interview_coach_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u.name) setUserName(u.name);
      } catch (e) {
        // Fallback to default
      }
    }
  }, []);

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
    <div className={styles.dashboardLayout}>
      {/* Integrated Left Sidebar */}
      <aside className={styles.sidebarPanel}>
        {/* Navigation Section */}
        <div className={styles.sidebarSection}>
          <span className={styles.sidebarHeading}>Dashboard Nav</span>
          <ul className={styles.sidebarNav}>
            <li className={`${styles.sidebarNavItem} ${styles.active}`}>
              <Play size={20} style={{ color: '#2563eb' }} />
              <span>Practice Workspace</span>
            </li>
            <li onClick={() => router.push('/roles')} className={styles.sidebarNavItem}>
              <Briefcase size={20} />
              <span>Tech Role Tracks</span>
            </li>
            <li onClick={() => router.push('/analytics')} className={styles.sidebarNavItem}>
              <BarChart3 size={20} />
              <span>Performance Analytics</span>
            </li>
          </ul>
        </div>

        {/* Quick Role Selection Presets */}
        <div className={styles.sidebarSection}>
          <span className={styles.sidebarHeading}>Target Role Presets</span>
          <div className={styles.sidebarRoleList}>
            {['Frontend Engineer', 'Backend Engineer', 'Full-Stack Engineer', 'System Architect'].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`${styles.sidebarRoleBtn} ${role === r ? styles.activeRole : ''}`}
              >
                <Sparkles size={14} />
                <span>{r}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Practice Progress Snapshot */}
        {stats && (
          <div className={styles.sidebarSection}>
            <span className={styles.sidebarHeading}>Your Progress</span>
            <div className={styles.progressCard}>
              <div className={styles.progressRow}>
                <span>Completed</span>
                <strong>{stats.total} sessions</strong>
              </div>
              <div className={styles.progressRow}>
                <span>Average Score</span>
                <strong>{stats.avg} / 100</strong>
              </div>
              <div className={styles.progressBarBg}>
                <div className={styles.progressBarFill} style={{ width: `${Math.min(100, stats.avg)}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* AI Coach Guidance Card */}
        <div className={styles.sidebarCoachCard}>
          <div className={styles.coachCardHeader}>
            <Lightbulb size={16} />
            <span>AI Coach Insight</span>
          </div>
          <p>Practice using the STAR method (Situation, Task, Action, Result) to maximize score potential.</p>
        </div>

        {/* User Status Footer */}
        <div className={styles.sidebarUserFooter}>
          <div className={styles.userBadgeAvatar}>
            <UserCheck size={18} />
          </div>
          <div className={styles.userBadgeInfo}>
            <strong>{userName}</strong>
            <span>Active Session</span>
          </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className={styles.mainWorkspaceArea}>
        <div className={styles.container}>
        {/* Session Setup Form */}
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
              <span style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '4px' }}>
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

        {/* Analytics Stats Overview */}
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

        {/* Recent Sessions List */}
        <section className={styles.sessionsSection}>
          <div className={styles.sessionsHeader}>
            <h2>Recent sessions</h2>
            {sessions.length > 0 && <span>{sessions.length} total</span>}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#a1a1aa' }}>
              Loading sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '16px', background: 'rgba(4, 25, 43, 0.4)' }}>
              <Calendar size={32} style={{ color: '#71717a', margin: '0 auto 12px' }} />
              <p style={{ color: '#ffffff', fontWeight: 600 }}>No sessions yet</p>
              <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginTop: '4px' }}>Complete your first mock interview to see it here.</p>
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
    </div>
  </div>
);
}

function StatCard({
  icon,
  label,
  value,
  suffix = '',
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
      <div className={`${styles.statIcon} ${styles[tone]}`}>{icon}</div>
      <div className={styles.statValue}>
        {value}
        {suffix && <span>{suffix}</span>}
      </div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

function SessionCard({
  session,
  onViewReport,
}: {
  session: InterviewSession;
  onViewReport: (id: string) => void;
}) {
  const isComplete = session.status === 'completed';
  const tier = isComplete && session.overall_score !== null ? scoreTier(session.overall_score) : null;
  const date = new Date(session.started_at);

  return (
    <button onClick={() => onViewReport(session.id)} className={styles.sessionCard}>
      <div>
        <h3 className={styles.sessionRole}>{session.role}</h3>
        <div className={styles.sessionMeta}>
          <span className={styles.focusBadge}>{session.focus_area}</span>
          <span>{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          <span style={{ textTransform: 'capitalize' }}>{session.difficulty}</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {isComplete && session.overall_score !== null ? (
          <div className={styles.scoreValue}>
            {session.overall_score}
            <span>/100</span>
          </div>
        ) : (
          <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>In progress</span>
        )}
        <ChevronRight size={20} style={{ color: '#71717a', marginLeft: '12px' }} />
      </div>
    </button>
  );
}
