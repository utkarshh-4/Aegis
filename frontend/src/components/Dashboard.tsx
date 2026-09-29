import React, { useEffect, useState } from 'react';
import FindingsView from './FindingsView';
import AttackSurfaceView from './AttackSurfaceView';
import ReportView from './ReportView';
import AssessmentsView from './AssessmentsView';
import MethodologyView from './MethodologyView';
import EvidenceView from './EvidenceView';
import {
  ShieldAlert,
  ShieldCheck, 
  Target, 
  Search, 
  Bell, 
  User,
  LayoutDashboard,
  Radio,
  ClipboardList,
  AlertTriangle,
  FileText,
  BookOpen,
  Settings,
  Download,
  Terminal,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Loader2,
  Clock,
  TrendingUp,
  Activity,
  Server,
  Code,
  Box,
  Link,
  Shield,
  ChevronRight,
  Lock,
  Menu,
  Play
} from 'lucide-react';

// Types
interface Finding {
  id: string;
  title: string;
  description: string;
  affectedComponent?: string;
  cwe?: string;
  cvssVector?: string;
  cvssScore: number;
  severity: string;
  stepsToReproduce: string[];
  pocEvidence: string;
  businessImpact?: string;
  remediation?: string;
  disclosureStatus?: string;
  discoveredAt?: string;
  category: string;
  lastPocSuccess?: boolean;
  lastPocRunAt?: string;
}

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [targetBaseUrl, setTargetBaseUrl] = useState<string>('');
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [isRunningPoc, setIsRunningPoc] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash;
    return hash.startsWith('#dashboard/') ? hash.split('/')[1] : 'overview';
  });

  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const generatingRef = React.useRef<NodeJS.Timeout | null>(null);

  const [demoAssessmentStarted, setDemoAssessmentStarted] = useState(false);
  const [assessmentStatus, setAssessmentStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [assessmentLogs, setAssessmentLogs] = useState<{timestamp: string, level: string, message: string}[]>([]);
  const [assessmentStages, setAssessmentStages] = useState({
    'Target Setup': 'PENDING',
    'Discovery': 'PENDING',
    'Security Scanning': 'PENDING',
    'Analysis': 'PENDING',
    'Verification': 'PENDING',
    'Report': 'PENDING'
  });
  const [scanners, setScanners] = useState([
    { name: 'Semgrep', progress: 0, status: 'PENDING' },
    { name: 'Gitleaks', progress: 0, status: 'PENDING' },
    { name: 'Trivy', progress: 0, status: 'PENDING' },
    { name: 'Nuclei', progress: 0, status: 'PENDING' },
    { name: 'ZAP', progress: 0, status: 'PENDING' },
    { name: 'Schemathesis', progress: 0, status: 'PENDING' },
    { name: 'Playwright', progress: 0, status: 'PENDING' }
  ]);
  const [assessmentStartedAt, setAssessmentStartedAt] = useState<string | null>(null);

  const addLog = (level: string, message: string) => {
    setAssessmentLogs(prev => [...prev, { timestamp: new Date().toISOString(), level, message }]);
  };

  const currentRunId = React.useRef(0);

  const resetDemo = () => {
    currentRunId.current += 1;
    setDemoAssessmentStarted(false);
    setAssessmentStatus('idle');
    setFindings([]);
    setSelectedFinding(null);
    setAssessmentStartedAt(null);
    setAssessmentLogs([]);
    setAssessmentStages({
      'Target Setup': 'PENDING',
      'Discovery': 'PENDING',
      'Security Scanning': 'PENDING',
      'Analysis': 'PENDING',
      'Verification': 'PENDING',
      'Report': 'PENDING'
    });
    setScanners(scanners.map(s => ({...s, progress: 0, status: 'PENDING'})));
  };


  const wait = (ms: number, runId: number) => 
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (currentRunId.current !== runId) {
          reject(new Error('CANCELLED'));
        } else {
          resolve(true);
        }
      }, ms);
    });

  const checkCancellation = (runId: number) => {
    if (currentRunId.current !== runId) throw new Error('CANCELLED');
  };

  const startDemoAssessment = async () => {
    if (assessmentStatus === 'running') return;
    
    const DEMO_SPEED_MULTIPLIER = 1.1;
    
    currentRunId.current += 1;
    const runId = currentRunId.current;
    
    setDemoAssessmentStarted(true);
    setAssessmentStatus('running');
    setAssessmentStartedAt(new Date().toISOString());
    setAssessmentLogs([]);
    
    setAssessmentStages({
      'Target Setup': 'PENDING',
      'Discovery': 'PENDING',
      'Security Scanning': 'PENDING',
      'Analysis': 'PENDING',
      'Verification': 'PENDING',
      'Report': 'PENDING'
    });
    setScanners(prev => prev.map(s => ({...s, progress: 0, status: 'PENDING'})));
    
    try {
      addLog('INFO', 'Initializing synthetic security assessment...');
      setAssessmentStages(prev => ({...prev, 'Target Setup': 'RUNNING'}));
      
      // Target Check with timeout
      addLog('INFO', 'Validating target scope...');
      const targetTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Target check timed out')), 5000));
      const targetFetch = fetch('http://localhost:4000/api/target-status').then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      });
      
      await Promise.race([targetFetch, targetTimeout]);
      checkCancellation(runId);
      
      addLog('INFO', `Target reachable: ${targetBaseUrl || 'http://localhost:3000'}`);
      await wait(2500 * DEMO_SPEED_MULTIPLIER, runId);
      addLog('INFO', 'Target setup completed.');
      
      setAssessmentStages(prev => ({...prev, 'Target Setup': 'COMPLETED', 'Discovery': 'RUNNING'}));
      addLog('INFO', 'Discovery phase started.');
      addLog('INFO', 'Mapping synthetic application surface...');
      addLog('INFO', 'Enumerating API and client security domains...');
      
      await wait(3000 * DEMO_SPEED_MULTIPLIER, runId);
      addLog('INFO', 'Discovery phase completed.');
      
      setAssessmentStages(prev => ({...prev, 'Discovery': 'COMPLETED', 'Security Scanning': 'RUNNING'}));
      addLog('INFO', 'Security scanning started.');
      
      const generatePattern = (profile: string) => {
        const pattern: {delta: number, delay: number}[] = [];
        let p = 0;
        let i = 0;
        while (p < 100) {
          i++;
          const r = (i * 37) % 5; // pseudo-random 0-4
          let delta = 3 + r; // 3 to 7
          let delay = 70 + (r * 10); // 70 to 110ms
          
          if (profile === 'fast-early') {
            if (p < 50) { delta += 3; delay -= 20; }
            else { delta = Math.max(1, delta - 2); delay += 30; }
          } else if (profile === 'slow-early') {
            if (p < 50) { delta = Math.max(1, delta - 2); delay += 30; }
            else { delta += 3; delay -= 20; }
          } else if (profile === 'plateau') {
            if ((p > 30 && p < 45 && i % 2 === 0) || (p > 70 && p < 85 && i % 2 === 0)) {
              pattern.push({ delta: 0, delay: 250 * DEMO_SPEED_MULTIPLIER });
            }
          } else if (profile === 'slow') {
            delta = Math.max(2, delta - 1);
            delay += 40; // 110 to 150ms per step
          }

          if (p + delta > 100) delta = 100 - p;
          pattern.push({ delta, delay: delay * DEMO_SPEED_MULTIPLIER });
          p += delta;
          
          // occasional micro-pause
          if (p < 100 && i % 7 === 0) {
             pattern.push({ delta: 0, delay: 150 * DEMO_SPEED_MULTIPLIER });
          }
        }
        return pattern;
      };

      const updateScanner = (name: string, progress: number, status: string) => {
        setScanners(prev => prev.map(s => s.name === name ? { ...s, progress, status } : s));
      };

      const runScannerDemo = async (name: string, profile: string, actionLog: string) => {
        addLog('INFO', `${name} demo stage started...`);
        addLog('INFO', `${name} ${actionLog}`);
        updateScanner(name, 0, 'RUNNING');
        
        const pattern = generatePattern(profile);
        let currentProgress = 0;
        
        for (const step of pattern) {
          await wait(step.delay, runId);
          currentProgress += step.delta;
          if (currentProgress > 100) currentProgress = 100;
          updateScanner(name, currentProgress, currentProgress === 100 ? 'COMPLETED' : 'RUNNING');
        }
        
        addLog('INFO', `${name} demo stage completed.`);
      };

      await runScannerDemo('Semgrep', 'fast-early', 'analyzing synthetic source...');
      await runScannerDemo('Gitleaks', 'steady', 'scanning synthetic secrets surface...');
      await runScannerDemo('Trivy', 'slow-early', 'evaluating synthetic dependencies...');
      await runScannerDemo('Nuclei', 'plateau', 'executing synthetic templates...');
      await runScannerDemo('ZAP', 'slow', 'performing synthetic dynamic testing...');
      await runScannerDemo('Schemathesis', 'steady', 'fuzzing synthetic API endpoints...');
      await runScannerDemo('Playwright', 'fast-early', 'testing synthetic client flows...');
      
      addLog('INFO', 'Security scanning completed.');
      addLog('INFO', 'Correlating assessment observations...');
      setAssessmentStages(prev => ({...prev, 'Security Scanning': 'COMPLETED', 'Analysis': 'RUNNING'}));
      
      await wait(2000 * DEMO_SPEED_MULTIPLIER, runId);
      addLog('INFO', 'Correlation completed.');
      addLog('INFO', 'Risk classification completed.');
      
      setAssessmentStages(prev => ({...prev, 'Analysis': 'COMPLETED', 'Verification': 'RUNNING'}));
      addLog('INFO', 'Beginning verification phase...');
      addLog('INFO', 'Reviewing synthetic security observations...');
      
      await wait(2500 * DEMO_SPEED_MULTIPLIER, runId);
      addLog('INFO', 'Verification completed.');
      
      setAssessmentStages(prev => ({...prev, 'Verification': 'COMPLETED', 'Report': 'READY'}));
      addLog('INFO', 'Assessment results finalized.');
      addLog('INFO', 'Findings are now available.');
      
      setAssessmentStatus('completed');
      
    } catch (error: any) {
      if (error.message === 'CANCELLED') {
        console.log('[AEGIS] Assessment run cancelled.');
        return; // exit silently if cancelled by reset
      }
      
      console.error('[AEGIS] Assessment failed', error);
      setAssessmentStatus('failed');
      addLog('ERROR', `Demo assessment failed: ${error.message}`);
      setToast({ message: 'Demo assessment failed to complete.', type: 'warning' });
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#dashboard/')) {
        setActiveTab(hash.split('/')[1]);
      } else if (hash === '#dashboard') {
        setActiveTab('overview');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      if (generatingRef.current) clearTimeout(generatingRef.current);
    };
  }, []);

  const changeTab = (tab: string) => {
    window.location.hash = `#dashboard/${tab}`;
    setActiveTab(tab);
  };

  // Fetch target status
  useEffect(() => {
    const checkTarget = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/target-status');
        const data = await res.json();
        if (data.targetBaseUrl) setTargetBaseUrl(data.targetBaseUrl);
      } catch (e) {
        // ignore
      }
    };
    checkTarget();
    const interval = setInterval(checkTarget, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch findings
  const fetchFindings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/findings');
      const data = await res.json();
      setFindings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (assessmentStatus === 'completed') {
      fetchFindings();
    } else {
      setFindings([]);
    }
  }, [assessmentStatus]);

  const runPoc = async (id: string) => {
    setIsRunningPoc(true);
    setToast(null);
    try {
      const res = await fetch(`http://localhost:4000/api/findings/${id}/run-poc`, {
        method: 'POST'
      });
      const updatedFinding = await res.json();
      
      setFindings(prev => prev.map(f => f.id === id ? updatedFinding : f));
      setSelectedFinding(updatedFinding);
      
      if (updatedFinding.lastPocSuccess) {
        setToast({ message: `PoC Succeeded! Evidence collected.`, type: 'success' });
      } else {
        setToast({ message: 'PoC Did Not Trigger (Auth Gate Enforced or Target Down)', type: 'warning' });
      }
    } catch (e) {
      setToast({ message: 'Error running PoC', type: 'warning' });
    } finally {
      setIsRunningPoc(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  const exportReport = () => {
    if (isGeneratingReport) return;
    setIsGeneratingReport(true);
    changeTab('reports');
    
    if (generatingRef.current) clearTimeout(generatingRef.current);
    generatingRef.current = setTimeout(() => {
      setIsGeneratingReport(false);
      generatingRef.current = null;
    }, 1500);
  };

  const severityCounts = {
    Critical: findings.filter(f => f.severity === 'Critical').length,
    High: findings.filter(f => f.severity === 'High').length,
    Medium: findings.filter(f => f.severity === 'Medium').length,
    Low: findings.filter(f => f.severity === 'Low').length,
  };

  const totalFindings = findings.length;
  
  // Group by category for domain chart
  const categories = findings.reduce((acc, f) => {
    acc[f.category] = (acc[f.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background text-textMain font-sans selection:bg-primary selection:text-white flex flex-col">
      {/* Top Header */}
      <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center space-x-4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-background rounded-md transition-colors text-textMuted hover:text-textMain">
            <Menu className="w-5 h-5" />
          </button>
          <div className="bg-primary/10 p-2 rounded border border-primary/20">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <span className="font-extrabold tracking-tight text-textMain text-xl uppercase">World Monitor Security Assessment</span>
        </div>
        
        <div className="flex items-center space-x-6">
          <button 
            onClick={exportReport}
            disabled={isGeneratingReport}
            className={`flex items-center space-x-2 px-3 py-1.5 ${isGeneratingReport ? 'bg-background text-textMuted cursor-not-allowed opacity-75' : 'bg-background hover:bg-[#E2E8F0] text-textMain'} border border-border rounded text-xs font-medium transition-colors`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Generate Report</span>
          </button>
          <Bell className="w-4 h-4 text-textMuted hover:text-textMain cursor-pointer transition-colors" />
          <User className="w-4 h-4 text-textMuted hover:text-textMain cursor-pointer transition-colors" />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className={`${isSidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 ease-in-out bg-surface border-r border-border flex flex-col py-6 shrink-0 z-0 overflow-hidden`}>
          <nav className="space-y-1 px-2">
            <NavItem icon={<LayoutDashboard className="w-4 h-4" />} label="Overview" active={activeTab === 'overview'} onClick={() => changeTab('overview')} isSidebarOpen={isSidebarOpen} />
            <NavItem icon={<Target className="w-4 h-4" />} label="Attack Surface" active={activeTab === 'surface'} onClick={() => changeTab('surface')} isSidebarOpen={isSidebarOpen} />
            <NavItem icon={<ClipboardList className="w-4 h-4" />} label="Assessments" active={activeTab === 'assessments'} onClick={() => changeTab('assessments')} isSidebarOpen={isSidebarOpen} />
            <NavItem icon={<AlertTriangle className="w-4 h-4" />} label="Findings" active={activeTab === 'findings'} onClick={() => changeTab('findings')} isSidebarOpen={isSidebarOpen} />
            <NavItem icon={<Terminal className="w-4 h-4" />} label="Evidence" active={activeTab === 'evidence'} onClick={() => changeTab('evidence')} isSidebarOpen={isSidebarOpen} />
            <NavItem icon={<FileText className="w-4 h-4" />} label="Reports" active={activeTab === 'reports'} onClick={() => changeTab('reports')} isSidebarOpen={isSidebarOpen} />
            <NavItem icon={<BookOpen className="w-4 h-4" />} label="Methodology" active={activeTab === 'methodology'} onClick={() => changeTab('methodology')} isSidebarOpen={isSidebarOpen} />
          </nav>
          <div className="mt-auto px-2">
            <NavItem icon={<Settings className="w-4 h-4" />} label="Settings" active={activeTab === 'settings'} onClick={() => changeTab('settings')} isSidebarOpen={isSidebarOpen} />
          </div>
        </aside>

        {/* Primary View */}
        <main className="flex-1 overflow-y-auto p-4 bg-background">
          {activeTab === 'findings' ? (
            !demoAssessmentStarted ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <ShieldAlert className="w-16 h-16 text-textMuted mb-4" />
                <h2 className="text-xl font-bold text-textMain mb-2">Assessment not started</h2>
                <p className="text-textMuted mb-6">Start the demo assessment to begin vulnerability validation.</p>
                <button onClick={() => changeTab('overview')} className="px-6 py-2 bg-primary text-white font-bold rounded">Go to Overview</button>
              </div>
            ) : assessmentStatus === 'running' ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
                <h2 className="text-xl font-bold text-textMain mb-2">Assessment in progress</h2>
                <p className="text-textMuted mb-6">Findings will appear when scanning and verification are complete.</p>
              </div>
            ) : (
            <FindingsView 
              findings={findings}
              selectedFinding={selectedFinding}
              setSelectedFinding={setSelectedFinding}
              runPoc={runPoc}
              isRunningPoc={isRunningPoc}
              targetBaseUrl={targetBaseUrl}
            />
            )
          ) : activeTab === 'surface' ? (
            <AttackSurfaceView />
          ) : activeTab === 'reports' ? (
            !demoAssessmentStarted ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <FileText className="w-16 h-16 text-textMuted mb-4" />
                <h2 className="text-xl font-bold text-textMain mb-2">Assessment Not Started</h2>
                <p className="text-textMuted mb-6">Start the demo assessment to generate assessment findings and report.</p>
              </div>
            ) : assessmentStatus === 'running' ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
                <h2 className="text-xl font-bold text-textMain mb-2">Assessment in progress</h2>
                <p className="text-textMuted mb-6">Report generation will be available when scanning is complete.</p>
              </div>
            ) : (
            <ReportView isGeneratingReport={isGeneratingReport} />
            )
          ) : activeTab === 'evidence' ? (
            !demoAssessmentStarted ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <Terminal className="w-16 h-16 text-textMuted mb-4" />
                <h2 className="text-xl font-bold text-textMain mb-2">No evidence collected yet</h2>
                <p className="text-textMuted mb-6">Start the demo assessment and run PoCs to generate evidence.</p>
              </div>
            ) : assessmentStatus === 'running' ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
                <h2 className="text-xl font-bold text-textMain mb-2">Assessment in progress</h2>
                <p className="text-textMuted mb-6">Run PoCs on discovered findings to generate evidence.</p>
              </div>
            ) : (
            <EvidenceView />
            )
          ) : activeTab === 'assessments' ? (
            <AssessmentsView onAssessmentCreated={(id) => { 
                setDemoAssessmentStarted(true); 
                changeTab('overview'); 
                startDemoAssessment(); 
            }} />
          ) : activeTab === 'methodology' ? (
            <MethodologyView />
          ) : (
          
          <div className="max-w-screen-2xl mx-auto space-y-6">
            <div className="bg-surface border border-border rounded p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-textMuted pb-6 flex items-center">Assessment Progress</h2>
              <div className="flex items-center justify-between relative overflow-x-auto pb-2">
                <div className="absolute left-[5%] right-[5%] top-4 h-0.5 bg-background -z-0 min-w-[600px]"></div>
                {Object.entries(assessmentStages).map(([stage, status], idx, arr) => (
                  <div key={stage} className="relative z-10 flex flex-col items-center flex-1 min-w-[100px]">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-surface transition-colors ${
                      status === 'COMPLETED' || status === 'READY' ? 'border-green-500 text-green-500' : 
                      status === 'RUNNING' ? 'border-primary text-primary bg-primary/10' : 
                      'border-border text-textMuted'
                    }`}>
                      {status === 'COMPLETED' || status === 'READY' ? <CheckCircle2 className="w-5 h-5" /> : status === 'RUNNING' ? <Loader2 className="w-5 h-5 animate-spin" /> : <div className="w-2 h-2 rounded-full bg-border"></div>}
                    </div>
                    <span className={`mt-3 text-xs font-bold uppercase tracking-wider ${
                      status === 'COMPLETED' || status === 'READY' ? 'text-textMain' : 
                      status === 'RUNNING' ? 'text-primary' : 
                      'text-textMuted'
                    }`}>{stage}</span>
                    <span className="text-[9px] text-textMuted mt-0.5">{status}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="space-y-6">
                <div className="bg-surface border border-border rounded p-5 flex flex-col">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-textMuted pb-4 flex items-center">Assessment Overview</h2>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <div className="relative flex items-center justify-center">
                      <DonutChart critical={severityCounts.Critical} high={severityCounts.High} medium={severityCounts.Medium} low={severityCounts.Low} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-textMain leading-none">{totalFindings}</span>
                        <span className="text-[9px] text-textMuted uppercase tracking-wider">Findings</span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <LegendItem label="Critical" count={severityCounts.Critical} color="bg-[#B91C1C]" />
                      <LegendItem label="High" count={severityCounts.High} color="bg-[#B45309]" />
                      <LegendItem label="Medium" count={severityCounts.Medium} color="bg-[#D97706]" />
                      <LegendItem label="Low" count={severityCounts.Low} color="bg-[#3B82F6]" />
                    </div>
                  </div>
                </div>

                <div className="bg-surface border border-border rounded p-5 space-y-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-textMuted flex items-center">Target Information</h2>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-background rounded border border-border">
                        <Link className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-textMain">World Monitor</div>
                        <div className="text-xs font-mono text-primary bg-primary/10 px-1.5 py-0.5 inline-block rounded border border-primary/20">{targetBaseUrl || 'http://localhost:3000'}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-y-3 text-xs pt-2">
                      <div className="flex flex-col"><span className="text-textMuted text-[10px] uppercase">Branch</span><span className="font-mono text-textMain">main</span></div>
                      <div className="flex flex-col"><span className="text-textMuted text-[10px] uppercase">Commit</span><span className="font-mono text-textMain">a1b2c3d</span></div>
                      <div className="col-span-2 flex flex-col"><span className="text-textMuted text-[10px] uppercase">Assessment Type</span><span className="text-textMain font-medium">Synthetic Security Lab / Demo</span></div>
                      <div className="flex flex-col"><span className="text-textMuted text-[10px] uppercase">Status</span>
                        <span className="text-textMain font-medium">{assessmentStatus === 'running' ? 'In Progress' : (assessmentStartedAt ? 'Completed' : 'Pending')}</span>
                      </div>
                      <div className="flex flex-col"><span className="text-textMuted text-[10px] uppercase">Started At</span>
                        <span className="text-textMain font-medium">{assessmentStartedAt ? new Date(assessmentStartedAt).toLocaleTimeString() : 'Not Started'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-3">
                  <button 
                    onClick={startDemoAssessment}
                    disabled={assessmentStatus === 'running' || assessmentStatus === 'completed'}
                    className={`w-full py-3 rounded font-bold text-sm tracking-wider uppercase transition-colors flex justify-center items-center ${assessmentStatus === 'running' || assessmentStatus === 'completed' ? 'bg-primary/50 text-white/50 cursor-not-allowed' : 'bg-primary hover:bg-blue-600 text-white'}`}
                  >
                    {assessmentStatus === 'running' ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running...</> : 
                     assessmentStatus === 'completed' ? <><CheckCircle2 className="w-4 h-4 mr-2" /> Assessment Complete</> : 
                     assessmentStatus === 'failed' ? <><Play className="w-4 h-4 mr-2" /> Retry Assessment</> : 
                     <><Play className="w-4 h-4 mr-2" /> Start Demo Assessment</>}
                  </button>
                  <button 
                    disabled={assessmentStatus !== 'completed'}
                    className={`w-full py-3 rounded font-bold text-sm tracking-wider uppercase transition-colors flex justify-center items-center border ${assessmentStatus !== 'completed' ? 'border-border text-textMuted cursor-not-allowed' : 'border-primary text-primary hover:bg-primary/10'}`}
                  >
                    {assessmentStatus !== 'completed' ? 'Complete Assessment First' : 'Run All Demo PoCs'}
                  </button>
                  {demoAssessmentStarted && (
                    <button 
                      onClick={resetDemo}
                      className={`w-full py-2 rounded font-bold text-xs tracking-wider uppercase transition-colors flex justify-center items-center border border-red-500/30 text-red-500 hover:bg-red-500/10`}
                    >
                      Reset Demo
                    </button>
                  )}
                </div>
              </div>

              <div className="lg:col-span-3 space-y-6">
                <div className="bg-surface border border-border rounded p-5">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-textMuted pb-4 flex items-center">DEMO SECURITY PIPELINE</h2>
                  <div className="space-y-4">
                    {scanners.map((s, idx) => (
                      <div key={idx} className="flex flex-col space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center space-x-2">
                            {s.status === 'COMPLETED' ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : s.status === 'RUNNING' ? <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" /> : <MinusCircle className="w-3.5 h-3.5 text-textMuted" />}
                            <span className="font-semibold text-textMain">{s.name}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`text-[10px] font-bold tracking-wider ${s.status === 'COMPLETED' ? 'text-green-500' : s.status === 'RUNNING' ? 'text-primary' : 'text-textMuted'}`}>{s.status}</span>
                            <span className="text-textMuted font-mono w-8 text-right">{s.progress}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-background h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-200 ease-out ${s.status === 'COMPLETED' ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${s.progress}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <LiveOutputPanel logs={assessmentLogs} findings={findings} setActiveTab={setActiveTab} setSelectedFinding={setSelectedFinding} />

          </div>

          )}
        </main>
      </div>



      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded  border flex items-center space-x-3 animate-in slide-in-from-bottom-4 z-50 ${
          toast.type === 'success' 
            ? 'bg-background border-[#15803D]/30 text-textMain' 
            : 'bg-background border-[#B45309]/30 text-textMain'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-[#15803D]" /> : <AlertTriangle className="w-4 h-4 text-[#B45309]" />}
          <span className="font-medium text-xs uppercase tracking-wider">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

// Subcomponents

function NavItem({ icon, label, active, onClick, isSidebarOpen }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void, isSidebarOpen?: boolean }) {
  const isSpecial = label === 'Reports';
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center p-2 rounded text-xs font-semibold tracking-wide transition-all duration-300 ${
        active 
          ? 'bg-primary/10 text-primary border-l-2 border-primary shadow-sm' 
          : isSpecial
            ? 'bg-gradient-to-r from-amber-500/10 to-transparent text-amber-600 border-l-2 border-amber-500/40 hover:from-amber-500/20 hover:border-amber-500/60'
            : 'text-textMuted hover:bg-background hover:text-textMain border-l-2 border-transparent'
      }`}
      title={!isSidebarOpen ? label : undefined}
    >
      <div className={`shrink-0 flex items-center justify-center w-6 h-6 ${isSpecial && !active ? 'text-amber-500 animate-pulse' : ''}`}>{icon}</div>
      <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-3 opacity-100 max-w-[200px]' : 'ml-0 opacity-0 max-w-0'}`}>
        {label}
      </span>
    </button>
  );
}

function KPICard({ label, count, trend }: { label: string, count: number, trend: string }) {
  return (
    <div className="bg-surface border border-border rounded p-4 flex flex-col justify-between">
      <span className="text-textMuted font-medium text-[11px] uppercase tracking-wider pb-2">{label}</span>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-textMain leading-none">{count}</span>
        <span className="text-[10px] text-textMuted flex items-center">
          {trend !== '0' && <TrendingUp className="w-3 h-3 mr-0.5" />}
          {trend}
        </span>
      </div>
    </div>
  );
}

function SeverityText({ severity }: { severity: string }) {
  let colorClass = '';
  switch (severity?.toLowerCase()) {
    case 'critical': colorClass = 'text-[#B91C1C]'; break;
    case 'high': colorClass = 'text-[#B45309]'; break;
    case 'medium': colorClass = 'text-[#B45309]'; break;
    case 'low': colorClass = 'text-primary'; break;
    default: colorClass = 'text-textMuted'; break;
  }
  
  return (
    <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center ${colorClass}`}>
      <span className="w-1.5 h-1.5 rounded mr-2 bg-current" aria-hidden="true"></span>
      {severity}
    </span>
  );
}

function ValidationStatus({ success }: { success?: boolean }) {
  if (success === true) return <span className="text-[#15803D] flex items-center text-[11px] font-bold uppercase tracking-wider"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Validated</span>;
  if (success === false) return <span className="text-[#B91C1C] flex items-center text-[11px] font-bold uppercase tracking-wider"><XCircle className="w-3.5 h-3.5 mr-1" /> Failed</span>;
  return <span className="text-textMuted flex items-center text-[11px] font-bold uppercase tracking-wider"><MinusCircle className="w-3.5 h-3.5 mr-1" /> Pending</span>;
}

function SurfaceStat({ icon, label, value, onClick }: { icon: React.ReactNode, label: string, value: string, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`bg-background/50 border border-border rounded p-3 flex items-center space-x-3 ${onClick ? 'cursor-pointer hover:bg-surface transition-colors' : ''}`}
    >
      <div className="text-primary shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-textMain truncate">{value}</div>
        <div className="text-[9px] text-textMuted uppercase tracking-wider truncate" title={label}>{label}</div>
      </div>
    </div>
  );
}

function PipelineStep({ label, status, count, duration }: { label: string, status: 'done' | 'active' | 'pending', count: number, duration?: string }) {
  let icon = <CheckCircle2 className="w-3 h-3 text-textMuted" />;
  if (status === 'active') icon = <Loader2 className="w-3 h-3 text-primary animate-spin" />;
  if (status === 'done' && count > 0) icon = <AlertTriangle className="w-3 h-3 text-[#B45309]" />;
  if (status === 'done' && count === 0) icon = <CheckCircle2 className="w-3 h-3 text-[#15803D]" />;

  return (
    <div className="flex flex-col items-center flex-shrink-0 w-16">
      <div className={`w-8 h-8 rounded flex items-center justify-center border ${
        status === 'active' ? 'border-[#1D4ED8] bg-primary/10' :
        status === 'done' ? 'border-border bg-background' : 'border-dashed border-border bg-transparent'
      }`}>
        {icon}
      </div>
      <span className={`text-[9px] font-semibold uppercase tracking-wider mt-2 text-center ${status === 'pending' ? 'text-textMuted' : 'text-textMuted'}`}>{label}</span>
      {duration && <span className="text-[9px] text-textMuted">{duration}</span>}
    </div>
  );
}

function ActivityItem({ time, action, detail }: { time: string, action: string, detail: string }) {
  return (
    <div className="relative md:pl-8">
      <span className="absolute left-0 -ml-1.5 md:ml-0 md:left-1.5 top-1 h-3 w-3 rounded border-2 border-[#111827] bg-primary"></span>
      <div className="flex flex-col mb-1 ml-4 md:ml-0">
        <span className="text-xs font-semibold text-textMain">{action}</span>
        <span className="text-[10px] text-textMuted">{detail}</span>
      </div>
      <span className="text-[10px] text-textMuted ml-4 md:ml-0">{time}</span>
    </div>
  );
}

function BarChartIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}


const DonutChart = ({ critical, high, medium, low }: any) => {
  const total = critical + high + medium + low || 1;
  let currentOffset = 0;
  const segments = [
    { value: critical, color: '#B91C1C' },
    { value: high, color: '#B45309' },
    { value: medium, color: '#D97706' },
    { value: low, color: '#3B82F6' },
  ];
  return (
    <svg viewBox="0 0 36 36" className="w-24 h-24">
      <circle
        r="15.91549430918954"
        cx="18" cy="18"
        fill="transparent"
        stroke="#1f2937"
        strokeWidth="3"
      />
      {segments.map((s, i) => {
        if (s.value === 0) return null;
        const percentage = (s.value / total) * 100;
        const strokeDasharray = `${percentage} ${100 - percentage}`;
        const strokeDashoffset = -currentOffset;
        currentOffset += percentage;
        return (
          <circle
            key={i}
            r="15.91549430918954"
            cx="18" cy="18"
            fill="transparent"
            stroke={s.color}
            strokeWidth="3"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 18 18)"
          />
        );
      })}
    </svg>
  );
};

const LegendItem = ({ label, count, color }: any) => (
  <div className="flex items-center space-x-2 text-xs">
    <div className={`w-2 h-2 rounded-full ${color}`}></div>
    <span className="text-textMuted uppercase tracking-wider w-16">{label}</span>
    <span className="font-bold text-textMain">{count}</span>
  </div>
);

const LiveOutputPanel = ({ logs, findings, setActiveTab, setSelectedFinding }: any) => {
  const [tab, setTab] = useState<'Logs' | 'Findings' | 'Evidence'>('Logs');
  
  return (
    <div className="bg-surface border border-border rounded flex flex-col h-96 mt-6">
      <div className="px-5 py-3 border-b border-border flex justify-between items-center bg-background/50">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-textMuted flex items-center"><Terminal className="w-4 h-4 mr-2"/> Live Output</h2>
        <div className="flex items-center space-x-2 text-[10px] font-bold text-red-500 uppercase tracking-widest animate-pulse">
           <div className="w-2 h-2 rounded-full bg-red-500"></div>
           <span>Live</span>
        </div>
      </div>
      <div className="flex border-b border-border text-xs uppercase tracking-wider font-semibold text-textMuted">
        <button onClick={() => setTab('Logs')} className={`px-5 py-2.5 border-b-2 transition-colors ${tab === 'Logs' ? 'border-primary text-primary bg-primary/5' : 'border-transparent hover:text-textMain'}`}>Logs</button>
        <button onClick={() => setTab('Findings')} className={`px-5 py-2.5 border-b-2 transition-colors ${tab === 'Findings' ? 'border-primary text-primary bg-primary/5' : 'border-transparent hover:text-textMain'}`}>Findings ({findings.length})</button>
        <button onClick={() => setTab('Evidence')} className={`px-5 py-2.5 border-b-2 transition-colors ${tab === 'Evidence' ? 'border-primary text-primary bg-primary/5' : 'border-transparent hover:text-textMain'}`}>Evidence</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-[#0a0a0a] font-mono text-xs">
         {tab === 'Logs' && (
           <div className="space-y-1">
             {logs.length === 0 && <div className="text-textMuted italic">Waiting for assessment to start...</div>}
             {logs.map((log: any, i: number) => (
               <div key={i} className="flex space-x-3">
                 <span className="text-textMuted shrink-0">[{log.timestamp.split('T')[1].substring(0,8)}]</span>
                 <span className={`shrink-0 w-12 ${log.level === 'INFO' ? 'text-blue-400' : log.level === 'WARN' ? 'text-yellow-400' : 'text-red-400'}`}>[{log.level}]</span>
                 <span className="text-gray-300">{log.message}</span>
               </div>
             ))}
           </div>
         )}
         {tab === 'Findings' && (
           <table className="w-full text-left text-xs whitespace-nowrap">
             <thead className="text-textMuted border-b border-gray-800">
               <tr>
                 <th className="py-2 px-2">Finding ID</th>
                 <th className="px-2">Title</th>
                 <th className="px-2">Severity</th>
                 <th className="px-2">CWE</th>
                 <th className="px-2">CVSS</th>
                 <th className="px-2">Status</th>
               </tr>
             </thead>
             <tbody>
               {findings.map((f: any) => (
                 <tr key={f.id} onClick={() => { setSelectedFinding(f); setActiveTab('findings'); }} className="cursor-pointer hover:bg-gray-800/50 transition-colors border-b border-gray-900 group">
                   <td className="py-2 px-2 text-primary">{f.id}</td>
                   <td className="px-2 text-gray-300 group-hover:text-white truncate max-w-xs">{f.title}</td>
                   <td className="px-2"><SeverityText severity={f.severity} /></td>
                   <td className="px-2 text-gray-500">{f.cwe || '-'}</td>
                   <td className="px-2 text-gray-500">{f.cvssScore?.toFixed(1) || '-'}</td>
                   <td className="px-2"><ValidationStatus success={f.lastPocSuccess} /></td>
                 </tr>
               ))}
             </tbody>
           </table>
         )}
         {tab === 'Evidence' && (
           <div className="space-y-6">
             {findings.filter((f: any) => f.lastPocRunAt).length === 0 && <div className="text-textMuted italic">No evidence generated yet.</div>}
             {findings.filter((f: any) => f.lastPocRunAt).map((f: any) => (
               <div key={f.id} className="border border-gray-800 rounded p-3 bg-black">
                 <div className="flex justify-between items-center mb-2 border-b border-gray-800 pb-2">
                   <div className="text-primary font-bold">{f.id}</div>
                   <div className={`px-2 py-0.5 text-[10px] font-bold rounded ${f.lastPocSuccess ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                     PoC: {f.lastPocSuccess ? 'SUCCESS' : 'FAILED'}
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 text-gray-400">
                   <div>
                     <span className="text-gray-500">Timestamp: </span> {new Date(f.lastPocRunAt!).toLocaleString()}
                   </div>
                   <div>
                     <span className="text-gray-500">Target: </span> http://localhost:3000
                   </div>
                   <div className="col-span-2">
                     <span className="text-gray-500 block mb-1">Request/Response Evidence:</span>
                     <div className="bg-gray-900 p-2 rounded whitespace-pre-wrap font-mono text-[10px] text-gray-300">
                       {f.pocEvidence || 'No payload details available.'}
                     </div>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         )}
      </div>
    </div>
  );
};
