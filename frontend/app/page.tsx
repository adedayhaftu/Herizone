'use client';

import { ChatbotWidget } from '@/components/chatbot-widget';
import { CommunityFeed } from '@/components/community-feed';
import { ExpertsPage } from '@/components/experts-page';
import { Footer } from '@/components/footer';
import { HomePage } from '@/components/home-page';
import { LearnPage } from '@/components/learn-page';
import { Navbar } from '@/components/navbar';
import { ProfilePage } from '@/components/profile-page';
import { useAppStore } from '@/lib/store';

export default function App() {
  const { currentView } = useAppStore();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex-1">
        {currentView === 'home' && <HomePage />}
        {currentView === 'feed' && <CommunityFeed />}
        {currentView === 'learn' && <LearnPage />}
        {currentView === 'experts' && <ExpertsPage />}
        {currentView === 'profile' && <ProfilePage />}
      </div>
      <Footer />
      <ChatbotWidget />
    </div>
  );
}
