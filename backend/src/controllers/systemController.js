const findingsStore = require('../lib/findingsStore');
const PDFDocument = require('pdfkit');

const TARGET_BASE_URL = process.env.TARGET_BASE_URL || 'http://localhost:3000';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalizeEvidence(value) {
  return String(value ?? '')
    .replace(/\\n/g, '\n')
    .replace(/\\r\\n/g, '\n');
}

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
          --text-muted: #475569;
          --border: #CBD5E1;
          --accent: #172033;
          --bg-light: #F8FAFC;
          --font-sans: 'Helvetica', -apple-system, sans-serif;
          --font-mono: 'Courier', monospace;
        }
        * { box-sizing: border-box; }
        body { font-family: var(--font-sans); line-height: 1.5; color: var(--text-main); background-color: #e2e8f0; margin: 0; padding: 2rem; }
        .a4-page { max-width: 21cm; margin: 0 auto; background: var(--bg-color); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); padding: 3rem 4rem; position: relative; margin-bottom: 2rem; min-height: 29.7cm; }
        .title { font-size: 2.2rem; font-weight: bold; margin: 0; color: var(--accent); letter-spacing: -0.02em; }
        .subtitle { font-size: 1.25rem; color: var(--text-muted); margin-bottom: 0.25rem; }
        .subsubtitle { font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; font-weight: bold; }
        .divider { border-bottom: 1px solid var(--border); margin: 1.5rem 0; }
        .section-title { font-size: 0.9rem; font-weight: bold; color: var(--accent); text-transform: uppercase; margin-bottom: 0.75rem; margin-top: 1.5rem; }
        
        .meta-grid { display: grid; grid-template-columns: 120px 1fr; gap: 0.5rem; font-size: 0.85rem; }
        .meta-lbl { font-weight: bold; color: var(--text-muted); }
        .meta-val { color: var(--text-main); }
        
        .stats-grid { display: flex; gap: 1rem; }
        .stat-box { flex: 1; background: var(--bg-light); border: 1px solid var(--border); padding: 1rem; text-align: center; }
        .stat-lbl { font-size: 0.7rem; color: var(--text-muted); font-weight: bold; margin-bottom: 0.25rem; }
        .stat-val { font-size: 1.5rem; font-weight: bold; }
        
        .overview-table { width: 100%; border-collapse: collapse; font-size: 0.75rem; margin-top: 1rem; background: var(--bg-light); }
        .overview-table th, .overview-table td { padding: 0.5rem; text-align: left; border-bottom: 1px solid var(--border); }
        .overview-table th { font-weight: bold; color: var(--text-muted); }
        
        .finding-card { margin-bottom: 3rem; page-break-inside: avoid; }
        .finding-divider { border-bottom: 2px solid var(--accent); margin-bottom: 1rem; }
        .finding-id { font-size: 0.9rem; font-weight: bold; color: var(--text-muted); }
        .finding-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
        .finding-title { font-size: 1.25rem; font-weight: bold; margin: 0; max-width: 80%; }
        
        .badge { padding: 0.25rem 0.5rem; font-size: 0.7rem; font-weight: bold; color: white; border-radius: 2px; }
        .badge.critical { background: #B91C1C; }
        .badge.high { background: #C2410C; }
        .badge.medium { background: #B45309; }
        .badge.low { background: #2563EB; }
        
        .f-meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; background: var(--bg-light); padding: 0.75rem; font-size: 0.75rem; border: 1px solid var(--border); margin-bottom: 1.5rem; }
        .f-meta-item { display: flex; flex-direction: column; }
        .f-meta-lbl { font-weight: bold; color: var(--text-muted); }
        
        .f-body { font-size: 0.85rem; margin-bottom: 1rem; text-align: justify; }
        .poc-block { background: var(--bg-light); border: 1px solid var(--border); padding: 1rem; font-family: var(--font-mono); font-size: 0.75rem; overflow-x: auto; white-space: pre-wrap; margin-bottom: 1rem; }
        
        .footer { position: absolute; bottom: 2rem; left: 4rem; right: 4rem; border-top: 1px solid var(--border); padding-top: 0.5rem; display: flex; justify-content: space-between; font-size: 0.65rem; color: var(--text-muted); }
      </style>
      </head><body>
      <div class="a4-page">
        <div class="title">AEGIS</div>
        <div class="subtitle">SECURITY ASSESSMENT REPORT</div>
        <div class="subsubtitle">World Monitor Security Assessment &nbsp;|&nbsp; SYNTHETIC LOCAL SECURITY LAB</div>
        <div class="divider"></div>
        
        <div class="section-title">ASSESSMENT METADATA</div>
        <div class="meta-grid">
          <div class="meta-lbl">Target</div><div class="meta-val">http://localhost:3000</div>
          <div class="meta-lbl">Environment</div><div class="meta-val">SYNTHETIC LOCAL SECURITY LAB</div>
          <div class="meta-lbl">Assessment Type</div><div class="meta-val">Controlled Demonstration</div>
          <div class="meta-lbl">Generated</div><div class="meta-val">${new Date().toISOString().split('T')[0]}</div>
          <div class="meta-lbl">Status</div><div class="meta-val">Completed</div>
        </div>
        <div class="divider"></div>
        
        <div class="section-title">EXECUTIVE SUMMARY</div>
        <div class="stats-grid">
          <div class="stat-box"><div class="stat-lbl">TOTAL</div><div class="stat-val">${findings.length}</div></div>
          <div class="stat-box"><div class="stat-lbl">CRITICAL</div><div class="stat-val" style="color: #B91C1C">${severityCounts.Critical}</div></div>
          <div class="stat-box"><div class="stat-lbl">HIGH</div><div class="stat-val" style="color: #C2410C">${severityCounts.High}</div></div>
          <div class="stat-box"><div class="stat-lbl">MEDIUM</div><div class="stat-val" style="color: #B45309">${severityCounts.Medium}</div></div>
          <div class="stat-box"><div class="stat-lbl">LOW</div><div class="stat-val" style="color: #2563EB">${severityCounts.Low}</div></div>
        </div>
        
        <div class="section-title">ASSESSMENT SCOPE</div>
        <div class="f-body">This report documents findings produced during a controlled synthetic security assessment of a local World Monitor test target.</div>
        
        <div class="section-title">FINDINGS OVERVIEW</div>
        <table class="overview-table">
          <tr><th>ID</th><th>FINDING</th><th>SEVERITY</th><th>CWE</th><th>STATUS</th></tr>
          ${findings.map(f => `
            <tr>
              <td>${escapeHtml(f.id)}</td>
              <td>${escapeHtml(f.title.length > 55 ? f.title.substring(0,52)+'...' : f.title)}</td>
              <td style="font-weight:bold; color:${f.severity==='Critical'?'#B91C1C':f.severity==='High'?'#C2410C':f.severity==='Medium'?'#B45309':'#2563EB'}">${escapeHtml(f.severity)}</td>
              <td>${escapeHtml(f.cwe || 'Not provided')}</td>
              <td style="color:${f.lastPocSuccess ? '#15803D' : 'inherit'}">${f.lastPocSuccess ? 'Confirmed' : 'Pending'}</td>
            </tr>
          `).join('')}
        </table>
        
        <div class="footer">
          <span>AEGIS — World Monitor Security Assessment</span>
          <span>SYNTHETIC LOCAL SECURITY LAB</span>
          <span>Page 1</span>
        </div>
      </div>
      
      <div class="a4-page">
        <div style="font-weight:bold; font-size:1.1rem; color:var(--accent);">AEGIS</div>
        <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:1.5rem; border-bottom: 1px solid var(--border); padding-bottom:0.5rem;">World Monitor Security Assessment</div>
        
    `;
    
    findings.forEach(f => {
      const cls = f.severity?.toLowerCase() || 'low';
      let evText = normalizeEvidence(f.pocEvidence || 'Not provided');
      
      const stepsHTML = (f.stepsToReproduce || []).map((s, i) => `<div><span style="font-family:var(--font-mono); color:var(--text-muted); margin-right:0.5rem;">${(i+1).toString().padStart(2,'0')}</span>${escapeHtml(s)}</div>`).join('');
      
      html += `
      <div class="finding-card">
        <div class="finding-divider"></div>
        <div class="finding-id">${escapeHtml(f.id)}</div>
        <div class="finding-header">
          <div class="finding-title">${escapeHtml(f.title)}</div>
          <div class="badge ${cls}">${escapeHtml(f.severity.toUpperCase())}</div>
        </div>
        <div class="f-meta-grid">
          <div class="f-meta-item"><span class="f-meta-lbl">Severity</span><span>${escapeHtml(f.severity)}</span></div>
          <div class="f-meta-item"><span class="f-meta-lbl">CVSS</span><span>${escapeHtml(f.cvssScore || 'Not provided')}</span></div>
          <div class="f-meta-item"><span class="f-meta-lbl">CWE</span><span>${escapeHtml(f.cwe || 'Not provided')}</span></div>
          <div class="f-meta-item"><span class="f-meta-lbl">Category</span><span>${escapeHtml(f.category || 'Not provided')}</span></div>
          <div class="f-meta-item"><span class="f-meta-lbl">Component</span><span>${escapeHtml(f.affectedComponent || 'Not provided')}</span></div>
          <div class="f-meta-item"><span class="f-meta-lbl">Status</span><span>${f.lastPocSuccess ? 'Confirmed' : 'Pending'}</span></div>
        </div>
        
        <div class="section-title">1. DESCRIPTION</div>
        <div class="f-body">${escapeHtml(f.description)}</div>
        
        ${f.stepsToReproduce && f.stepsToReproduce.length > 0 ? `
        <div class="section-title">2. STEPS TO REPRODUCE</div>
        <div class="f-body">${stepsHTML}</div>
        ` : ''}
        
        <div class="section-title">3. PROOF OF CONCEPT / EVIDENCE</div>
        <div class="poc-block">${escapeHtml(evText)}</div>
        
        <div class="section-title">4. BUSINESS IMPACT</div>
        <div class="f-body">${escapeHtml(f.businessImpact || 'Not provided')}</div>
        
        <div class="section-title">5. REMEDIATION</div>
        <div class="f-body">${escapeHtml(f.remediation || 'Not provided')}</div>
        
        <div class="section-title">6. DISCLOSURE STATUS</div>
        <div class="f-body">${escapeHtml(f.disclosureStatus || 'Not recorded')}</div>
      </div>`;
    });
    
    html += `
        <div class="footer">
          <span>AEGIS — World Monitor Security Assessment</span>
          <span>SYNTHETIC LOCAL SECURITY LAB</span>
          <span>Detailed Findings</span>
        </div>
      </div>
    </body></html>`;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating report');
  }
};

exports.getReportPdf = async (req, res) => {
  try {
    const findings = await findingsStore.readAll();
    const severityCounts = {
      Critical: findings.filter(f => f.severity === 'Critical').length,
      High: findings.filter(f => f.severity === 'High').length,
      Medium: findings.filter(f => f.severity === 'Medium').length,
      Low: findings.filter(f => f.severity === 'Low').length
    };
    
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 60, bottom: 60, left: 45, right: 45 },
      bufferPages: true,
      autoFirstPage: true
    });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Aegis-Security-Assessment-Report.pdf"');
    doc.pipe(res);
    
    // Page 1: Cover
    doc.font('Helvetica-Bold').fontSize(22).fillColor('#172033').text('AEGIS');
    doc.fontSize(14).fillColor('#475569').text('SECURITY ASSESSMENT REPORT');
    doc.fontSize(10).fillColor('#475569').text('World Monitor Security Assessment   |   SYNTHETIC LOCAL SECURITY LAB');
    
    doc.moveDown(1);
    doc.moveTo(45, doc.y).lineTo(550, doc.y).strokeColor('#CBD5E1').lineWidth(1).stroke();
    doc.moveDown(1.5);
    
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#172033').text('ASSESSMENT METADATA');
    doc.moveDown(0.5);
    
    const drawMetaRow = (label, value) => {
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#475569').text(label, { continued: true, width: 100 });
      doc.font('Helvetica').fillColor('#111827').text(`  ${value}`);
      doc.moveDown(0.2);
    };
    
    drawMetaRow('Target', TARGET_BASE_URL);
    drawMetaRow('Environment', 'SYNTHETIC LOCAL SECURITY LAB');
    drawMetaRow('Assessment Type', 'Controlled Demonstration');
    drawMetaRow('Generated', new Date().toISOString().split('T')[0]);
    drawMetaRow('Status', 'Completed');
    
    doc.moveDown(1);
    doc.moveTo(45, doc.y).lineTo(550, doc.y).strokeColor('#CBD5E1').lineWidth(1).stroke();
    doc.moveDown(1.5);
    
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#172033').text('EXECUTIVE SUMMARY');
    doc.moveDown(0.5);
    
    const startX = 45;
    const startY = doc.y;
    const boxWidth = 98;
    const boxHeight = 50;
    
    const drawBox = (x, y, title, val, color) => {
      doc.rect(x, y, boxWidth, boxHeight).fillAndStroke('#F8FAFC', '#CBD5E1');
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#475569').text(title, x, y + 10, { width: boxWidth, align: 'center' });
      doc.font('Helvetica-Bold').fontSize(18).fillColor(color).text(val, x, y + 25, { width: boxWidth, align: 'center' });
    };
    
    drawBox(startX, startY, 'TOTAL', findings.length.toString(), '#111827');
    drawBox(startX + 101, startY, 'CRITICAL', severityCounts.Critical.toString(), '#B91C1C');
    drawBox(startX + 202, startY, 'HIGH', severityCounts.High.toString(), '#C2410C');
    drawBox(startX + 303, startY, 'MEDIUM', severityCounts.Medium.toString(), '#B45309');
    drawBox(startX + 404, startY, 'LOW', severityCounts.Low.toString(), '#2563EB');
    
    doc.y = startY + boxHeight + 20;
    
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#172033').text('ASSESSMENT SCOPE');
    doc.moveDown(0.3);
    doc.font('Helvetica').fontSize(9).fillColor('#111827').text('This report documents findings produced during a controlled synthetic security assessment of a local World Monitor test target.');
    
    doc.moveDown(1.5);
    
    if (doc.y < 650 && findings.length > 0) {
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#172033').text('FINDINGS OVERVIEW');
      doc.moveDown(0.5);
      
      const colId = 45, colTitle = 120, colSev = 380, colCwe = 435, colStatus = 495;
      doc.rect(45, doc.y, 505, 20).fill('#F8FAFC');
      const ty = doc.y + 6;
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#475569');
      doc.text('ID', colId + 5, ty);
      doc.text('FINDING', colTitle, ty);
      doc.text('SEVERITY', colSev, ty);
      doc.text('CWE', colCwe, ty);
      doc.text('STATUS', colStatus, ty);
      doc.moveDown(1.5);
      
      findings.forEach(f => {
        let ty2 = doc.y;
        doc.font('Helvetica').fontSize(8).fillColor('#111827');
        doc.text(f.id, colId + 5, ty2);
        doc.text(f.title.length > 50 ? f.title.substring(0, 47) + '...' : f.title, colTitle, ty2);
        
        let sevColor = '#475569';
        if (f.severity === 'Critical') sevColor = '#B91C1C';
        if (f.severity === 'High') sevColor = '#C2410C';
        if (f.severity === 'Medium') sevColor = '#B45309';
        if (f.severity === 'Low') sevColor = '#2563EB';
        
        doc.fillColor(sevColor).font('Helvetica-Bold').text(f.severity, colSev, ty2);
        doc.fillColor('#475569').font('Helvetica').text(f.cwe || 'Not provided', colCwe, ty2);
        doc.fillColor(f.lastPocSuccess ? '#15803D' : '#475569').text(f.lastPocSuccess ? 'Confirmed' : 'Pending', colStatus, ty2);
        doc.moveDown(1);
        doc.moveTo(45, doc.y - 2).lineTo(550, doc.y - 2).strokeColor('#E2E8F0').lineWidth(0.5).stroke();
      });
    }
    
    const checkSpace = (requiredHeight) => {
      if (doc.y + requiredHeight > 740) {
        doc.addPage();
      }
    };
    
    if (findings.length > 0) {
      doc.addPage();
      
      findings.forEach(f => {
        checkSpace(160);
        
        doc.moveTo(45, doc.y).lineTo(550, doc.y).strokeColor('#172033').lineWidth(1.5).stroke();
        doc.moveDown(0.5);
        
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#475569').text(f.id);
        
        let sevColor = '#475569';
        if (f.severity === 'Critical') sevColor = '#B91C1C';
        if (f.severity === 'High') sevColor = '#C2410C';
        if (f.severity === 'Medium') sevColor = '#B45309';
        if (f.severity === 'Low') sevColor = '#2563EB';
        
        const titleY = doc.y;
        doc.font('Helvetica-Bold').fontSize(14).fillColor('#111827').text(f.title, 45, titleY, { width: 420 });
        doc.rect(480, titleY, 70, 16).fillAndStroke(sevColor, sevColor);
        doc.fillColor('#FFFFFF').fontSize(8).text(f.severity.toUpperCase(), 480, titleY + 4, { width: 70, align: 'center' });
        doc.moveDown(1);
        
        doc.x = 45; // reset x
        
        const gridY = doc.y;
        doc.rect(45, gridY, 505, 45).fill('#F8FAFC');
        
        const mCol1 = 55, mCol2 = 250, mCol3 = 400;
        let gy = gridY + 8;
        
        const drawGridItem = (x, y, label, val) => {
          doc.font('Helvetica-Bold').fontSize(8).fillColor('#475569').text(label, x, y);
          doc.font('Helvetica').fontSize(8).fillColor('#111827').text(val || 'Not provided', x + 55, y);
        };
        
        drawGridItem(mCol1, gy, 'Severity', f.severity);
        drawGridItem(mCol2, gy, 'CVSS', f.cvssScore ? f.cvssScore.toString() : 'Not provided');
        drawGridItem(mCol3, gy, 'CWE', f.cwe || 'Not provided');
        
        gy += 15;
        drawGridItem(mCol1, gy, 'Category', f.category || 'Not provided');
        drawGridItem(mCol2, gy, 'Component', f.affectedComponent || 'Not provided');
        const statusText = f.lastPocSuccess ? 'Confirmed' : 'Pending';
        drawGridItem(mCol3, gy, 'Status', statusText);
        
        doc.y = gridY + 60;
        doc.x = 45; // reset
        
        const drawSection = (title, content, isEvidence = false) => {
          if (!content) return;
          checkSpace(50);
          
          doc.font('Helvetica-Bold').fontSize(9).fillColor('#172033').text(title);
          doc.moveDown(0.3);
          
          if (isEvidence) {
            let evText = content;
            if (typeof evText === 'string') {
              evText = evText.replace(/\\n/g, '\n').replace(/\\r\\n/g, '\n');
            }
            
            const h = doc.heightOfString(evText, { font: 'Courier', fontSize: 8, width: 485 });
            checkSpace(h + 25);
            
            doc.rect(45, doc.y, 505, h + 15).fillAndStroke('#F8FAFC', '#CBD5E1');
            doc.font('Courier').fontSize(8).fillColor('#111827').text(evText, 55, doc.y + 8, { width: 485 });
            doc.moveDown(1.5);
          } else {
            doc.font('Helvetica').fontSize(9).fillColor('#111827').text(content, { width: 505, align: 'justify' });
            doc.moveDown(1);
          }
        };
        
        drawSection('1. DESCRIPTION', f.description);
        
        if (f.stepsToReproduce && f.stepsToReproduce.length > 0) {
          checkSpace(50);
          doc.font('Helvetica-Bold').fontSize(9).fillColor('#172033').text('2. STEPS TO REPRODUCE');
          doc.moveDown(0.3);
          f.stepsToReproduce.forEach((step, idx) => {
            const num = (idx + 1).toString().padStart(2, '0');
            doc.font('Courier-Bold').fontSize(9).fillColor('#475569').text(num, 45, doc.y, { continued: true });
            doc.font('Helvetica').fontSize(9).fillColor('#111827').text(`   ${step}`);
          });
          doc.moveDown(1);
        }
        
        drawSection('3. PROOF OF CONCEPT / EVIDENCE', f.pocEvidence, true);
        drawSection('4. BUSINESS IMPACT', f.businessImpact);
        drawSection('5. REMEDIATION', f.remediation);
        drawSection('6. DISCLOSURE STATUS', f.disclosureStatus || 'Not recorded');
        
        doc.moveDown(1);
      });
    }
    
    // Global Header & Footer pass
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      let oldBottomMargin = doc.page.margins.bottom;
      doc.page.margins.bottom = 0; // Prevent auto page-break
      
      const isCover = (i === 0);
      
      if (!isCover) {
        doc.font('Helvetica-Bold').fontSize(14).fillColor('#172033').text('AEGIS', 45, 30);
        doc.font('Helvetica').fontSize(9).fillColor('#475569').text('World Monitor Security Assessment', 45, 46);
        doc.moveTo(45, 60).lineTo(550, 60).strokeColor('#CBD5E1').lineWidth(1).stroke();
      }
      
      doc.moveTo(45, 790).lineTo(550, 790).strokeColor('#CBD5E1').lineWidth(1).stroke();
      doc.font('Helvetica').fontSize(7.5).fillColor('#475569');
      doc.text('AEGIS — World Monitor Security Assessment', 45, 800, { lineBreak: false });
      doc.text('SYNTHETIC LOCAL SECURITY LAB', 250, 800, { lineBreak: false });
      doc.text(`Page ${i + 1} of ${pages.count}`, 450, 800, { width: 100, align: 'right', lineBreak: false });
      
      doc.page.margins.bottom = oldBottomMargin;
    }
    
    doc.end();
  } catch (err) {
    console.error('Report generation failed:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to generate report' });
    }
  }
};
