'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase, type InterviewSession } from '@/lib/supabase';
import { BarChart3, TrendingUp, Trophy, Target, Award, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import styles from '@/styles/Dashboard.module.scss';

export default function AnalyticsView() {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('interview_sessions')
        .select('*')
        .order('started_at', { ascending: false });
      setSessions((data as InterviewSession[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const completed = useMemo(
    () => sessions.filter((s) => s.status === 'completed' && s.overall_score !== null),
    [sessions],
  );

  const stats = useMemo(() => {
    if (completed.length === 0) return null;
    const scores = completed.map((s) => s.overall_score!);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    return { avg, max, min, total: completed.length };
  }, [completed]);

  return (
    <div className={styles.container}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 400, color: '#ffffff' }}>
            Performance Analytics
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginTop: '4px' }}>
            Comprehensive evaluation metrics across all your mock interview sessions.
          </p>
        </div>

        <Link
          href="/practice"
          className={styles.startBtn}
          style={{ padding: '8px 20px', fontSize: '0.85rem', marginTop: 0 }}
        >
          <ArrowLeft size={16} /> Back to Practice
        </Link>
      </div>

      {/* Summary Cards */}
      {stats ? (
        <section className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} blue`}>
              <BarChart3 size={20} />
            </div>
            <div className={styles.statValue}>
              {stats.total} <span>sessions</span>
            </div>
            <div className={styles.statLabel}>Completed Interviews</div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} teal`}>
              <TrendingUp size={20} />
            </div>
            <div className={styles.statValue}>
              {stats.avg} <span>/100</span>
            </div>
            <div className={styles.statLabel}>Average Score</div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} amber`}>
              <Trophy size={20} />
            </div>
            <div className={styles.statValue}>
              {stats.max} <span>/100</span>
            </div>
            <div className={styles.statLabel}>Peak Performance</div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} green`}>
              <Target size={20} />
            </div>
            <div className={styles.statValue}>
              {stats.min} <span>/100</span>
            </div>
            <div className={styles.statLabel}>Baseline Score</div>
          </div>
        </section>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '64px',
            borderRadius: '24px',
            background: 'rgba(4, 25, 43, 0.5)',
            border: '1px dashed rgba(255, 255, 255, 0.15)',
          }}
        >
          <Award size={40} style={{ color: '#71717a', margin: '0 auto 16px' }} />
          <h3 style={{ color: '#ffffff', fontSize: '1.25rem' }}>No Analytics Data Yet</h3>
          <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginTop: '6px' }}>
            Complete your first mock interview session to unlock detailed performance trends.
          </p>
        </div>
      )}
    </div>
  );
}
