import React, { useEffect, useState } from 'react';
import FindingsView from './FindingsView';
import AttackSurfaceView from './AttackSurfaceView';
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
  ChevronRight
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
  const [findings, setFindings] = useState<Finding[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [targetBaseUrl, setTargetBaseUrl] = useState<string>('');
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [isRunningPoc, setIsRunningPoc] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

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
    window.open('http://localhost:4000/api/report', '_blank');
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
    <div className="min-h-screen bg-[#F7F8FA] text-[#0F172A] font-sans selection:bg-[#1D4ED8] selection:text-[#FFFFFF] flex flex-col">
      {/* Top Header */}
      <header className="h-16 bg-[#FFFFFF] border-b border-[#E2E8F0] flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center space-x-4">
          <ShieldCheck className="w-5 h-5 text-[#1D4ED8]" />
          <span className="font-semibold tracking-tight text-[#0F172A]">World Monitor Security Assessment</span>
        </div>
        
        <div className="flex items-center space-x-6">
          <button 
            onClick={exportReport}
            className="flex items-center space-x-2 px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] border border-[#E2E8F0] rounded text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Generate Report</span>
          </button>
          <Bell className="w-4 h-4 text-[#64748B] hover:text-[#0F172A] cursor-pointer transition-colors" />
          <User className="w-4 h-4 text-[#64748B] hover:text-[#0F172A] cursor-pointer transition-colors" />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 bg-[#FFFFFF] border-r border-[#E2E8F0] flex flex-col py-6 shrink-0 z-0">
          <nav className="space-y-1 px-3">
            <NavItem icon={<LayoutDashboard className="w-4 h-4" />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <NavItem icon={<Target className="w-4 h-4" />} label="Attack Surface" active={activeTab === 'surface'} onClick={() => setActiveTab('surface')} />
            <NavItem icon={<ClipboardList className="w-4 h-4" />} label="Assessments" active={activeTab === 'assessments'} onClick={() => setActiveTab('assessments')} />
            <NavItem icon={<AlertTriangle className="w-4 h-4" />} label="Findings" active={activeTab === 'findings'} onClick={() => setActiveTab('findings')} />
            <NavItem icon={<Terminal className="w-4 h-4" />} label="Evidence" active={activeTab === 'evidence'} onClick={() => setActiveTab('evidence')} />
            <NavItem icon={<FileText className="w-4 h-4" />} label="Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
            <NavItem icon={<BookOpen className="w-4 h-4" />} label="Methodology" active={activeTab === 'methodology'} onClick={() => setActiveTab('methodology')} />
          </nav>
          <div className="mt-auto px-3">
            <NavItem icon={<Settings className="w-4 h-4" />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          </div>
        </aside>

        {/* Primary View */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#F7F8FA]">
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
          ) : (
          <div className="max-w-screen-2xl mx-auto space-y-6">
            
            {/* Meta Header */}
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-md p-4 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-xl font-bold tracking-tight text-[#0F172A]">Assessment Overview</span>
                  <div className="px-2 py-0.5 bg-[#F1F5F9] border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded">
                    LOCAL TEST ENVIRONMENT
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-2 text-xs">
                  <div className="flex flex-col"><span className="text-[#64748B] font-medium uppercase tracking-wider mb-0.5">Target</span><span className="font-mono text-[#0F172A]">{targetBaseUrl || 'worldmonitor.local'}</span></div>
                  <div className="flex flex-col"><span className="text-[#64748B] font-medium uppercase tracking-wider mb-0.5">Assessment ID</span><span className="font-mono text-[#0F172A]">WM-SA-2026-09</span></div>
                  <div className="flex flex-col"><span className="text-[#64748B] font-medium uppercase tracking-wider mb-0.5">Commit SHA</span><span className="font-mono text-[#0F172A]">a1b2c3d</span></div>
                  <div className="flex flex-col"><span className="text-[#64748B] font-medium uppercase tracking-wider mb-0.5">Environment</span><span className="text-[#0F172A]">Local / Sandbox</span></div>
                  <div className="flex flex-col"><span className="text-[#64748B] font-medium uppercase tracking-wider mb-0.5">Last Scan</span><span className="text-[#0F172A]">{new Date().toISOString().split('T')[0]} 00:00 UTC</span></div>
                  <div className="flex flex-col"><span className="text-[#64748B] font-medium uppercase tracking-wider mb-0.5">Status</span>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column (2/3 width on LG) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* SCAN PIPELINE */}
                <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-md p-5 shadow-sm">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-[#64748B] mb-4 flex items-center"><Activity className="w-4 h-4 mr-2"/> Scan Pipeline Execution</h2>
                  <div className="flex items-start justify-between w-full overflow-x-auto custom-scrollbar pb-2">
                    <PipelineStep label="Scope" status="done" count={0} duration="2s" />
                    <ChevronRight className="w-4 h-4 text-[#64748B] mt-3 shrink-0" />
                    <PipelineStep label="Recon" status="done" count={0} duration="14s" />
                    <ChevronRight className="w-4 h-4 text-[#64748B] mt-3 shrink-0" />
                    <PipelineStep label="SAST" status="done" count={0} duration="45s" />
                    <ChevronRight className="w-4 h-4 text-[#64748B] mt-3 shrink-0" />
                    <PipelineStep label="Secrets" status="done" count={0} duration="11s" />
                    <ChevronRight className="w-4 h-4 text-[#64748B] mt-3 shrink-0" />
                    <PipelineStep label="Deps" status="done" count={1} duration="8s" />
                    <ChevronRight className="w-4 h-4 text-[#64748B] mt-3 shrink-0" />
                    <PipelineStep label="DAST" status="active" count={0} duration="running" />
                    <ChevronRight className="w-4 h-4 text-[#64748B] mt-3 shrink-0" />
                    <PipelineStep label="API Sec" status="done" count={1} duration="32s" />
                    <ChevronRight className="w-4 h-4 text-[#64748B] mt-3 shrink-0" />
                    <PipelineStep label="Correlation" status="pending" count={0} />
                    <ChevronRight className="w-4 h-4 text-[#64748B] mt-3 shrink-0" />
                    <PipelineStep label="Risk" status="pending" count={0} />
                    <ChevronRight className="w-4 h-4 text-[#64748B] mt-3 shrink-0" />
                    <PipelineStep label="Report" status="pending" count={0} />
                  </div>
                </div>

                {/* FINDINGS TABLE */}
                <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-md shadow-sm overflow-hidden flex flex-col">
                  <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#FFFFFF]">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-[#64748B] flex items-center"><ShieldAlert className="w-4 h-4 mr-2"/> Vulnerability Findings</h2>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748B]" />
                      <input 
                        type="text" 
                        placeholder="Filter..." 
                        className="bg-[#F1F5F9] border border-[#E2E8F0] text-xs rounded pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#1D4ED8] text-[#0F172A] w-48 transition-colors"
                      />
                    </div>
                  </div>
                  
                  {isLoading ? (
                    <div className="p-8 space-y-4">
                      {[1, 2].map(i => (
                        <div key={i} className="h-10 bg-[#F1F5F9] rounded animate-pulse w-full"></div>
                      ))}
                    </div>
                  ) : findings.length === 0 ? (
                    <div className="p-12 text-center">
                      <ShieldCheck className="w-10 h-10 text-[#64748B] mx-auto mb-3" />
                      <p className="text-[#64748B] text-sm">No findings mapped to current scope.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="bg-[#F1F5F9]/30 text-[#64748B]">
                          <tr>
                            <th className="px-5 py-2.5 font-medium border-b border-[#E2E8F0]">Severity</th>
                            <th className="px-5 py-2.5 font-medium border-b border-[#E2E8F0] w-full">Finding</th>
                            <th className="px-5 py-2.5 font-medium border-b border-[#E2E8F0]">Component</th>
                            <th className="px-5 py-2.5 font-medium border-b border-[#E2E8F0]">CWE</th>
                            <th className="px-5 py-2.5 font-medium border-b border-[#E2E8F0]">CVSS</th>
                            <th className="px-5 py-2.5 font-medium border-b border-[#E2E8F0]">Status</th>
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
                              className="hover:bg-[#F1F5F9] cursor-pointer transition-colors group"
                            >
                              <td className="px-5 py-3">
                                <SeverityText severity={finding.severity} />
                              </td>
                              <td className="px-5 py-3 font-medium text-[#0F172A] truncate max-w-[280px]" title={finding.title}>{finding.title}</td>
                              <td className="px-5 py-3 font-mono text-[#64748B]">{finding.affectedComponent || '-'}</td>
                              <td className="px-5 py-3 text-[#64748B]">{finding.cwe || '-'}</td>
                              <td className="px-5 py-3 text-[#64748B]">{finding.cvssScore?.toFixed(1) || '-'}</td>
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
                <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-md p-5 shadow-sm">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-[#64748B] mb-4 flex items-center"><Server className="w-4 h-4 mr-2"/> Attack Surface</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <SurfaceStat icon={<Server className="w-4 h-4" />} label="Endpoints" value="Mapped" />
                    <SurfaceStat icon={<Code className="w-4 h-4" />} label="API Routes" value="Active" />
                    <SurfaceStat icon={<Box className="w-4 h-4" />} label="Client Modules" value="Tracked" />
                    <SurfaceStat icon={<Link className="w-4 h-4" />} label="Integrations" value="Configured" />
                    <SurfaceStat icon={<Shield className="w-4 h-4" />} label="Trust Boundaries" value="Mapped" />
                  </div>
                </div>

                {/* RISK OVERVIEW */}
                <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-md p-5 shadow-sm">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-[#64748B] mb-4 flex items-center"><BarChartIcon className="w-4 h-4 mr-2"/> Risk Overview</h2>
                  
                  <div className="space-y-4 mb-6">
                    <h3 className="text-xs font-medium text-[#64748B]">Severity Distribution</h3>
                    <div className="flex h-2 w-full rounded overflow-hidden bg-[#F1F5F9]">
                      <div className="bg-[#B91C1C]" style={{width: `${(severityCounts.Critical / Math.max(1, totalFindings)) * 100}%`}}></div>
                      <div className="bg-[#B45309]" style={{width: `${(severityCounts.High / Math.max(1, totalFindings)) * 100}%`}}></div>
                      <div className="bg-[#B45309]" style={{width: `${(severityCounts.Medium / Math.max(1, totalFindings)) * 100}%`}}></div>
                      <div className="bg-[#1D4ED8]" style={{width: `${(severityCounts.Low / Math.max(1, totalFindings)) * 100}%`}}></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-[#64748B] uppercase">
                      <span>C ({severityCounts.Critical})</span>
                      <span>H ({severityCounts.High})</span>
                      <span>M ({severityCounts.Medium})</span>
                      <span>L ({severityCounts.Low})</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-medium text-[#64748B]">Domain Distribution</h3>
                    {Object.entries(categories).length > 0 ? Object.entries(categories).map(([cat, count]) => (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-[11px] text-[#0F172A] capitalize">
                          <span>{cat}</span>
                          <span className="text-[#64748B]">{count}</span>
                        </div>
                        <div className="w-full bg-[#F1F5F9] h-1.5 rounded overflow-hidden">
                          <div className="bg-[#1D4ED8] h-full" style={{width: `${(count / totalFindings) * 100}%`}}></div>
                        </div>
                      </div>
                    )) : (
                      <span className="text-xs text-[#64748B]">No data available</span>
                    )}
                  </div>
                </div>

                {/* RECENT ACTIVITY */}
                <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-md p-5 shadow-sm flex-1">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-[#64748B] mb-4 flex items-center"><Clock className="w-4 h-4 mr-2"/> Recent Activity</h2>
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-[#F1F5F9] pl-6 md:pl-0">
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
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-md shadow-lg border flex items-center space-x-3 animate-in slide-in-from-bottom-4 z-50 ${
          toast.type === 'success' 
            ? 'bg-[#F1F5F9] border-[#15803D]/30 text-[#0F172A]' 
            : 'bg-[#F1F5F9] border-[#B45309]/30 text-[#0F172A]'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-[#15803D]" /> : <AlertTriangle className="w-4 h-4 text-[#B45309]" />}
          <span className="font-medium text-xs uppercase tracking-wider">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

// Subcomponents

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-semibold tracking-wide transition-colors ${
        active 
          ? 'bg-[#F1F5F9] text-[#0F172A]' 
          : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function KPICard({ label, count, trend }: { label: string, count: number, trend: string }) {
  return (
    <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-md p-4 flex flex-col justify-between shadow-sm">
      <span className="text-[#64748B] font-medium text-[11px] uppercase tracking-wider mb-2">{label}</span>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-[#0F172A] leading-none">{count}</span>
        <span className="text-[10px] text-[#64748B] flex items-center">
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
    case 'low': colorClass = 'text-[#1D4ED8]'; break;
    default: colorClass = 'text-[#64748B]'; break;
  }
  
  return (
    <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center ${colorClass}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-2 bg-current" aria-hidden="true"></span>
      {severity}
    </span>
  );
}

function ValidationStatus({ success }: { success?: boolean }) {
  if (success === true) return <span className="text-[#15803D] flex items-center text-[11px] font-bold uppercase tracking-wider"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Validated</span>;
  if (success === false) return <span className="text-[#B91C1C] flex items-center text-[11px] font-bold uppercase tracking-wider"><XCircle className="w-3.5 h-3.5 mr-1" /> Failed</span>;
  return <span className="text-[#64748B] flex items-center text-[11px] font-bold uppercase tracking-wider"><MinusCircle className="w-3.5 h-3.5 mr-1" /> Pending</span>;
}

function SurfaceStat({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-[#F1F5F9]/50 border border-[#E2E8F0] rounded p-3 flex items-center space-x-3">
      <div className="text-[#1D4ED8]">
        {icon}
      </div>
      <div>
        <div className="text-sm font-bold text-[#0F172A]">{value}</div>
        <div className="text-[10px] text-[#64748B] uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}

function PipelineStep({ label, status, count, duration }: { label: string, status: 'done' | 'active' | 'pending', count: number, duration?: string }) {
  let icon = <CheckCircle2 className="w-3 h-3 text-[#64748B]" />;
  if (status === 'active') icon = <Loader2 className="w-3 h-3 text-[#1D4ED8] animate-spin" />;
  if (status === 'done' && count > 0) icon = <AlertTriangle className="w-3 h-3 text-[#B45309]" />;
  if (status === 'done' && count === 0) icon = <CheckCircle2 className="w-3 h-3 text-[#15803D]" />;

  return (
    <div className="flex flex-col items-center flex-shrink-0 w-16">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
        status === 'active' ? 'border-[#1D4ED8] bg-[#1D4ED8]/10' :
        status === 'done' ? 'border-[#E2E8F0] bg-[#F1F5F9]' : 'border-dashed border-[#E2E8F0] bg-transparent'
      }`}>
        {icon}
      </div>
      <span className={`text-[9px] font-semibold uppercase tracking-wider mt-2 text-center ${status === 'pending' ? 'text-[#64748B]' : 'text-[#64748B]'}`}>{label}</span>
      {duration && <span className="text-[9px] text-[#64748B]">{duration}</span>}
    </div>
  );
}

function ActivityItem({ time, action, detail }: { time: string, action: string, detail: string }) {
  return (
    <div className="relative md:pl-8">
      <span className="absolute left-0 -ml-1.5 md:ml-0 md:left-1.5 top-1 h-3 w-3 rounded-full border-2 border-[#111827] bg-[#1D4ED8]"></span>
      <div className="flex flex-col mb-1 ml-4 md:ml-0">
        <span className="text-xs font-semibold text-[#0F172A]">{action}</span>
        <span className="text-[10px] text-[#64748B]">{detail}</span>
      </div>
      <span className="text-[10px] text-[#64748B] ml-4 md:ml-0">{time}</span>
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
