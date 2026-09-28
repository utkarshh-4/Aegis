
const findingsStore = require('../lib/findingsStore');

const TARGET_BASE_URL = process.env.TARGET_BASE_URL || 'http://localhost:3000';

exports.getTargetStatus = async (req, res) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    await fetch(TARGET_BASE_URL, { method: 'GET', signal: controller.signal, redirect: 'manual' });
    clearTimeout(timeout);
    res.json({ reachable: true, targetBaseUrl: TARGET_BASE_URL });
  } catch (err) {
    res.json({ reachable: false, targetBaseUrl: TARGET_BASE_URL });
  }
};

exports.getReport = async (req, res) => {
  try {
    const findings = await findingsStore.readAll();
    const severityCounts = {
      Critical: findings.filter(f => f.severity === 'Critical').length,
      High: findings.filter(f => f.severity === 'High').length,
      Medium: findings.filter(f => f.severity === 'Medium').length,
      Low: findings.filter(f => f.severity === 'Low').length,
      Informational: findings.filter(f => f.severity === 'Informational').length
    };
    
    let html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Security Assessment Report</title>
      <style>
        :root {
          --bg-color: #ffffff;
          --text-main: #111827;
          --text-muted: #4b5563;
          --border: #e5e7eb;
          --accent: #1f2937;
          --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          --font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
        }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        
        * { box-sizing: border-box; }
        body { 
          font-family: var(--font-sans); 
          line-height: 1.5; 
          color: var(--text-main); 
          background-color: #f3f4f6;
          margin: 0; 
          padding: 2rem;
        }
        .a4-page {
          max-width: 21cm;
          margin: 0 auto;
          background: var(--bg-color);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          padding: 4rem;
          min-height: 29.7cm;
          position: relative;
        }
        .header-bar {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 8px;
          background: linear-gradient(90deg, #111827 0%, #374151 100%);
        }
        .report-header {
          border-bottom: 2px solid var(--accent);
          padding-bottom: 2rem;
          margin-bottom: 3rem;
        }
        .title { font-size: 2.5rem; font-weight: 800; letter-spacing: -0.025em; margin: 0 0 0.5rem 0; color: #111827; text-transform: uppercase; }
        .subtitle { font-size: 1rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; }
        
        .executive-summary {
          margin-bottom: 4rem;
        }
        .executive-summary h2 {
          font-size: 1.25rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border);
          padding-bottom: 0.5rem;
          margin-bottom: 1.5rem;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .stat-box {
          border: 1px solid var(--border);
          padding: 1.25rem;
          text-align: center;
          background: #f9fafb;
        }
        .stat-val { font-size: 2rem; font-weight: 700; font-family: var(--font-mono); line-height: 1; margin-bottom: 0.5rem; }
        .stat-lbl { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600; }
        
        .finding-card {
          border: 1px solid var(--border);
          margin-bottom: 2rem;
          page-break-inside: avoid;
        }
        .finding-header {
          background: #f9fafb;
          border-bottom: 1px solid var(--border);
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .finding-id { font-family: var(--font-mono); font-weight: 700; color: var(--text-muted); margin-right: 1rem; }
        .finding-title { font-weight: 700; font-size: 1.125rem; margin: 0; flex: 1; }
        
        .badge {
          padding: 0.25rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-family: var(--font-mono);
          border: 1px solid currentColor;
        }
        .badge.critical { color: #dc2626; background: #fef2f2; }
        .badge.high { color: #ea580c; background: #fff7ed; }
        .badge.medium { color: #ca8a04; background: #fefce8; }
        .badge.low { color: #16a34a; background: #f0fdf4; }
        
        .finding-body { padding: 1.5rem; }
        .metadata-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: #f3f4f6;
          border-radius: 4px;
        }
        .meta-kv { display: flex; flex-direction: column; }
        .meta-k { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); font-weight: 600; margin-bottom: 0.25rem; }
        .meta-v { font-family: var(--font-mono); font-size: 0.875rem; font-weight: 500; }
        
        .section-title { font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin: 0 0 0.75rem 0; color: var(--accent); }
        .section-content { margin: 0 0 1.5rem 0; font-size: 0.9375rem; color: #374151; white-space: pre-wrap; }
        .section-content:last-child { margin-bottom: 0; }
        
        .poc-block { background: #111827; color: #e5e7eb; padding: 1rem; font-family: var(--font-mono); font-size: 0.8125rem; overflow-x: auto; border-radius: 4px; margin-bottom: 1.5rem; }
        
        @media print {
          body { padding: 0; background: white; }
          .a4-page { box-shadow: none; padding: 0; margin: 0; max-width: none; min-height: 0; }
        }
      </style>
      </head><body>
      <div class="a4-page">
        <div class="header-bar"></div>
        
        <div class="report-header">
          <h1 class="title">Security Assessment Report</h1>
          <div class="subtitle">World Monitor Platform &middot; Confidential</div>
        </div>
        
        <div class="executive-summary">
          <h2>Executive Summary</h2>
          <div class="stats-grid">
            <div class="stat-box"><div class="stat-val" style="color: #dc2626">${severityCounts.Critical}</div><div class="stat-lbl">Critical</div></div>
            <div class="stat-box"><div class="stat-val" style="color: #ea580c">${severityCounts.High}</div><div class="stat-lbl">High</div></div>
            <div class="stat-box"><div class="stat-val" style="color: #ca8a04">${severityCounts.Medium}</div><div class="stat-lbl">Medium</div></div>
            <div class="stat-box"><div class="stat-val" style="color: #16a34a">${severityCounts.Low}</div><div class="stat-lbl">Low</div></div>
          </div>
          <div class="metadata-grid" style="grid-template-columns: 1fr 1fr 1fr;">
            <div class="meta-kv"><span class="meta-k">Date Generated</span><span class="meta-v">${new Date().toISOString().split('T')[0]}</span></div>
            <div class="meta-kv"><span class="meta-k">Total Findings</span><span class="meta-v">${findings.length}</span></div>
            <div class="meta-kv"><span class="meta-k">Assessment ID</span><span class="meta-v">WM-SA-2026</span></div>
          </div>
        </div>
        
        <div class="executive-summary">
          <h2>Detailed Findings Log</h2>
        </div>
    `;
    
    findings.forEach(f => {
      const cls = f.severity?.toLowerCase() || 'low';
      html += `
      <div class="finding-card">
        <div class="finding-header">
          <span class="finding-id">${f.id}</span>
          <h3 class="finding-title">${f.title}</h3>
          <span class="badge ${cls}">${f.severity}</span>
        </div>
        <div class="finding-body">
          <div class="metadata-grid">
            <div class="meta-kv"><span class="meta-k">Affected Component</span><span class="meta-v">${f.affectedComponent || 'N/A'}</span></div>
            <div class="meta-kv"><span class="meta-k">Vulnerability Category</span><span class="meta-v">${f.category || 'N/A'}</span></div>
            <div class="meta-kv"><span class="meta-k">CWE / Weakness ID</span><span class="meta-v">${f.cwe || 'N/A'}</span></div>
            <div class="meta-kv"><span class="meta-k">CVSS Score</span><span class="meta-v">${f.cvssScore || 'N/A'}</span></div>
          </div>
          
          <h4 class="section-title">Technical Description</h4>
          <div class="section-content">${f.description}</div>
          
          ${f.pocEvidence ? `
          <h4 class="section-title">Proof of Concept</h4>
          <div class="poc-block">${f.pocEvidence}</div>
          ` : ''}
          
          <h4 class="section-title">Business Impact</h4>
          <div class="section-content">${f.businessImpact || 'N/A'}</div>
          
          <h4 class="section-title">Remediation Guidelines</h4>
          <div class="section-content">${f.remediation || 'N/A'}</div>
        </div>
      </div>`;
    });
    
    html += `</div></body></html>`;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    res.status(500).send('Error generating report');
  }
};
