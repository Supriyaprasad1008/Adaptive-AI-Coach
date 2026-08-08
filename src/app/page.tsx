'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LandingView from '@/components/LandingView';
import AuthModal from '@/components/AuthModal';
import { getOrCreatePractitionerId } from '@/lib/supabase';

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
    const practitionerId = getOrCreatePractitionerId(profile);
    const profileWithIdentity = { ...profile, practitioner_id: practitionerId };
    localStorage.setItem('interview_coach_user', JSON.stringify(profileWithIdentity));
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
