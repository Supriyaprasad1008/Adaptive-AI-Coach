'use client';

import { Sparkles, Brain, Target, Award, ArrowRight, Briefcase } from 'lucide-react';
import Link from 'next/link';
import styles from '@/styles/Dashboard.module.scss';

interface LandingViewProps {
  onBeginJourney: () => void;
}

export default function LandingView({ onBeginJourney }: LandingViewProps) {
  return (
    <div className={styles.container}>
      {/* Full-Width Top-to-Bottom Video Background Hero Banner */}
      <section className={styles.heroBannerFull}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="heroVideoContainer"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
        />
        <div className="heroVideoOverlay" />

        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '80rem' }}>
          {/* Main Hero Header */}
          <div className={styles.badge} style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}>
            <Sparkles size={14} style={{ color: '#38bdf8' }} />
            Adaptive AI Interview Coaching
          </div>

          <h1 className={`${styles.heroTitle} animate-fade-rise`} style={{ color: '#ffffff' }}>
            Where <em className="not-italic" style={{ color: '#93c5fd' }}>dreams</em> rise{' '}
            <em className="not-italic" style={{ color: '#cbd5e1' }}>through the silence.</em>
          </h1>

          <p className={`${styles.heroDesc} animate-fade-rise-delay`} style={{ color: '#e2e8f0' }}>
            We're designing tools for deep thinkers, bold creators, and quiet rebels.
            Amid the chaos, we build digital spaces for sharp focus and inspired work.
          </p>

          <button
            onClick={onBeginJourney}
            className="animate-fade-rise-delay-2"
            style={{
              marginTop: '2.5rem',
              marginBottom: '4.5rem',
              background: '#ffffff',
              color: '#0f172a',
              fontWeight: 600,
              padding: '16px 38px',
              borderRadius: '9999px',
              border: 'none',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
              transition: 'all 0.2s ease',
            }}
          >
            Begin Journey <ArrowRight size={18} />
          </button>

          {/* Section Heading Inside Video Background */}
          <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '3.5rem', width: '100%' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '1px' }}>
              What Interview Coach Does
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: '#ffffff', marginTop: '0.5rem', lineHeight: 1.1 }}>
              Intelligent Mock Coaching Built for Tech Engineers
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '1.05rem', maxWidth: '38rem', margin: '0.75rem auto 0', lineHeight: 1.6 }}>
              Experience realistic interview simulations powered by an adaptive AI model that evaluates your answers in real time.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 1: WHAT IT DOES FEATURE CARDS */}
      <section style={{ marginTop: '0.5rem' }}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} blue`}>
              <Brain size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
              Adaptive Difficulty Engine
            </h3>
            <p className={styles.statLabel}>
              Question difficulty dynamically rises or falls based on the quality, structure, and depth of your previous response.
            </p>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} teal`}>
              <Award size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
              STAR Method Evaluation
            </h3>
            <p className={styles.statLabel}>
              Instant feedback analyzing your Situation, Task, Action, and Result with precise recommendations for improvement.
            </p>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} green`}>
              <Target size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
              Role Specialization
            </h3>
            <p className={styles.statLabel}>
              Curated question banks tailored specifically for Frontend, Backend, System Design, DevOps, and Product Management.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: HOW IT WORKS (3 SIMPLE STEPS) */}
      <section style={{ marginTop: '4rem', padding: '3rem 2rem', borderRadius: '24px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '1px' }}>
            How It Works
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: '#0f172a', marginTop: '0.5rem' }}>
            Three Steps to Interview Mastery
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              01
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>Configure Your Session</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6 }}>
              Select your target engineering role (Frontend, Backend, System Design) and focus area (Behavioral, Technical, Leadership).
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f0fdf4', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              02
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>Practice Under Pressure</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6 }}>
              Answer real-world technical and behavioral questions as if you were speaking directly to a senior interviewer.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              03
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>Review Detailed Feedback</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6 }}>
              Get a comprehensive 0-100 score breakdown, highlighting key strengths and actionable advice to improve your score.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: EXPLORE TECH ROLES PREVIEW */}
      <section style={{ marginTop: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Tailored Question Banks
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: '#0f172a', marginTop: '0.25rem' }}>
              Practice By Career Track
            </h2>
          </div>
          <Link href="/roles" style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All Roles <ArrowRight size={16} />
          </Link>
        </div>

        <div className={styles.sessionsGrid}>
          {['Frontend Engineer', 'Backend Engineer', 'Fullstack Developer', 'System Architect'].map((roleName) => (
            <div key={roleName} className={styles.sessionCard} onClick={onBeginJourney}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Briefcase size={20} />
                </div>
                <div>
                  <h3 className={styles.sessionRole}>{roleName}</h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Adaptive Behavioral & Technical</span>
                </div>
              </div>
              <ArrowRight size={18} style={{ color: '#94a3b8' }} />
            </div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section style={{ marginTop: '4rem', padding: '3.5rem 2rem', borderRadius: '24px', background: '#0f172a', color: '#ffffff', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 400 }}>
          Ready to elevate your interview confidence?
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '32rem', margin: '1rem auto 2rem' }}>
          Join thousands of developers practicing adaptive mock interviews with real-time feedback.
        </p>
        <button onClick={onBeginJourney} className={styles.startBtn} style={{ background: '#ffffff', color: '#0f172a' }}>
          Start Free Practice Session <ArrowRight size={18} />
        </button>
      </section>
    </div>
  );
}
