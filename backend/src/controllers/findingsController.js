
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
