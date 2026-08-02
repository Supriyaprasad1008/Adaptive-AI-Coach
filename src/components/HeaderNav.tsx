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
  const [scrolled, setScrolled] = useState(false);

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

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
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

  // On home page at top, render transparent overlay navbar
  const isTransparent = pathname === '/' && !scrolled;

  return (
    <>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <header
        className={`${styles.header} ${isTransparent ? styles.headerTransparent : styles.headerSolid}`}
      >
        <div className={styles.headerContent}>
          <Link href="/" className={styles.logoBtn}>
            <img src="/logo.svg" alt="Interview Coach Logo" width={34} height={34} style={{ borderRadius: '8px' }} />
            <span className={`${styles.logoTitle} ${isTransparent ? styles.textWhite : styles.textNavy}`}>
              Interview Coach<sup>®</sup>
            </span>
          </Link>

          <nav className={styles.navLinks}>
            <Link
              href="/"
              className={`${styles.navLink} ${isTransparent ? styles.navLinkWhite : styles.navLinkNavy} ${pathname === '/' ? styles.active : ''}`}
            >
              Home
            </Link>
            <Link
              href="/roles"
              className={`${styles.navLink} ${isTransparent ? styles.navLinkWhite : styles.navLinkNavy} ${pathname === '/roles' ? styles.active : ''}`}
            >
              Roles
            </Link>
            <Link
              href="/practice"
              className={`${styles.navLink} ${isTransparent ? styles.navLinkWhite : styles.navLinkNavy} ${pathname === '/practice' ? styles.active : ''}`}
            >
              Practice
            </Link>
            <Link
              href="/analytics"
              className={`${styles.navLink} ${isTransparent ? styles.navLinkWhite : styles.navLinkNavy} ${pathname === '/analytics' ? styles.active : ''}`}
            >
              Analytics
            </Link>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {user ? (
              <>
                <Link
                  href="/practice"
                  className={isTransparent ? styles.profileBadgeTransparent : styles.profileBadgeSolid}
                >
                  <UserCheck size={16} style={{ color: isTransparent ? '#38bdf8' : '#2563eb' }} />
                  <span>{user.name}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isTransparent ? 'rgba(255,255,255,0.7)' : '#64748b',
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
              <button
                onClick={handleBeginJourney}
                className={isTransparent ? styles.ctaBtnGlass : styles.ctaBtn}
              >
                Begin Journey
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
