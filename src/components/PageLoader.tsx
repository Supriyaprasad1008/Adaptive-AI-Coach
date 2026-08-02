'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import AnimatedLogoLoader from '@/components/AnimatedLogoLoader';

export default function PageLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isInitial, setIsInitial] = useState(true);

  // Initial site load / refresh handler
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setIsInitial(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Route transition / page shifting handler
  useEffect(() => {
    if (!isInitial) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [pathname, isInitial]);

  if (!loading) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(4, 25, 43, 0.35)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        transition: 'opacity 0.3s ease',
      }}
    >
      <div style={{ transform: 'scale(1.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatedLogoLoader size={140} />
      </div>
    </div>
  );
}
