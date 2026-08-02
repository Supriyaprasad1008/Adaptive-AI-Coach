'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { UserCheck, LogOut } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import styles from '@/styles/AppLayout.module.scss';

interface UserProfile {
  name: string;
  email: string;
}

export default function HeaderNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('interview_coach_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('interview_coach_user');
      }
    }
  }, []);

  const handleLoginSuccess = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem('interview_coach_user', JSON.stringify(profile));
    setIsAuthModalOpen(false);
    router.push('/practice');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('interview_coach_user');
    router.push('/');
  };

  const handleBeginJourney = () => {
    if (user) {
      router.push('/practice');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/" className={styles.logoBtn}>
            <img src="/logo.svg" alt="Interview Coach Logo" width={34} height={34} style={{ borderRadius: '8px' }} />
            <span className={styles.logoTitle}>
              Interview Coach<sup>®</sup>
            </span>
          </Link>

          <nav className={styles.navLinks}>
            <Link
              href="/"
              className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}
            >
              Home
            </Link>
            <Link
              href="/practice"
              className={`${styles.navLink} ${pathname === '/practice' ? styles.active : ''}`}
            >
              Practice
            </Link>
            <Link
              href="/analytics"
              className={`${styles.navLink} ${pathname === '/analytics' ? styles.active : ''}`}
            >
              Analytics
            </Link>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {user ? (
              <>
                <Link
                  href="/practice"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textDecoration: 'none',
                  }}
                >
                  <UserCheck size={16} style={{ color: '#38bdf8' }} />
                  <span>{user.name}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#a1a1aa',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <button onClick={handleBeginJourney} className={styles.ctaBtn}>
                Begin Journey
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
