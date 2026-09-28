import os
import shutil
from pathlib import Path
import re

def restructure_backend():
    base = Path("/Users/apple/Downloads/Aegis/backend")
    
    src = base / "src"
    src.mkdir(exist_ok=True)
    
    routes = src / "routes"
    routes.mkdir(exist_ok=True)
    
    controllers = src / "controllers"
    controllers.mkdir(exist_ok=True)

    if (base / "lib").exists():
        shutil.move(str(base / "lib"), str(src / "lib"))
    
    # 1. Create controllers/findingsController.js
    (controllers / "findingsController.js").write_text('''
const findingsStore = require('../lib/findingsStore');
const { validateFinding } = require('../lib/validateFinding');
const { runPoc } = require('../lib/pocRunner');

exports.getAllFindings = async (req, res) => {
  try {
    const findings = await findingsStore.readAll();
    res.json(findings);
  } catch (err) {
    console.error('Error reading findings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getFindingById = async (req, res) => {
  try {
    const findings = await findingsStore.readAll();
    const finding = findings.find(f => f.id === req.params.id);
    if (!finding) return res.status(404).json({ error: 'Finding not found' });
    res.json(finding);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createFinding = async (req, res) => {
  try {
    const validation = validateFinding(req.body);
    if (!validation.isValid) return res.status(400).json({ errors: validation.errors });
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
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateFinding = async (req, res) => {
  try {
    const findings = await findingsStore.readAll();
    const index = findings.findIndex(f => f.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Finding not found' });
    const updatedFinding = { ...findings[index], ...req.body, id: req.params.id };
    const validation = validateFinding(updatedFinding);
    if (!validation.isValid) return res.status(400).json({ errors: validation.errors });
    findings[index] = updatedFinding;
    await findingsStore.writeAll(findings);
    res.json(updatedFinding);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteFinding = async (req, res) => {
  try {
    const findings = await findingsStore.readAll();
    const filteredFindings = findings.filter(f => f.id !== req.params.id);
    if (findings.length === filteredFindings.length) return res.status(404).json({ error: 'Finding not found' });
    await findingsStore.writeAll(filteredFindings);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.runPoc = async (req, res) => {
  try {
    const findings = await findingsStore.readAll();
    const index = findings.findIndex(f => f.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Finding not found in store' });
    const result = await runPoc(req.params.id);
    findings[index] = { ...findings[index], pocEvidence: result.evidence, lastPocRunAt: result.timestamp, lastPocSuccess: result.success };
    await findingsStore.writeAll(findings);
    res.json(findings[index]);
  } catch (err) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'No PoC script registered for this finding id' });
    res.status(500).json({ error: 'Internal server error' });
  }
};
''')

    # 2. Create controllers/systemController.js
    (controllers / "systemController.js").write_text('''
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
    
    let html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>World Monitor Security Assessment Report</title>
      <style>
        body { font-family: Georgia, serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
        h1, h2, h3, h4 { font-family: Helvetica, Arial, sans-serif; color: #111; }
        .cover-page { text-align: center; margin-top: 100px; margin-bottom: 200px; }
        .summary-box { border: 1px solid #ccc; padding: 20px; display: inline-block; text-align: left; background: #f9f9f9; }
        .finding { border-top: 2px solid #ccc; margin-top: 40px; padding-top: 20px; }
        .critical { color: #ef4444; font-weight: bold; }
        .high { color: #f97316; font-weight: bold; }
        .medium { color: #eab308; font-weight: bold; }
        .low { color: #3b82f6; font-weight: bold; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
      </style>
      </head><body>
      <div class="cover-page">
        <h1>World Monitor Security Assessment</h1>
        <h2>Executive Report</h2>
        <div class="summary-box">
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Total Findings:</strong> ${findings.length}</p>
          <p><strong>Critical:</strong> ${severityCounts.Critical}</p>
          <p><strong>High:</strong> ${severityCounts.High}</p>
          <p><strong>Medium:</strong> ${severityCounts.Medium}</p>
          <p><strong>Low:</strong> ${severityCounts.Low}</p>
        </div>
      </div>
      <div class="page-break" style="page-break-after: always;"></div>
      <h2>Detailed Findings</h2>
    `;
    
    findings.forEach(f => {
      const cls = f.severity?.toLowerCase() || '';
      html += `<div class="finding"><h3>[${f.id}] ${f.title}</h3>
      <p><strong>Severity:</strong> <span class="${cls}">${f.severity}</span></p>
      <p><strong>Component:</strong> <code>${f.affectedComponent}</code></p>
      <p><strong>Category:</strong> ${f.category}</p>
      <h4>Description</h4><p>${f.description}</p>
      <h4>Impact</h4><p>${f.businessImpact || 'N/A'}</p>
      <h4>Remediation</h4><p>${f.remediation || 'N/A'}</p></div>`;
    });
    
    html += `</body></html>`;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    res.status(500).send('Error generating report');
  }
};
''')

    # 3. Create routes/findingsRoutes.js
    (routes / "findingsRoutes.js").write_text('''
const express = require('express');
const router = express.Router();
const findingsController = require('../controllers/findingsController');

router.get('/', findingsController.getAllFindings);
router.post('/', findingsController.createFinding);
router.get('/:id', findingsController.getFindingById);
router.put('/:id', findingsController.updateFinding);
router.delete('/:id', findingsController.deleteFinding);
router.post('/:id/run-poc', findingsController.runPoc);

module.exports = router;
''')

    # 4. Create routes/systemRoutes.js
    (routes / "systemRoutes.js").write_text('''
const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');

router.get('/target-status', systemController.getTargetStatus);
router.get('/report', systemController.getReport);

module.exports = router;
''')

    # 5. Create src/app.js
    (src / "app.js").write_text('''
const express = require('express');
const cors = require('cors');

const findingsRoutes = require('./routes/findingsRoutes');
const systemRoutes = require('./routes/systemRoutes');

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/findings', findingsRoutes);
app.use('/api', systemRoutes);

module.exports = app;
''')

    # 6. Rewrite index.js
    (base / "index.js").write_text('''
require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
''')

    # 7. Modify findingsStore to use correct path
    f_store = src / "lib" / "findingsStore.js"
    if f_store.exists():
        content = f_store.read_text()
        content = content.replace("join(__dirname, '..', 'data')", "join(__dirname, '..', '..', 'db')")
        f_store.write_text(content)

if __name__ == "__main__":
    restructure_backend()
