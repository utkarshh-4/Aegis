require('dotenv').config();
const express = require('express');
const cors = require('cors');
const findingsStore = require('./lib/findingsStore');
const { validateFinding } = require('./lib/validateFinding');
const { runPoc } = require('./lib/pocRunner');

const app = express();
const PORT = process.env.PORT || 4000;
const TARGET_BASE_URL = process.env.TARGET_BASE_URL || 'http://localhost:3000';

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// GET all findings
app.get('/api/findings', async (req, res) => {
  try {
    const findings = await findingsStore.readAll();
    res.json(findings);
  } catch (err) {
    console.error('Error reading findings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET finding by ID
app.get('/api/findings/:id', async (req, res) => {
  try {
    const findings = await findingsStore.readAll();
    const finding = findings.find(f => f.id === req.params.id);
    if (!finding) {
      return res.status(404).json({ error: 'Finding not found' });
    }
    res.json(finding);
  } catch (err) {
    console.error('Error reading finding:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST new finding
app.post('/api/findings', async (req, res) => {
  try {
    const validation = validateFinding(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const findings = await findingsStore.readAll();
    
    let newId = req.body.id;
    if (!newId) {
      const cat = req.body.category ? req.body.category.toUpperCase() : 'UNKNOWN';
      const random3Digit = String(Math.floor(Math.random() * 900) + 100);
      newId = `WM-${cat}-${random3Digit}`;
    }

    const newFinding = { ...req.body, id: newId };
    findings.push(newFinding);
    await findingsStore.writeAll(findings);
    
    res.status(201).json(newFinding);
  } catch (err) {
    console.error('Error creating finding:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT (update) finding by ID
app.put('/api/findings/:id', async (req, res) => {
  try {
    const findings = await findingsStore.readAll();
    const index = findings.findIndex(f => f.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Finding not found' });
    }

    const updatedFinding = { ...findings[index], ...req.body, id: req.params.id };
    const validation = validateFinding(updatedFinding);
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    findings[index] = updatedFinding;
    await findingsStore.writeAll(findings);
    
    res.json(updatedFinding);
  } catch (err) {
    console.error('Error updating finding:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE finding by ID
app.delete('/api/findings/:id', async (req, res) => {
  try {
    const findings = await findingsStore.readAll();
    const filteredFindings = findings.filter(f => f.id !== req.params.id);
    
    if (findings.length === filteredFindings.length) {
      return res.status(404).json({ error: 'Finding not found' });
    }

    await findingsStore.writeAll(filteredFindings);
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting finding:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Run PoC
app.post('/api/findings/:id/run-poc', async (req, res) => {
  try {
    const findings = await findingsStore.readAll();
    const index = findings.findIndex(f => f.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Finding not found in store' });
    }

    const result = await runPoc(req.params.id);
    
    findings[index] = {
      ...findings[index],
      pocEvidence: result.evidence,
      lastPocRunAt: result.timestamp,
      lastPocSuccess: result.success
    };

    await findingsStore.writeAll(findings);

    res.json(findings[index]);
  } catch (err) {
    if (err.message === 'NOT_FOUND') {
      return res.status(404).json({ error: 'No PoC script registered for this finding id' });
    }
    console.error(`Error running PoC for ${req.params.id}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check target status
app.get('/api/target-status', async (req, res) => {
  try {
    const targetBaseUrl = process.env.TARGET_BASE_URL.trim();
    // Use an AbortController to set a short timeout for the ping
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    // We do a simple GET request to the root (or any known fast endpoint)
    await fetch(targetBaseUrl, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'manual'
    });
    
    clearTimeout(timeout);
    res.json({ reachable: true, targetBaseUrl });
  } catch (err) {
    res.json({ reachable: false, targetBaseUrl: process.env.TARGET_BASE_URL.trim() });
  }
});

// Export Report
app.get('/api/report', async (req, res) => {
  try {
    const findings = await findingsStore.readAll();
    const severityCounts = {
      Critical: findings.filter(f => f.severity === 'Critical').length,
      High: findings.filter(f => f.severity === 'High').length,
      Medium: findings.filter(f => f.severity === 'Medium').length,
      Low: findings.filter(f => f.severity === 'Low').length,
      Informational: findings.filter(f => f.severity === 'Informational').length
    };
    
    const getSeverityColor = (severity) => {
      switch (severity?.toLowerCase()) {
        case 'critical': return '#ef4444'; // red-500
        case 'high': return '#f97316'; // orange-500
        case 'medium': return '#eab308'; // yellow-500
        case 'low': return '#3b82f6'; // blue-500
        default: return '#64748b'; // slate-500
      }
    };

    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>World Monitor Security Assessment Report</title>
  <style>
    body { font-family: Georgia, serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
    h1, h2, h3, h4 { font-family: Helvetica, Arial, sans-serif; color: #111; }
    .cover-page { text-align: center; margin-top: 100px; margin-bottom: 200px; }
    .cover-page h1 { font-size: 2.5em; margin-bottom: 10px; }
    .cover-page h2 { font-size: 1.5em; color: #555; margin-bottom: 40px; font-weight: normal; }
    .summary-box { border: 1px solid #ccc; padding: 20px; display: inline-block; text-align: left; background: #f9f9f9; }
    .summary-box h3 { margin-top: 0; }
    .finding-section { page-break-before: always; margin-top: 40px; padding-left: 20px; border-left: 6px solid #ccc; }
    .finding-header { margin-bottom: 20px; }
    .finding-header h2 { margin-bottom: 5px; }
    .finding-header p { margin: 0; font-size: 0.9em; color: #666; }
    .field { margin-bottom: 15px; }
    .field-label { font-weight: bold; font-family: Helvetica, Arial, sans-serif; display: block; margin-bottom: 5px; color: #222; }
    .field-value { margin: 0; }
    pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; font-family: monospace; font-size: 0.9em; white-space: pre-wrap; word-wrap: break-word; }
    ol { margin: 0; padding-left: 20px; }
    li { margin-bottom: 5px; }
  </style>
</head>
<body>
  <div class="cover-page">
    <h1>World Monitor Security Assessment Report</h1>
    <h2>Generated on ${new Date().toLocaleDateString()}</h2>
    
    <div class="summary-box">
      <h3>Findings Summary</h3>
      <div><strong style="color: #ef4444">Critical:</strong> ${severityCounts.Critical}</div>
      <div><strong style="color: #f97316">High:</strong> ${severityCounts.High}</div>
      <div><strong style="color: #eab308">Medium:</strong> ${severityCounts.Medium}</div>
      <div><strong style="color: #3b82f6">Low:</strong> ${severityCounts.Low}</div>
      <div><strong style="color: #64748b">Informational:</strong> ${severityCounts.Informational}</div>
      <div style="margin-top: 10px; border-top: 1px solid #ddd; padding-top: 10px;"><strong>Total Findings:</strong> ${findings.length}</div>
    </div>
  </div>
`;

    findings.forEach(f => {
      const color = getSeverityColor(f.severity);
      html += `
  <div class="finding-section" style="border-left-color: ${color}">
    <div class="finding-header">
      <h2>${f.id} - ${f.title}</h2>
      <p><strong>Severity:</strong> <span style="color: ${color}; font-weight: bold;">${f.severity}</span> &nbsp;|&nbsp; <strong>Category:</strong> ${f.category} &nbsp;|&nbsp; <strong>Discovered:</strong> ${f.discoveredAt || 'N/A'}</p>
    </div>
    
    <div class="field">
      <span class="field-label">Vulnerability Title</span>
      <div class="field-value">${f.title}</div>
    </div>
    
    <div class="field">
      <span class="field-label">Description</span>
      <div class="field-value">${f.description || 'N/A'}</div>
    </div>
    
    <div class="field">
      <span class="field-label">Affected Component</span>
      <div class="field-value">${f.affectedComponent || 'N/A'}</div>
    </div>
    
    <div class="field">
      <span class="field-label">CWE Reference</span>
      <div class="field-value">${f.cwe || 'N/A'}</div>
    </div>
    
    <div class="field">
      <span class="field-label">CVSS Score & Vector</span>
      <div class="field-value">${f.cvssScore !== undefined ? f.cvssScore : 'N/A'} (${f.cvssVector || 'N/A'})</div>
    </div>
    
    <div class="field">
      <span class="field-label">Severity</span>
      <div class="field-value">${f.severity || 'N/A'}</div>
    </div>
    
    <div class="field">
      <span class="field-label">Steps to Reproduce</span>
      <div class="field-value">
        ${f.stepsToReproduce && f.stepsToReproduce.length > 0 
          ? `<ol>${f.stepsToReproduce.map(step => `<li>${step}</li>`).join('')}</ol>`
          : 'N/A'}
      </div>
    </div>
    
    <div class="field">
      <span class="field-label">Proof of Concept</span>
      <div class="field-value">
        <pre>${f.pocEvidence || '// No evidence collected yet'}</pre>
      </div>
    </div>
    
    <div class="field">
      <span class="field-label">Business Impact</span>
      <div class="field-value">${f.businessImpact || 'N/A'}</div>
    </div>
    
    <div class="field">
      <span class="field-label">Remediation</span>
      <div class="field-value">${f.remediation || 'N/A'}</div>
    </div>
    
    <div class="field">
      <span class="field-label">Disclosure Status</span>
      <div class="field-value">${f.disclosureStatus || 'N/A'}</div>
    </div>
  </div>`;
    });

    html += `
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('Error generating report:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Targeting Base URL: ${TARGET_BASE_URL}`);
});
