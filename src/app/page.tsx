'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LandingView from '@/components/LandingView';
import AuthModal from '@/components/AuthModal';

export default function Home() {
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleBeginJourney = () => {
    const saved = localStorage.getItem('interview_coach_user');
    if (saved) {
      router.push('/practice');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleLoginSuccess = (profile: { name: string; email: string }) => {
    localStorage.setItem('interview_coach_user', JSON.stringify(profile));
    setIsAuthModalOpen(false);
    router.push('/practice');
  };

  return (
    <>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      <LandingView onBeginJourney={handleBeginJourney} />
    </>
  );
}
