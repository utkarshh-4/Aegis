import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';

export default function App() {
  const [currentHash, setCurrentHash] = useState(() => window.location.hash || '');

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLaunch = () => {
    window.location.hash = '#dashboard/overview';
  };

  if (currentHash.startsWith('#dashboard')) {
    return <Dashboard />;
  }

  return <LandingPage onLaunch={handleLaunch} />;
}
