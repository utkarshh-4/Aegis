const fs = require('fs').promises;
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'db', 'findings.json');

exports.readAll = async () => {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

exports.writeAll = async (findings) => {
  await fs.writeFile(DB_PATH, JSON.stringify(findings, null, 2), 'utf8');
};
