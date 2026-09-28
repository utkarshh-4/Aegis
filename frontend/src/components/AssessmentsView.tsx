import { useState, useEffect } from 'react';
import { Plus, CheckCircle2, XCircle, ShieldCheck, Loader2 } from 'lucide-react';

interface Assessment {
  id: string;
  name: string;
  targetUrl: string;
  status: string;
  createdAt: string;
}

export default function AssessmentsView({ onAssessmentCreated }: { onAssessmentCreated?: (id: string) => void }) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: 'World Monitor Security Lab',
    targetUrl: 'http://worldmonitor-target:5173',
    repository: 'github.com/worldmonitor/app',
    commit: 'a1b2c3d',
    environment: 'LOCAL LAB',
    scanProfile: 'default'
  });
  const [scopeStatus, setScopeStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [scopeReason, setScopeReason] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/api/assessments')
      .then(r => r.json())
      .then(setAssessments)
      .catch(console.error);
  }, []);

  const handleValidateScope = async () => {
    setScopeStatus('validating');
    try {
      const res = await fetch('http://localhost:4000/api/assessments/validate-scope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: formData.targetUrl })
      });
      const data = await res.json();
      setScopeStatus(data.valid ? 'valid' : 'invalid');
      setScopeReason(data.reason || '');
    } catch (e) {
      setScopeStatus('invalid');
      setScopeReason('Failed to reach validation service.');
    }
  };

  const handleCreate = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const newAssessment = await res.json();
      setAssessments(prev => [...prev, newAssessment]);
      setIsCreating(false);
      setScopeStatus('idle');
      if (onAssessmentCreated) onAssessmentCreated(newAssessment.id);
    } catch (e) {
      console.error(e);
    }
  };

  if (isCreating) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 p-6">
        <div className="border-b border-border pb-4">
          <h1 className="text-xl font-bold text-textMain flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            New Assessment
          </h1>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-1">Target Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-surface border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-1">Target URL</label>
              <input type="text" value={formData.targetUrl} onChange={e => {setFormData({...formData, targetUrl: e.target.value}); setScopeStatus('idle');}} className="w-full bg-surface border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary font-mono" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-1">Environment</label>
              <select value={formData.environment} onChange={e => setFormData({...formData, environment: e.target.value})} className="w-full bg-surface border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary">
                <option value="LOCAL LAB">Local Lab</option>
                <option value="STAGING">Staging</option>
                <option value="PRODUCTION">Production</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-1">Pinned Commit</label>
              <input type="text" value={formData.commit} onChange={e => setFormData({...formData, commit: e.target.value})} className="w-full bg-surface border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary font-mono" />
            </div>
            
            <button 
              onClick={handleValidateScope}
              disabled={scopeStatus === 'validating'}
              className="mt-4 px-4 py-2 bg-surface border border-border hover:bg-background rounded text-sm font-medium flex items-center"
            >
              {scopeStatus === 'validating' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
              Validate Scope
            </button>
          </div>

          <div>
            <div className="bg-surface border border-border rounded p-5 h-full flex flex-col">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-textMuted mb-4">Target Authorization</h3>
              
              {scopeStatus === 'idle' && (
                <div className="flex-1 flex items-center justify-center text-textMuted text-sm text-center">
                  Enter target details and validate scope to proceed.
                </div>
              )}
              
              {scopeStatus === 'validating' && (
                <div className="flex-1 flex flex-col items-center justify-center text-primary text-sm">
                  <Loader2 className="w-8 h-8 animate-spin mb-4" />
                  Checking authorization boundaries...
                </div>
              )}
              
              {scopeStatus === 'valid' && (
                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-textMain"><CheckCircle2 className="w-4 h-4 text-green-500 mr-2" /> Target registered</div>
                    <div className="flex items-center text-sm text-textMain"><CheckCircle2 className="w-4 h-4 text-green-500 mr-2" /> Environment: {formData.environment}</div>
                    <div className="flex items-center text-sm text-textMain"><CheckCircle2 className="w-4 h-4 text-green-500 mr-2" /> Host inside allowlist</div>
                    <div className="flex items-center text-sm text-textMain"><CheckCircle2 className="w-4 h-4 text-green-500 mr-2" /> Destructive testing: DISABLED</div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-border">
                    <p className="text-green-500 font-bold mb-4 flex items-center"><ShieldCheck className="w-5 h-5 mr-2" /> Assessment permitted</p>
                    <button onClick={handleCreate} className="w-full py-2 bg-primary text-white font-bold rounded hover:opacity-90 transition-opacity">
                      Start Assessment
                    </button>
                  </div>
                </div>
              )}
              
              {scopeStatus === 'invalid' && (
                <div className="flex-1 flex flex-col">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-textMain"><XCircle className="w-4 h-4 text-red-500 mr-2" /> Target: {formData.targetUrl}</div>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded text-sm text-red-500">
                    <p className="font-bold mb-1 flex items-center"><XCircle className="w-4 h-4 mr-2" /> BLOCKED</p>
                    <p>{scopeReason}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto space-y-6 p-6">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <h1 className="text-xl font-bold text-textMain">Assessments History</h1>
        <button onClick={() => setIsCreating(true)} className="flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          New Assessment
        </button>
      </div>
      
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-textMuted">
            <th className="py-3 font-medium">ID</th>
            <th className="py-3 font-medium">Target</th>
            <th className="py-3 font-medium">Date</th>
            <th className="py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {assessments.map(a => (
            <tr key={a.id} className="border-b border-border hover:bg-surface transition-colors cursor-pointer" onClick={() => onAssessmentCreated?.(a.id)}>
              <td className="py-3 font-mono text-primary font-medium">{a.id}</td>
              <td className="py-3">{a.targetUrl}</td>
              <td className="py-3">{new Date(a.createdAt).toISOString().split('T')[0]}</td>
              <td className="py-3">
                <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider border rounded ${a.status === 'COMPLETED' ? 'text-green-500 border-green-500/30' : a.status === 'CREATED' ? 'text-blue-500 border-blue-500/30' : 'text-textMuted border-border'}`}>
                  {a.status}
                </span>
              </td>
            </tr>
          ))}
          {assessments.length === 0 && (
            <tr>
              <td colSpan={4} className="py-8 text-center text-textMuted">No assessments found. Create one to begin.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
