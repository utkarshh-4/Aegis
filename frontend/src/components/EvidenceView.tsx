import { useState, useEffect } from 'react';
import { Terminal, Shield } from 'lucide-react';

export default function EvidenceView() {
  const [evidence, setEvidence] = useState([]);
  
  useEffect(() => {
    fetch('http://localhost:4000/api/findings')
      .then(r => r.json())
      .then(data => {
        const ev = data.filter((f: any) => f.pocEvidence).map((f: any) => ({
          id: f.id, title: f.title, evidence: f.pocEvidence, date: f.lastPocRunAt
        }));
        setEvidence(ev);
      });
  }, []);

  return (
    <div className="max-w-screen-xl mx-auto space-y-6 p-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold text-textMain flex items-center">
          <Terminal className="w-5 h-5 mr-2" />
          Collected Evidence
        </h1>
      </div>
      
      {evidence.length === 0 ? (
        <div className="p-12 text-center text-textMuted border border-border rounded">
          <Shield className="w-8 h-8 mx-auto mb-3 opacity-50" />
          No evidence collected yet. Run PoCs to collect evidence.
        </div>
      ) : (
        <div className="space-y-6">
          {evidence.map((item: any) => (
            <div key={item.id} className="border border-border rounded bg-surface">
              <div className="p-4 border-b border-border flex justify-between">
                <span className="font-semibold text-textMain">{item.id}: {item.title}</span>
                <span className="text-xs text-textMuted font-mono">{new Date(item.date).toLocaleString()}</span>
              </div>
              <pre className="p-4 text-xs font-mono text-textMuted overflow-x-auto whitespace-pre-wrap bg-background m-0">
                {item.evidence}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
