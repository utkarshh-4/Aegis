const fs = require('fs').promises;
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'db', 'findings.json');
const SYNTHETIC_DB_PATH = path.join(__dirname, '..', '..', 'db', 'synthetic_findings.json');

const getActivePath = () => {
  return process.env.USE_SYNTHETIC_DATA === 'true' ? SYNTHETIC_DB_PATH : DB_PATH;
};

exports.readAll = async () => {
  try {
    const data = await fs.readFile(getActivePath(), 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

exports.writeAll = async (findings) => {
  await fs.writeFile(getActivePath(), JSON.stringify(findings, null, 2), 'utf8');
};
