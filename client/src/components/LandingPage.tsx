import React from 'react';
import { 
  ShieldCheck, 
  ChevronRight, 
  FileCode,
  Activity,
  CheckCircle2,
  FileText,
  Terminal,
  Lock,
  Key,
  Database,
  Network,
  MonitorSmartphone,
  Globe
} from 'lucide-react';

interface LandingPageProps {
  onLaunch: () => void;
}

export default function LandingPage({ onLaunch }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0F172A] font-sans selection:bg-[#1D4ED8] selection:text-[#FFFFFF] flex flex-col">
      
      {/* NAVIGATION */}
      <header className="h-16 border-b border-[#E2E8F0] flex items-center justify-between px-8 shrink-0 bg-[#FFFFFF] sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-6 h-6 text-[#1D4ED8]" />
          <span className="font-semibold text-lg tracking-tight">World Monitor Assessment</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#64748B]">
          <a href="#" className="hover:text-[#0F172A] transition-colors">Platform</a>
          <a href="#" className="hover:text-[#0F172A] transition-colors">Assessment Scope</a>
          <a href="#" className="hover:text-[#0F172A] transition-colors">Methodology</a>
          <a href="#" className="hover:text-[#0F172A] transition-colors">Reports</a>
        </nav>

        <div>
          <button 
            onClick={onLaunch}
            className="px-5 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-[#FFFFFF] rounded text-sm font-semibold transition-colors"
          >
            Launch Assessment
          </button>
        </div>
      </header>

      <main className="flex-1">
        
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-8 py-20 flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="flex-1 space-y-6">
            <h1 className="text-5xl font-bold leading-tight tracking-tight text-[#0F172A]">
              Security Assessment, <br />Built Around Evidence.
            </h1>
            <p className="text-lg text-[#475569] max-w-xl leading-relaxed">
              Automatically assess World Monitor, validate security findings, capture reproducible evidence, and generate actionable remediation reports.
            </p>
            <div className="flex items-center space-x-4 pt-4">
              <button 
                onClick={onLaunch}
                className="px-6 py-3 bg-[#1D4ED8] hover:bg-[#1E40AF] text-[#FFFFFF] rounded font-semibold transition-colors flex items-center space-x-2"
              >
                <span>Launch Assessment</span>
                <ChevronRight className="w-5 h-5" />
              </button>
              <button className="px-6 py-3 bg-[#FFFFFF] hover:bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0] rounded font-semibold transition-colors">
                View Methodology
              </button>
            </div>
          </div>

          {/* HERO VISUAL (Product Pipeline Diagram) */}
          <div className="flex-1 w-full flex justify-center lg:justify-end">
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg p-6 w-full max-w-md shadow-sm">
              
              <div className="flex flex-col items-center space-y-2">
                <div className="w-full text-center py-3 bg-[#F1F5F9] border border-[#E2E8F0] rounded text-sm font-bold text-[#0F172A]">
                  WORLD MONITOR <br/><span className="font-normal text-xs text-[#64748B]">System Under Test</span>
                </div>
                
                <div className="h-4 w-px bg-[#E2E8F0]"></div>
                
                <div className="w-full text-center py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded text-xs font-semibold text-[#475569]">
                  RECONNAISSANCE
                </div>
                
                <div className="h-4 w-px bg-[#E2E8F0]"></div>

                <div className="w-full border border-[#1D4ED8] rounded p-3 text-center">
                  <div className="text-xs font-bold text-[#1D4ED8] mb-2">SECURITY TESTING</div>
                  <div className="flex justify-center gap-2 text-[10px] font-semibold text-[#0F172A]">
                    <span className="px-2 py-1 bg-[#F1F5F9] rounded">SAST</span>
                    <span className="px-2 py-1 bg-[#F1F5F9] rounded">DAST</span>
                    <span className="px-2 py-1 bg-[#F1F5F9] rounded">API</span>
                    <span className="px-2 py-1 bg-[#F1F5F9] rounded">CLIENT</span>
                  </div>
                </div>

                <div className="h-4 w-px bg-[#E2E8F0]"></div>

                <div className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded p-3 text-center">
                  <div className="text-xs font-bold text-[#0F172A] mb-2">EVIDENCE</div>
                  <div className="flex justify-center gap-2 text-[10px] text-[#64748B]">
                    <span>HTTP</span> • <span>SOURCE</span> • <span>POC</span> • <span>SCREENSHOT</span>
                  </div>
                </div>

                <div className="h-4 w-px bg-[#E2E8F0]"></div>

                <div className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded p-3 text-center">
                  <div className="text-xs font-bold text-[#0F172A] mb-2">RISK ASSESSMENT</div>
                  <div className="flex justify-center gap-2 text-[10px] text-[#64748B]">
                    <span>CVSS</span> • <span>CWE</span> • <span>SEVERITY</span>
                  </div>
                </div>

                <div className="h-4 w-px bg-[#E2E8F0]"></div>

                <div className="w-full text-center py-3 bg-[#0F172A] text-[#FFFFFF] rounded text-sm font-bold">
                  SECURITY REPORT
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* TRUST / CONTEXT STRIP */}
        <section className="border-y border-[#E2E8F0] bg-[#FFFFFF] py-6">
          <div className="max-w-7xl mx-auto px-8 flex flex-wrap justify-between items-center text-sm font-semibold text-[#475569] gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-[#0F172A]">WORLD MONITOR</span>
              <span className="text-[#64748B] font-normal">SYSTEM UNDER TEST</span>
            </div>
            <div>7 SECURITY DOMAINS</div>
            <div>EVIDENCE-DRIVEN ASSESSMENT</div>
            <div>REPRODUCIBLE TESTING</div>
          </div>
        </section>

        {/* WHAT WE BUILT */}
        <section className="max-w-7xl mx-auto px-8 py-24">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-[#0F172A] mb-4">What We Built</h2>
            <p className="text-[#475569] max-w-3xl text-lg leading-relaxed">
              An automated security assessment platform that brings reconnaissance, static analysis, dynamic testing, evidence collection, risk analysis, and reporting into one workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ProcessStep num="01" title="Discover" desc="Map the application's web, API, client and relevant security surfaces." />
            <ProcessStep num="02" title="Analyze" desc="Review source code, dependencies, secrets and security controls." />
            <ProcessStep num="03" title="Test" desc="Run controlled security tests against the authorized local test environment." />
            <ProcessStep num="04" title="Validate" desc="Correlate observations and capture reproducible evidence." />
            <ProcessStep num="05" title="Assess Risk" desc="Map findings to CVSS, CWE and relevant OWASP categories." />
            <ProcessStep num="06" title="Report" desc="Generate technical findings, business impact and remediation guidance." />
          </div>
        </section>

        {/* SEVEN SECURITY DOMAINS (From SRS) */}
        <section className="bg-[#FFFFFF] border-y border-[#E2E8F0] py-24">
          <div className="max-w-7xl mx-auto px-8">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[#0F172A] mb-4">Seven Security Domains</h2>
              <p className="text-[#475569] text-lg">Testing scope aligned with the World Monitor Security Assessment specification.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DomainCard num="01" icon={<Key />} title="Authentication & Session Management" desc="Passkey logic, session attributes, token handling." />
              <DomainCard num="02" icon={<Lock />} title="Authorization & Access Control" desc="Pro-tier gating, IDOR, Tauri IPC command authorization." />
              <DomainCard num="03" icon={<FileCode />} title="Input Validation & Data Handling" desc="Edge function parameters, XSS, content rendering." />
              <DomainCard num="04" icon={<Network />} title="API Security" desc="REST enumeration, MCP authentication, SSRF protections." />
              <DomainCard num="05" icon={<MonitorSmartphone />} title="Client-Side Security" desc="CSP configuration, local storage, DOM synchronization." />
              <DomainCard num="06" icon={<Globe />} title="Secure Communication" desc="TLS configuration, WSS relay headers, mixed content." />
              <DomainCard num="07" icon={<Database />} title="Data Storage & Privacy" desc="OS keychain, Redis isolation, Convex schema." />
            </div>
          </div>
        </section>

        {/* HOW THE PLATFORM WORKS */}
        <section className="max-w-7xl mx-auto px-8 py-24 text-center">
          <h2 className="text-3xl font-bold text-[#0F172A] mb-12">How the Platform Works</h2>
          <div className="flex flex-col md:flex-row items-center justify-center text-xs font-semibold text-[#475569] gap-2 md:gap-4 flex-wrap">
            <span className="px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded">SOURCE + TARGET</span>
            <ChevronRight className="w-4 h-4 text-[#E2E8F0] hidden md:block" />
            <span className="px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded">SCOPE VALIDATION</span>
            <ChevronRight className="w-4 h-4 text-[#E2E8F0] hidden md:block" />
            <span className="px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded">ATTACK SURFACE</span>
            <ChevronRight className="w-4 h-4 text-[#E2E8F0] hidden md:block" />
            <span className="px-3 py-2 bg-[#FFFFFF] border border-[#1D4ED8] text-[#1D4ED8] rounded">STATIC & DYNAMIC TESTING</span>
            <ChevronRight className="w-4 h-4 text-[#E2E8F0] hidden md:block" />
            <span className="px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded">FINDING CORRELATION</span>
            <ChevronRight className="w-4 h-4 text-[#E2E8F0] hidden md:block" />
            <span className="px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded">EVIDENCE</span>
            <ChevronRight className="w-4 h-4 text-[#E2E8F0] hidden md:block" />
            <span className="px-3 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded">RISK ASSESSMENT</span>
            <ChevronRight className="w-4 h-4 text-[#E2E8F0] hidden md:block" />
            <span className="px-3 py-2 bg-[#0F172A] text-[#FFFFFF] rounded">REPORT</span>
          </div>
        </section>

        {/* EVIDENCE-FIRST SECTION */}
        <section className="bg-[#FFFFFF] border-y border-[#E2E8F0] py-24">
          <div className="max-w-7xl mx-auto px-8">
            <div className="mb-12 max-w-3xl">
              <h2 className="text-3xl font-bold text-[#0F172A] mb-4">From Observation to Evidence</h2>
              <p className="text-[#475569] text-lg leading-relaxed">
                The platform does not stop at identifying a potential issue. Findings are linked to technical evidence, reproduction steps and affected components.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 border border-[#E2E8F0] rounded-lg bg-[#F7F8FA]">
                <div className="text-xs font-bold text-[#0F172A] mb-2 uppercase tracking-wide">Source Evidence</div>
                <div className="text-sm text-[#475569]">file / module / line</div>
                <div className="mt-4 pt-4 border-t border-[#E2E8F0] text-xs text-[#64748B]">Automated observation from static analysis</div>
              </div>
              <div className="p-6 border border-[#E2E8F0] rounded-lg bg-[#F7F8FA]">
                <div className="text-xs font-bold text-[#0F172A] mb-2 uppercase tracking-wide">Runtime Evidence</div>
                <div className="text-sm text-[#475569]">request / response / behavior</div>
                <div className="mt-4 pt-4 border-t border-[#E2E8F0] text-xs text-[#64748B]">Dynamic interaction with the target</div>
              </div>
              <div className="p-6 border border-[#1D4ED8] rounded-lg bg-[#FFFFFF] shadow-sm">
                <div className="text-xs font-bold text-[#1D4ED8] mb-2 uppercase tracking-wide">Validation</div>
                <div className="text-sm text-[#0F172A] font-semibold">PoC / screenshot / test result</div>
                <div className="mt-4 pt-4 border-t border-[#E2E8F0] text-xs text-[#64748B]">Validated finding via manual or automated execution</div>
              </div>
            </div>
          </div>
        </section>

        {/* FINDING & REPORTING SECTION */}
        <section className="max-w-7xl mx-auto px-8 py-24 flex flex-col lg:flex-row gap-16 items-center">
          
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-bold text-[#0F172A]">Assessment Results That Can Be Reproduced</h2>
            <p className="text-[#475569] text-lg leading-relaxed">
              Every confirmed finding generates a structured report providing:
            </p>
            <ul className="space-y-3 text-[#0F172A] font-medium">
              <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-[#15803D] mr-3" /> vulnerability description</li>
              <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-[#15803D] mr-3" /> affected component</li>
              <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-[#15803D] mr-3" /> CWE reference & CVSS v3.1</li>
              <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-[#15803D] mr-3" /> reproduction steps</li>
              <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-[#1D4ED8] mr-3" /> proof-of-concept evidence</li>
              <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-[#15803D] mr-3" /> business impact & remediation recommendations</li>
            </ul>
          </div>

          <div className="flex-1 w-full">
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg shadow-sm p-6 w-full text-sm">
              <div className="flex justify-between items-center mb-4 border-b border-[#E2E8F0] pb-4">
                <div>
                  <div className="text-xs font-mono text-[#64748B] mb-1">WM-API-001 (Sample)</div>
                  <div className="font-bold text-[#0F172A] text-base">Residual DNS-Rebinding Window in MCP Proxy</div>
                </div>
                <div className="px-2 py-1 bg-[#FEE2E2] text-[#B91C1C] text-xs font-bold rounded">HIGH</div>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] text-[#64748B] uppercase font-bold">Affected Component</div>
                    <div className="font-mono text-xs mt-1">api/mcp-proxy.ts</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#64748B] uppercase font-bold">CVSS / CWE</div>
                    <div className="font-mono text-xs mt-1">7.5 / CWE-918</div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#64748B] uppercase font-bold mb-1">Evidence (PoC excerpt)</div>
                  <div className="bg-[#F1F5F9] border border-[#E2E8F0] p-3 rounded font-mono text-xs text-[#475569]">
                    POST /api/mcp-proxy<br/>
                    Host: worldmonitor.local<br/>
                    <br/>
                    {`{"url": "http://169.254.169.254/latest/meta-data/"}`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHY THIS APPROACH & AUTHORIZED TESTING */}
        <section className="bg-[#F1F5F9] border-y border-[#E2E8F0] py-24">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-[#0F172A]">Why This Approach</h2>
                
                <div className="flex items-start space-x-4">
                  <div className="mt-1 bg-[#FFFFFF] p-2 rounded shadow-sm border border-[#E2E8F0]"><Activity className="w-5 h-5 text-[#1D4ED8]" /></div>
                  <div>
                    <h3 className="font-bold text-[#0F172A] mb-1">AUTOMATED</h3>
                    <p className="text-sm text-[#475569]">Reduce repetitive assessment work and ensure consistent coverage across environments.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="mt-1 bg-[#FFFFFF] p-2 rounded shadow-sm border border-[#E2E8F0]"><Terminal className="w-5 h-5 text-[#1D4ED8]" /></div>
                  <div>
                    <h3 className="font-bold text-[#0F172A] mb-1">EVIDENCE-DRIVEN</h3>
                    <p className="text-sm text-[#475569]">Connect findings directly to reproducible technical evidence, removing ambiguity.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="mt-1 bg-[#FFFFFF] p-2 rounded shadow-sm border border-[#E2E8F0]"><FileText className="w-5 h-5 text-[#1D4ED8]" /></div>
                  <div>
                    <h3 className="font-bold text-[#0F172A] mb-1">ACTIONABLE</h3>
                    <p className="text-sm text-[#475569]">Translate technical observations into concrete business impact and precise remediation guidance.</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-8 rounded-lg shadow-sm flex flex-col justify-center">
                <ShieldCheck className="w-8 h-8 text-[#15803D] mb-4" />
                <h2 className="text-xl font-bold text-[#0F172A] mb-3">Designed for Controlled Assessment</h2>
                <p className="text-[#475569] leading-relaxed">
                  Active security testing is performed exclusively against an authorized local/self-hosted test environment. Production systems are strictly excluded from active exploitation, ensuring zero disruption to live operations.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="max-w-4xl mx-auto px-8 py-32 text-center">
          <h2 className="text-4xl font-bold text-[#0F172A] mb-6">Assess the Application.<br/>Understand the Risk.</h2>
          <p className="text-xl text-[#475569] mb-10">Run a controlled security assessment and turn technical observations into structured, actionable findings.</p>
          <div className="flex items-center justify-center space-x-4">
            <button 
              onClick={onLaunch}
              className="px-8 py-4 bg-[#1D4ED8] hover:bg-[#1E40AF] text-[#FFFFFF] rounded text-lg font-semibold transition-colors"
            >
              Launch Assessment
            </button>
            <button className="px-8 py-4 bg-[#FFFFFF] hover:bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0] rounded text-lg font-semibold transition-colors">
              View Methodology
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#FFFFFF] border-t border-[#E2E8F0] py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center text-[#64748B] text-sm gap-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#1D4ED8]" />
            <span className="font-semibold text-[#0F172A]">World Monitor Assessment</span>
            <span>|</span>
            <span>Security Assessment Platform</span>
          </div>
          <div className="flex items-center space-x-6 font-medium">
            <a href="#" className="hover:text-[#0F172A] transition-colors">Methodology</a>
            <a href="#" className="hover:text-[#0F172A] transition-colors">Reports</a>
            <a href="#" className="hover:text-[#0F172A] transition-colors">Documentation</a>
            <span className="text-[#0F172A]">SIH 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Subcomponents

function ProcessStep({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
    <div className="flex flex-col space-y-2">
      <div className="text-sm font-bold text-[#1D4ED8] mb-1">{num}</div>
      <h3 className="text-xl font-bold text-[#0F172A]">{title}</h3>
      <p className="text-[#475569] leading-relaxed">{desc}</p>
    </div>
  );
}

function DomainCard({ num, icon, title, desc }: { num: string, icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-[#F7F8FA] border border-[#E2E8F0] p-5 rounded hover:border-[#1D4ED8] transition-colors group">
      <div className="flex items-center justify-between mb-4">
        <div className="w-8 h-8 bg-[#FFFFFF] border border-[#E2E8F0] rounded flex items-center justify-center text-[#475569] group-hover:text-[#1D4ED8] group-hover:border-[#1D4ED8] transition-colors">
          {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-4 h-4' })}
        </div>
        <span className="text-xs font-bold text-[#64748B]">{num}</span>
      </div>
      <h3 className="text-sm font-bold text-[#0F172A] mb-2">{title}</h3>
      <p className="text-xs text-[#475569] leading-relaxed">{desc}</p>
    </div>
  );
}
