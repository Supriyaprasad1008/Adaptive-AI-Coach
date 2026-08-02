'use client';

import { Sparkles, Brain, Target, Award, ArrowRight } from 'lucide-react';
import styles from '@/styles/Dashboard.module.scss';

interface LandingViewProps {
  onBeginJourney: () => void;
}

export default function LandingView({ onBeginJourney }: LandingViewProps) {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.heroBanner}>
        <div className={styles.badge}>
          <Sparkles size={14} />
          Adaptive AI Interview Coaching
        </div>
        <h1 className={`${styles.heroTitle} animate-fade-rise`}>
          Where <em className="not-italic text-muted-foreground">dreams</em> rise{' '}
          <em className="not-italic text-muted-foreground">through the silence.</em>
        </h1>
        <p className={`${styles.heroDesc} animate-fade-rise-delay`}>
          We're designing tools for deep thinkers, bold creators, and quiet rebels.
          Amid the chaos, we build digital spaces for sharp focus and inspired work.
        </p>

        <button
          onClick={onBeginJourney}
          className={`${styles.startBtn} animate-fade-rise-delay-2`}
          style={{ marginTop: '2.5rem' }}
        >
          Begin Journey <ArrowRight size={18} />
        </button>
      </section>

      {/* Feature Showcase Grid */}
      <section className={styles.statsGrid} style={{ marginTop: '1rem' }}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} blue`}>
            <Brain size={20} />
          </div>
          <div className={styles.statValue}>
            Adaptive AI <span>Engine</span>
          </div>
          <p className={styles.statLabel}>
            Real-time difficulty scaling that adapts to your performance dynamically.
          </p>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} teal`}>
            <Target size={20} />
          </div>
          <div className={styles.statValue}>
            8+ Tech <span>Roles</span>
          </div>
          <p className={styles.statLabel}>
            Tailored question banks for Frontend, Backend, Product, System Design & UX.
          </p>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} green`}>
            <Award size={20} />
          </div>
          <div className={styles.statValue}>
            Instant <span>Analytics</span>
          </div>
          <p className={styles.statLabel}>
            Comprehensive 0-100 score metrics, key strengths & improvement insights.
          </p>
        </div>
      </section>
    </div>
  );
}
