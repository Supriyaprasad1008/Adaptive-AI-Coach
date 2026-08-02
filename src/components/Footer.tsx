'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  if (pathname !== '/') {
    return null;
  }

  return (
    <footer
      style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
        background: '#04192b',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        padding: '4rem 2rem 2.5rem',
        marginTop: 'auto',
        color: '#ffffff',
      }}
    >
      <div
        style={{
          maxWidth: '80rem',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '3rem',
        }}
      >
        {/* Brand Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Image src="/logo.svg" alt="Interview Coach Logo" width={32} height={32} style={{ borderRadius: '8px' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: '#ffffff' }}>
              Interview Coach<sup>®</sup>
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: '280px' }}>
            Where dreams rise through the silence. Designing adaptive AI interview coaching tools for deep thinkers and ambitious software engineers.
          </p>
        </div>

        {/* Product Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Platform
          </h4>
          <Link href="/" style={{ fontSize: '0.875rem', color: '#cbd5e1', textDecoration: 'none' }}>Home</Link>
          <Link href="/roles" style={{ fontSize: '0.875rem', color: '#cbd5e1', textDecoration: 'none' }}>Tech Roles</Link>
          <Link href="/practice" style={{ fontSize: '0.875rem', color: '#cbd5e1', textDecoration: 'none' }}>Mock Practice</Link>
          <Link href="/analytics" style={{ fontSize: '0.875rem', color: '#cbd5e1', textDecoration: 'none' }}>Performance Analytics</Link>
        </div>

        {/* Feature Areas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Core Features
          </h4>
          <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Adaptive Questioning Engine</span>
          <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>STAR Framework Evaluation</span>
          <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>0-100 Score Metrics</span>
          <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Real-time Difficulty Scaling</span>
        </div>

        {/* Legal & Copyright */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Legal
          </h4>
          <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Privacy Policy</span>
          <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Terms of Service</span>
          <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Security & AI Ethics</span>
        </div>
      </div>

      <div
        style={{
          maxWidth: '80rem',
          margin: '3rem auto 0',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem',
          color: '#64748b',
        }}
      >
        <p>© 2026 Interview Coach® — All rights reserved.</p>
        <p>Built with Next.js 14 & Supabase</p>
      </div>
    </footer>
  );
}
