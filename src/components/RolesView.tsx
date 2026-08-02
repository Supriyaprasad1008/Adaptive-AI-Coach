'use client';

import { useRouter } from 'next/navigation';
import { ROLES } from '@/lib/supabase';
import { Briefcase, ChevronRight, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import styles from '@/styles/Dashboard.module.scss';

export default function RolesView() {
  const router = useRouter();

  const handleSelectRole = (roleName: string) => {
    router.push(`/practice?role=${encodeURIComponent(roleName)}`);
  };

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 400, color: '#ffffff' }}>
            Supported Tech Roles
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginTop: '4px' }}>
            Choose your target career track to practice tailored technical and behavioral questions.
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

      <div className={styles.sessionsGrid}>
        {ROLES.map((roleName: string) => (
          <button
            key={roleName}
            onClick={() => handleSelectRole(roleName)}
            className={styles.sessionCard}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                }}
              >
                <Briefcase size={20} />
              </div>
              <div>
                <h3 className={styles.sessionRole}>{roleName}</h3>
                <span className={styles.focusBadge} style={{ marginTop: '4px', display: 'inline-block' }}>
                  <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  Adaptive Questions
                </span>
              </div>
            </div>

            <ChevronRight size={20} style={{ color: '#71717a' }} />
          </button>
        ))}
      </div>
    </div>
  );
}
