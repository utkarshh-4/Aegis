const assessmentsStore = require('../lib/assessmentsStore');

// Allowlist of safe domains/hosts for testing
const ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'worldmonitor-target'];
const BLOCKED_DOMAINS = ['worldmonitor.app', 'production'];

exports.validateScope = async (req, res) => {
  try {
    const { targetUrl } = req.body;
    if (!targetUrl) return res.status(400).json({ valid: false, reason: 'Target URL is required' });

    try {
      const parsedUrl = new URL(targetUrl);
      const host = parsedUrl.hostname;

      if (BLOCKED_DOMAINS.some(domain => host.includes(domain))) {
        return res.json({ 
          valid: false, 
          reason: 'Target is outside authorized assessment scope. Production targets are blocked.' 
        });
      }

      if (!ALLOWED_HOSTS.includes(host) && !host.endsWith('.local')) {
        return res.json({ 
          valid: false, 
          reason: 'Target host is not in the authorized lab allowlist.' 
        });
      }

      return res.json({ valid: true, reason: 'Target is within authorized scope.' });
    } catch (e) {
      return res.json({ valid: false, reason: 'Invalid URL format' });
    }
  } catch (err) {
    res.status(500).json({ valid: false, reason: 'Internal validation error' });
  }
};

exports.createAssessment = async (req, res) => {
  try {
    const { name, targetUrl, repository, commit, environment, scanProfile } = req.body;
    
    // Server-side double check of scope
    try {
      const host = new URL(targetUrl).hostname;
      if (BLOCKED_DOMAINS.some(domain => host.includes(domain))) {
        return res.status(403).json({ error: 'Unauthorized target scope' });
      }
    } catch(e) {
      return res.status(400).json({ error: 'Invalid target URL' });
    }

    const assessment = {
      id: `WM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      targetUrl,
      repository,
      commit,
      environment,
      scanProfile,
      status: 'CREATED',
      createdAt: new Date().toISOString(),
      scanners: {
        semgrep: { status: 'PENDING' },
        gitleaks: { status: 'PENDING' },
        trivy: { status: 'PENDING' },
        zap: { status: 'PENDING' }
      }
    };

    await assessmentsStore.create(assessment);
    res.status(201).json(assessment);
  } catch (err) {
    res.status(500).json({ error: 'Error creating assessment' });
  }
};

exports.listAssessments = async (req, res) => {
  try {
    const assessments = await assessmentsStore.readAll();
    res.json(assessments);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching assessments' });
  }
};

exports.getAssessment = async (req, res) => {
  try {
    const assessment = await assessmentsStore.getById(req.params.id);
    if (!assessment) return res.status(404).json({ error: 'Not found' });
    res.json(assessment);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching assessment' });
  }
};
