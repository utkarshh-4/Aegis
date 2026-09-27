const fs = require('fs/promises');
const path = require('path');

const dataFile = path.join(__dirname, '..', 'data', 'findings.json');

async function readAll() {
  try {
    const data = await fs.readFile(dataFile, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

async function writeAll(findings) {
  await fs.writeFile(dataFile, JSON.stringify(findings, null, 2), 'utf8');
}

module.exports = {
  readAll,
  writeAll
};
