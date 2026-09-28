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
  Menu
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
    return () => window.removeEventListener('hashchange', handleHashChange);
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
    fetchFindings();
  }, []);

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
    window.location.assign('http://localhost:4000/api/report');
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
            className="flex items-center space-x-2 px-3 py-1.5 bg-background hover:bg-[#E2E8F0] text-textMain border border-border rounded text-xs font-medium transition-colors"
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
            <FindingsView 
              findings={findings}
              selectedFinding={selectedFinding}
              setSelectedFinding={setSelectedFinding}
              runPoc={runPoc}
              isRunningPoc={isRunningPoc}
              targetBaseUrl={targetBaseUrl}
            />
          ) : activeTab === 'surface' ? (
            <AttackSurfaceView />
          ) : activeTab === 'reports' ? (
            <ReportView />
          ) : activeTab === 'evidence' ? (
            <EvidenceView />
          ) : activeTab === 'assessments' ? (
            <AssessmentsView />
          ) : activeTab === 'methodology' ? (
            <MethodologyView />
          ) : (
          <div className="max-w-screen-2xl mx-auto space-y-6">
            
            {/* Meta Header */}
            <div className="bg-surface border border-border rounded p-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-3 pb-2">
                   <span className="text-xl font-bold tracking-tight text-textMain">Assessment Overview</span>
                  <div className="px-2 py-0.5 bg-background border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded">
                    LOCAL TEST ENVIRONMENT
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-2 text-xs">
                  <div className="flex flex-col"><span className="text-textMuted font-medium uppercase tracking-wider mb-0.5">Target</span><span className="font-mono text-textMain">{targetBaseUrl || 'worldmonitor.local'}</span></div>
                  <div className="flex flex-col"><span className="text-textMuted font-medium uppercase tracking-wider mb-0.5">Assessment ID</span><span className="font-mono text-textMain">WM-SA-2026-09</span></div>
                  <div className="flex flex-col"><span className="text-textMuted font-medium uppercase tracking-wider mb-0.5">Commit SHA</span><span className="font-mono text-textMain">a1b2c3d</span></div>
                  <div className="flex flex-col"><span className="text-textMuted font-medium uppercase tracking-wider mb-0.5">Environment</span><span className="text-textMain">Local / Sandbox</span></div>
                  <div className="flex flex-col"><span className="text-textMuted font-medium uppercase tracking-wider mb-0.5">Last Scan</span><span className="text-textMain">{new Date().toISOString().split('T')[0]} 00:00 UTC</span></div>
                  <div className="flex flex-col"><span className="text-textMuted font-medium uppercase tracking-wider mb-0.5">Status</span>
                    <span className="flex items-center text-[#15803D] font-medium"><Radio className="w-3 h-3 mr-1" /> Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TOP KPI ROW */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <KPICard label="Total Findings" count={totalFindings} trend="+2" />
              <KPICard label="Critical" count={severityCounts.Critical} trend="0" />
              <KPICard label="High" count={severityCounts.High} trend="+1" />
              <KPICard label="Medium" count={severityCounts.Medium} trend="+1" />
              <KPICard label="Low" count={severityCounts.Low} trend="0" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* Left Column (2/3 width on LG) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* SCAN PIPELINE */}
                <div className="bg-surface border border-border rounded p-5">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-textMuted pb-4 flex items-center"><Activity className="w-4 h-4 mr-2"/> Scan Pipeline Execution</h2>
                  <div className="flex items-start justify-between w-full overflow-x-auto custom-scrollbar pb-2">
                    <PipelineStep label="Scope" status="done" count={0} duration="2s" />
                    <ChevronRight className="w-4 h-4 text-textMuted mt-3 shrink-0" />
                    <PipelineStep label="Recon" status="done" count={0} duration="14s" />
                    <ChevronRight className="w-4 h-4 text-textMuted mt-3 shrink-0" />
                    <PipelineStep label="SAST" status="done" count={0} duration="45s" />
                    <ChevronRight className="w-4 h-4 text-textMuted mt-3 shrink-0" />
                    <PipelineStep label="Secrets" status="done" count={0} duration="11s" />
                    <ChevronRight className="w-4 h-4 text-textMuted mt-3 shrink-0" />
                    <PipelineStep label="Deps" status="done" count={1} duration="8s" />
                    <ChevronRight className="w-4 h-4 text-textMuted mt-3 shrink-0" />
                    <PipelineStep label="DAST" status="active" count={0} duration="running" />
                    <ChevronRight className="w-4 h-4 text-textMuted mt-3 shrink-0" />
                    <PipelineStep label="API Sec" status="done" count={1} duration="32s" />
                    <ChevronRight className="w-4 h-4 text-textMuted mt-3 shrink-0" />
                    <PipelineStep label="Correlation" status="pending" count={0} />
                    <ChevronRight className="w-4 h-4 text-textMuted mt-3 shrink-0" />
                    <PipelineStep label="Risk" status="pending" count={0} />
                    <ChevronRight className="w-4 h-4 text-textMuted mt-3 shrink-0" />
                    <PipelineStep label="Report" status="pending" count={0} />
                  </div>
                </div>

                {/* FINDINGS TABLE */}
                <div className="bg-surface border border-border rounded overflow-hidden flex flex-col">
                  <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-textMuted flex items-center"><ShieldAlert className="w-4 h-4 mr-2"/> Vulnerability Findings</h2>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-textMuted" />
                      <input 
                        type="text" 
                        placeholder="Filter..." 
                        className="bg-background border border-border text-xs rounded pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#1D4ED8] text-textMain w-48 transition-colors"
                      />
                    </div>
                  </div>
                  
                  {isLoading ? (
                    <div className="p-4 space-y-4">
                      {[1, 2].map(i => (
                        <div key={i} className="h-10 bg-background rounded animate-pulse w-full"></div>
                      ))}
                    </div>
                  ) : findings.length === 0 ? (
                    <div className="p-12 text-center">
                      <ShieldCheck className="w-10 h-10 text-textMuted mx-auto mb-3" />
                      <p className="text-textMuted text-sm">No findings mapped to current scope.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="bg-background/30 text-textMuted">
                          <tr>
                            <th className="px-5 py-2.5 font-medium border-b border-border">Severity</th>
                            <th className="px-5 py-2.5 font-medium border-b border-border w-full">Finding</th>
                            <th className="px-5 py-2.5 font-medium border-b border-border">Component</th>
                            <th className="px-5 py-2.5 font-medium border-b border-border">CWE</th>
                            <th className="px-5 py-2.5 font-medium border-b border-border">CVSS</th>
                            <th className="px-5 py-2.5 font-medium border-b border-border">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                          {findings.map(finding => (
                            <tr 
                              key={finding.id} 
                              onClick={() => {
                                setSelectedFinding(finding);
                                setActiveTab('findings');
                              }}
                              className="hover:bg-background cursor-pointer transition-colors group"
                            >
                              <td className="px-5 py-3">
                                <SeverityText severity={finding.severity} />
                              </td>
                              <td className="px-5 py-3 font-medium text-textMain truncate max-w-[280px]" title={finding.title}>{finding.title}</td>
                              <td className="px-5 py-3 font-mono text-textMuted">{finding.affectedComponent || '-'}</td>
                              <td className="px-5 py-3 text-textMuted">{finding.cwe || '-'}</td>
                              <td className="px-5 py-3 text-textMuted">{finding.cvssScore?.toFixed(1) || '-'}</td>
                              <td className="px-5 py-3">
                                <ValidationStatus success={finding.lastPocSuccess} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column (1/3 width on LG) */}
              <div className="space-y-6 flex flex-col">
                
                {/* ATTACK SURFACE SECTION */}
                <div className="bg-surface border border-border rounded p-5">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-textMuted pb-4 flex items-center"><Server className="w-4 h-4 mr-2"/> Attack Surface</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <SurfaceStat icon={<Server className="w-4 h-4" />} label="Endpoints" value="Mapped" onClick={() => changeTab('surface')} />
                    <SurfaceStat icon={<Code className="w-4 h-4" />} label="API Routes" value="Active" onClick={() => changeTab('surface')} />
                    <SurfaceStat icon={<Box className="w-4 h-4" />} label="Client Modules" value="Tracked" onClick={() => changeTab('surface')} />
                    <SurfaceStat icon={<Link className="w-4 h-4" />} label="Integrations" value="Configured" onClick={() => changeTab('surface')} />
                    <SurfaceStat icon={<Shield className="w-4 h-4" />} label="Trust Boundaries" value="Mapped" onClick={() => changeTab('surface')} />
                    <SurfaceStat icon={<Lock className="w-4 h-4" />} label="Auth Policies" value="Detected" onClick={() => changeTab('surface')} />
                  </div>
                </div>

                {/* RISK OVERVIEW */}
                <div className="bg-surface border border-border rounded p-5">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-textMuted pb-4 flex items-center"><BarChartIcon className="w-4 h-4 mr-2"/> Risk Overview</h2>
                  
                  <div className="space-y-4 pb-6">
                    <h3 className="text-xs font-medium text-textMuted">Severity Distribution</h3>
                    <div className="flex h-2 w-full rounded overflow-hidden bg-background">
                      <div className="bg-[#B91C1C]" style={{width: `${(severityCounts.Critical / Math.max(1, totalFindings)) * 100}%`}}></div>
                      <div className="bg-[#B45309]" style={{width: `${(severityCounts.High / Math.max(1, totalFindings)) * 100}%`}}></div>
                      <div className="bg-[#B45309]" style={{width: `${(severityCounts.Medium / Math.max(1, totalFindings)) * 100}%`}}></div>
                      <div className="bg-primary" style={{width: `${(severityCounts.Low / Math.max(1, totalFindings)) * 100}%`}}></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-textMuted uppercase">
                      <span>C ({severityCounts.Critical})</span>
                      <span>H ({severityCounts.High})</span>
                      <span>M ({severityCounts.Medium})</span>
                      <span>L ({severityCounts.Low})</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-medium text-textMuted">Domain Distribution</h3>
                    {Object.entries(categories).length > 0 ? Object.entries(categories).map(([cat, count]) => (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-[11px] text-textMain capitalize">
                          <span>{cat}</span>
                          <span className="text-textMuted">{count}</span>
                        </div>
                        <div className="w-full bg-background h-1.5 rounded overflow-hidden">
                          <div className="bg-primary h-full" style={{width: `${(count / totalFindings) * 100}%`}}></div>
                        </div>
                      </div>
                    )) : (
                      <span className="text-xs text-textMuted">No data available</span>
                    )}
                  </div>
                </div>

                {/* RECENT ACTIVITY */}
                <div className="bg-surface border border-border rounded p-5 flex-1">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-textMuted pb-4 flex items-center"><Clock className="w-4 h-4 mr-2"/> Recent Activity</h2>
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-background pl-6 md:pl-0">
                    <ActivityItem time="Just now" action="Scan completed" detail="Phase: Target Discovery" />
                    <ActivityItem time="2m ago" action="Finding discovered" detail="WM-API-001 mapped" />
                    <ActivityItem time="4m ago" action="Evidence captured" detail="PoC executed successfully" />
                    <ActivityItem time="1h ago" action="Report generated" detail="System baseline report" />
                  </div>
                </div>

              </div>
            </div>
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
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center p-2 rounded text-xs font-semibold tracking-wide transition-colors ${
        active 
          ? 'bg-background text-textMain' 
          : 'text-textMuted hover:bg-background hover:text-textMain'
      }`}
      title={!isSidebarOpen ? label : undefined}
    >
      <div className="shrink-0 flex items-center justify-center w-6 h-6">{icon}</div>
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
