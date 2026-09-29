import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';

export default function App() {
  const [hasLaunched, setHasLaunched] = useState(false);

  useEffect(() => {
    // Clear any stale dashboard hash on initial startup
    if (window.location.hash.startsWith('#dashboard')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  const handleLaunch = () => {
    setHasLaunched(true);
    window.location.hash = '#dashboard/overview';
  };

  if (!hasLaunched) {
    return <LandingPage onLaunch={handleLaunch} />;
  }

  return <Dashboard />;
}
