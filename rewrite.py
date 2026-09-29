import re
import os

filepath = 'frontend/src/components/Dashboard.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure to import Play
if 'import { Play } from' not in content and 'Play,' not in content:
    content = content.replace('Menu\n}', 'Menu,\n  Play\n}')

# State variables to insert before useEffect
state_vars = """  const [assessmentStatus, setAssessmentStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [assessmentLogs, setAssessmentLogs] = useState<{timestamp: string, level: string, message: string}[]>([]);
  const [assessmentStages, setAssessmentStages] = useState({
    'Target Setup': 'COMPLETED',
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

  const startDemoAssessment = async () => {
    if (assessmentStatus === 'running') return;
    setAssessmentStatus('running');
    setAssessmentStartedAt(new Date().toISOString());
    setAssessmentLogs([]);
    
    setAssessmentStages({
      'Target Setup': 'COMPLETED',
      'Discovery': 'PENDING',
      'Security Scanning': 'PENDING',
      'Analysis': 'PENDING',
      'Verification': 'PENDING',
      'Report': 'PENDING'
    });
    setScanners(scanners.map(s => ({...s, progress: 0, status: 'PENDING'})));
    
    addLog('INFO', 'Starting synthetic security assessment...');
    addLog('INFO', 'Validating target scope...');
    await new Promise(r => setTimeout(r, 1000));
    
    setAssessmentStages(prev => ({...prev, 'Discovery': 'RUNNING'}));
    addLog('INFO', 'Target reachable: http://localhost:3000');
    await new Promise(r => setTimeout(r, 1500));
    setAssessmentStages(prev => ({...prev, 'Discovery': 'COMPLETED'}));
    
    setAssessmentStages(prev => ({...prev, 'Security Scanning': 'RUNNING'}));
    
    addLog('INFO', 'Running synthetic API security checks...');
    const updateScanner = (name: string, progress: number, status: string) => {
      setScanners(prev => prev.map(s => s.name === name ? { ...s, progress, status } : s));
    };
    
    for(let i=0; i<=100; i+=25) {
      updateScanner('Semgrep', i, i === 100 ? 'COMPLETED' : 'RUNNING');
      updateScanner('Gitleaks', i, i === 100 ? 'COMPLETED' : 'RUNNING');
      updateScanner('Trivy', i, i === 100 ? 'COMPLETED' : 'RUNNING');
      await new Promise(r => setTimeout(r, 400));
    }
    
    for(let i=0; i<=100; i+=20) {
      updateScanner('Nuclei', i, i === 100 ? 'COMPLETED' : 'RUNNING');
      updateScanner('ZAP', i, i === 100 ? 'COMPLETED' : 'RUNNING');
      updateScanner('Schemathesis', i, i === 100 ? 'COMPLETED' : 'RUNNING');
      updateScanner('Playwright', i, i === 100 ? 'COMPLETED' : 'RUNNING');
      await new Promise(r => setTimeout(r, 500));
    }
    
    setAssessmentStages(prev => ({...prev, 'Security Scanning': 'COMPLETED'}));
    setAssessmentStages(prev => ({...prev, 'Analysis': 'RUNNING'}));
    addLog('INFO', 'Correlating assessment results...');
    await new Promise(r => setTimeout(r, 1500));
    setAssessmentStages(prev => ({...prev, 'Analysis': 'COMPLETED'}));
    
    setAssessmentStages(prev => ({...prev, 'Verification': 'RUNNING'}));
    addLog('INFO', 'Running authorization validation...');
    
    for (const finding of findings) {
      addLog('INFO', `Testing ${finding.title}...`);
      try {
        const res = await fetch(`http://localhost:4000/api/findings/${finding.id}/run-poc`, {
            method: 'POST'
        });
        const updatedFinding = await res.json();
        setFindings(prev => prev.map(f => f.id === finding.id ? updatedFinding : f));
        
        if (updatedFinding.lastPocSuccess) {
            addLog('WARN', `Finding confirmed: ${finding.title}`);
        } else {
            addLog('INFO', `Finding mitigated: ${finding.title}`);
        }
      } catch (e) {
        addLog('WARN', `Error running PoC for: ${finding.title}`);
      }
      await new Promise(r => setTimeout(r, 1000));
    }
    
    addLog('INFO', 'Evidence collection completed');
    addLog('INFO', 'Risk classification completed');
    setAssessmentStages(prev => ({...prev, 'Verification': 'COMPLETED'}));
    
    setAssessmentStages(prev => ({...prev, 'Report': 'READY'}));
    addLog('INFO', 'Assessment ready for report generation');
    setAssessmentStatus('completed');
  };
"""

content = content.replace("  useEffect(() => {\n    const handleHashChange", state_vars + "\n  useEffect(() => {\n    const handleHashChange")

# Overview Replacement
overview_content = """
          <div className="max-w-screen-2xl mx-auto space-y-6">
            <div className="bg-red-500/10 border border-red-500/30 rounded p-3 flex items-center justify-center text-red-400 text-xs font-bold uppercase tracking-widest space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>SYNTHETIC SECURITY LAB • LOCAL TARGET • NO PRODUCTION TESTING</span>
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

                <button 
                  onClick={startDemoAssessment}
                  disabled={assessmentStatus === 'running'}
                  className={`w-full py-3 rounded font-bold text-sm tracking-wider uppercase transition-colors flex justify-center items-center ${assessmentStatus === 'running' ? 'bg-primary/50 text-white/50 cursor-not-allowed' : 'bg-primary hover:bg-blue-600 text-white'}`}
                >
                  {assessmentStatus === 'running' ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running...</> : <><Play className="w-4 h-4 mr-2" /> Start Demo Assessment</>}
                </button>
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
                          <div className={`h-full transition-all duration-300 ${s.status === 'COMPLETED' ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${s.progress}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <LiveOutputPanel logs={assessmentLogs} findings={findings} setActiveTab={setActiveTab} setSelectedFinding={setSelectedFinding} />

            <div className="bg-surface border border-border rounded p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-textMuted pb-6 flex items-center">Assessment Progress</h2>
              <div className="flex items-center justify-between relative">
                <div className="absolute left-[5%] right-[5%] top-4 h-0.5 bg-background -z-0"></div>
                {Object.entries(assessmentStages).map(([stage, status], idx, arr) => (
                  <div key={stage} className="relative z-10 flex flex-col items-center flex-1">
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
          </div>
"""

content = re.sub(r'<div className="max-w-screen-2xl mx-auto space-y-6">.*?</div>\s*</div>\s*\)\}\s*</main>', 
                 overview_content + '\n          )}\n        </main>', 
                 content, 
                 flags=re.DOTALL)

helpers = """
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
"""

content += "\n" + helpers

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
