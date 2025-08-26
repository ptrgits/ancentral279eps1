import { useState } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import WelcomeHero from '@/components/WelcomeHero';
import ChatInterface from '@/components/ChatInterface';

const Index = () => {
  const [currentView, setCurrentView] = useState<'loading' | 'welcome' | 'chat'>('loading');

  const handleLoadingComplete = () => {
    setCurrentView('welcome');
  };

  const handleJoinChat = () => {
    setCurrentView('chat');
  };

  if (currentView === 'loading') {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  if (currentView === 'welcome') {
    return <WelcomeHero />;
  }

  return <ChatInterface />;
};

export default Index;
