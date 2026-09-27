import { useState } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';

export default function App() {
  const [hasStartedAssessment, setHasStartedAssessment] = useState(false);

  if (!hasStartedAssessment) {
    return <LandingPage onLaunch={() => setHasStartedAssessment(true)} />;
  }

  return <Dashboard />;
}
