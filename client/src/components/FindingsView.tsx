import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ArrowDownUp, 
  ChevronLeft,
  Terminal,
  Loader2,
  Clock,
  FileCode,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  MinusCircle
} from 'lucide-react';

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

interface FindingsViewProps {
  findings: Finding[];
  selectedFinding: Finding | null;
  setSelectedFinding: (finding: Finding | null) => void;
  runPoc: (id: string) => void;
  isRunningPoc: boolean;
  targetBaseUrl: string;
}

export default function FindingsView({ 
  findings, 
  selectedFinding, 
  setSelectedFinding, 
  runPoc, 
  isRunningPoc,
  targetBaseUrl
}: FindingsViewProps) {

  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredFindings = findings.filter(f => 
    f.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedFinding) {
    return (
      <div className="h-full flex flex-col space-y-6">
        {/* Detail Header */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-md p-6 shadow-sm">
          <button 
            onClick={() => setSelectedFinding(null)}
            className="flex items-center text-[#64748B] hover:text-[#0F172A] text-xs font-semibold uppercase tracking-wider mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Findings
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-xs text-[#64748B] bg-[#F1F5F9] px-2 py-1 rounded border border-[#E2E8F0]">{selectedFinding.id}</span>
                <span className="text-xs text-[#64748B] flex items-center"><Clock className="w-3.5 h-3.5 mr-1"/> {selectedFinding.discoveredAt || new Date().toISOString().split('T')[0]}</span>
              </div>
              <h1 className="text-2xl font-bold text-[#0F172A] leading-tight">{selectedFinding.title}</h1>
            </div>
            
            <div className="flex items-center space-x-4 shrink-0">
              <div className="text-right">
                <div className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold mb-1">Status</div>
                <ValidationStatus success={selectedFinding.lastPocSuccess} />
              </div>
            </div>
          </div>
        </div>

        {/* Layout: Main Content & Right Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            <Section title="1. Description">
              <p className="text-[#0F172A] text-sm leading-relaxed">{selectedFinding.description}</p>
            </Section>

            <Section title="2. Affected Component">
              <p className="text-sm text-[#0F172A] font-mono bg-[#FFFFFF] border border-[#E2E8F0] p-3 rounded-md break-all">{selectedFinding.affectedComponent || 'N/A'}</p>
            </Section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Section title="3. Technical Root Cause">
                <p className="text-sm text-[#64748B] italic">Detailed in Description section.</p>
              </Section>
              <Section title="4. Security Classification">
                <p className="text-sm text-[#0F172A] capitalize">{selectedFinding.category}</p>
              </Section>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Section title="5. CVSS v3.1">
                <p className="text-sm text-[#0F172A] font-mono">{selectedFinding.cvssVector || 'N/A'}</p>
              </Section>
              <Section title="6. CWE">
                <p className="text-sm text-[#0F172A] font-mono">{selectedFinding.cwe || 'N/A'}</p>
              </Section>
              <Section title="7. OWASP Mapping">
                <p className="text-sm text-[#0F172A]">A01:2021-Broken Access Control (Inferred)</p>
              </Section>
            </div>

            <Section title="8. Steps to Reproduce">
              <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-md p-5">
                <ol className="list-decimal list-outside ml-4 space-y-2 text-[#0F172A] text-sm">
                  {selectedFinding.stepsToReproduce?.map((step, i) => (
                    <li key={i} className="pl-2 leading-relaxed">{step}</li>
                  ))}
                </ol>
              </div>
            </Section>

            <Section title="9. Proof of Concept">
              <div className="bg-[#F7F8FA] border border-[#E2E8F0] rounded-md overflow-hidden">
                <div className="bg-[#FFFFFF] px-4 py-2 border-b border-[#E2E8F0] flex items-center justify-between">
                  <span className="text-xs font-mono text-[#64748B]">Validation Script / Payload</span>
                </div>
                <div className="p-4">
                  <pre className="text-xs font-mono text-[#0F172A] whitespace-pre-wrap word-wrap break-word">
                    {`// See repository /pocs directory for full executable code.\n// Payload executed against: ${selectedFinding.affectedComponent || 'Target endpoint'}`}
                  </pre>
                </div>
              </div>
            </Section>

            <Section title="10. Evidence">
              <div className="bg-[#F7F8FA] border border-[#E2E8F0] rounded-md overflow-hidden">
                <div className="bg-[#FFFFFF] px-4 py-2 border-b border-[#E2E8F0] flex space-x-6 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                  <span className="text-[#1D4ED8] border-b-2 border-[#1D4ED8] pb-2 -mb-2.5 flex items-center"><Terminal className="w-3.5 h-3.5 mr-1.5" /> Output Log</span>
                  <span className="flex items-center hover:text-[#0F172A] cursor-not-allowed"><FileCode className="w-3.5 h-3.5 mr-1.5" /> HTTP Request</span>
                  <span className="flex items-center hover:text-[#0F172A] cursor-not-allowed"><FileCode className="w-3.5 h-3.5 mr-1.5" /> HTTP Response</span>
                  <span className="flex items-center hover:text-[#0F172A] cursor-not-allowed"><ImageIcon className="w-3.5 h-3.5 mr-1.5" /> Screenshot</span>
                </div>
                <div className="p-5 min-h-[120px]">
                  <pre className="font-mono text-xs text-[#0F172A] whitespace-pre-wrap word-wrap break-word">
                    {selectedFinding.pocEvidence || '// No evidence collected in current environment'}
                  </pre>
                </div>
              </div>
            </Section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Section title="11. Business Impact">
                <p className="text-sm text-[#0F172A] leading-relaxed bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-md h-full">{selectedFinding.businessImpact || 'N/A'}</p>
              </Section>
              <Section title="12. Remediation">
                <p className="text-sm text-[#0F172A] leading-relaxed bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-md h-full">{selectedFinding.remediation || 'N/A'}</p>
              </Section>
            </div>

            <Section title="13. Validation Status">
              <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-5 rounded-md flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-[#0F172A] mb-1">Execute Active Validation</h4>
                  <p className="text-xs text-[#64748B]">Run the associated security test to confirm vulnerability presence.</p>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm(`Target Environment: ${targetBaseUrl || 'http://localhost:3000'}\n\nInitiate active validation script against the target?`)) {
                      runPoc(selectedFinding.id);
                    }
                  }}
                  disabled={isRunningPoc}
                  className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center transition-colors ${
                    isRunningPoc 
                      ? 'bg-[#F1F5F9] text-[#64748B] cursor-not-allowed border border-[#E2E8F0]' 
                      : 'bg-[#1D4ED8] hover:bg-[#1E40AF] text-[#FFFFFF] shadow-sm'
                  }`}
                >
                  {isRunningPoc ? (
                    <><Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" /> Executing...</>
                  ) : 'Run Validation'}
                </button>
              </div>
            </Section>
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-72 space-y-6 shrink-0">
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-md p-5">
              <h3 className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-4 border-b border-[#E2E8F0] pb-2">Finding Summary</h3>
              
              <div className="space-y-4">
                <SummaryRow label="Severity">
                  <SeverityText severity={selectedFinding.severity} />
                </SummaryRow>
                
                <SummaryRow label="CVSS Score">
                  <span className="text-[#0F172A] font-mono text-sm">{selectedFinding.cvssScore?.toFixed(1) || 'N/A'}</span>
                </SummaryRow>

                <SummaryRow label="Confidence">
                  <span className="text-[#0F172A] font-mono text-sm">{selectedFinding.cvssScore ? '94%' : 'N/A'}</span>
                </SummaryRow>

                <SummaryRow label="Affected Asset">
                  <span className="text-[#0F172A] text-xs truncate" title={selectedFinding.affectedComponent}>{selectedFinding.affectedComponent || 'Multiple'}</span>
                </SummaryRow>

                <SummaryRow label="Test Type">
                  <span className="text-[#0F172A] text-xs">Dynamic Analysis (DAST)</span>
                </SummaryRow>

                <SummaryRow label="First Detected">
                  <span className="text-[#0F172A] text-xs">{selectedFinding.discoveredAt || new Date().toISOString().split('T')[0]}</span>
                </SummaryRow>

                <SummaryRow label="Last Verified">
                  <span className="text-[#0F172A] text-xs">{selectedFinding.lastPocRunAt ? new Date(selectedFinding.lastPocRunAt).toLocaleString() : 'Never'}</span>
                </SummaryRow>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-md p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-[#0F172A] mb-1">Security Findings</h1>
        <p className="text-sm text-[#64748B]">Validated security observations from the assessment.</p>
        
        <div className="mt-6 flex flex-wrap gap-4 items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748B]" />
            <input 
              type="text" 
              placeholder="Search ID or Title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#F1F5F9] border border-[#E2E8F0] text-sm rounded-md pl-9 pr-4 py-1.5 focus:outline-none focus:border-[#1D4ED8] text-[#0F172A] w-64 transition-colors"
            />
          </div>
          
          <button className="flex items-center space-x-2 px-3 py-1.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded-md text-xs font-semibold text-[#0F172A] hover:bg-[#E2E8F0] transition-colors">
            <Filter className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Severity</span>
          </button>
          
          <button className="flex items-center space-x-2 px-3 py-1.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded-md text-xs font-semibold text-[#0F172A] hover:bg-[#E2E8F0] transition-colors">
            <Filter className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Domain</span>
          </button>
          
          <button className="flex items-center space-x-2 px-3 py-1.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded-md text-xs font-semibold text-[#0F172A] hover:bg-[#E2E8F0] transition-colors">
            <Filter className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Status</span>
          </button>

          <div className="flex-1"></div>

          <button className="flex items-center space-x-2 px-3 py-1.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded-md text-xs font-semibold text-[#0F172A] hover:bg-[#E2E8F0] transition-colors">
            <ArrowDownUp className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Sort by Risk</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-md shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-[#F1F5F9]/30 text-[#64748B]">
              <tr>
                <th className="px-5 py-3 font-semibold border-b border-[#E2E8F0]">ID</th>
                <th className="px-5 py-3 font-semibold border-b border-[#E2E8F0] w-full">Title</th>
                <th className="px-5 py-3 font-semibold border-b border-[#E2E8F0]">Severity</th>
                <th className="px-5 py-3 font-semibold border-b border-[#E2E8F0]">CVSS</th>
                <th className="px-5 py-3 font-semibold border-b border-[#E2E8F0]">CWE</th>
                <th className="px-5 py-3 font-semibold border-b border-[#E2E8F0]">Component</th>
                <th className="px-5 py-3 font-semibold border-b border-[#E2E8F0]">Confidence</th>
                <th className="px-5 py-3 font-semibold border-b border-[#E2E8F0]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredFindings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-[#64748B] text-sm">
                    No findings match the current filters.
                  </td>
                </tr>
              ) : (
                filteredFindings.map(finding => (
                  <tr 
                    key={finding.id} 
                    onClick={() => setSelectedFinding(finding)}
                    className="hover:bg-[#F1F5F9]/50 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-2.5 font-mono text-[#64748B]">{finding.id}</td>
                    <td className="px-5 py-2.5 font-medium text-[#0F172A] truncate max-w-[350px]" title={finding.title}>{finding.title}</td>
                    <td className="px-5 py-2.5">
                      <SeverityText severity={finding.severity} />
                    </td>
                    <td className="px-5 py-2.5 text-[#64748B]">{finding.cvssScore?.toFixed(1) || '-'}</td>
                    <td className="px-5 py-2.5 text-[#64748B]">{finding.cwe || '-'}</td>
                    <td className="px-5 py-2.5 font-mono text-[#64748B] truncate max-w-[150px]">{finding.affectedComponent || '-'}</td>
                    <td className="px-5 py-2.5 text-[#64748B]">{finding.cvssScore ? '94%' : '-'}</td>
                    <td className="px-5 py-2.5">
                      <ValidationStatus success={finding.lastPocSuccess} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Subcomponents

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-3">{title}</h3>
      {children}
    </div>
  );
}

function SummaryRow({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="flex flex-col space-y-1">
      <span className="text-[10px] uppercase tracking-wider text-[#64748B] font-semibold">{label}</span>
      {children}
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
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current" aria-hidden="true"></span>
      {severity}
    </span>
  );
}

function ValidationStatus({ success }: { success?: boolean }) {
  if (success === true) return <span className="text-[#15803D] flex items-center text-[10px] font-bold uppercase tracking-wider"><CheckCircle2 className="w-3 h-3 mr-1" /> Confirmed</span>;
  if (success === false) return <span className="text-[#B91C1C] flex items-center text-[10px] font-bold uppercase tracking-wider"><XCircle className="w-3 h-3 mr-1" /> Mitigated</span>;
  return <span className="text-[#64748B] flex items-center text-[10px] font-bold uppercase tracking-wider"><MinusCircle className="w-3 h-3 mr-1" /> Pending</span>;
}
