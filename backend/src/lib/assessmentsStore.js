const fs = require('fs').promises;
const path = require('path');

const DB_PATH = path.join(__dirname, '../../db/assessments.json');

async function ensureDb() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify([]));
  }
}

async function readAll() {
  await ensureDb();
  const data = await fs.readFile(DB_PATH, 'utf8');
  return JSON.parse(data);
}

async function writeAll(assessments) {
  await ensureDb();
  await fs.writeFile(DB_PATH, JSON.stringify(assessments, null, 2));
}

async function create(assessment) {
  const assessments = await readAll();
  assessments.push(assessment);
  await writeAll(assessments);
  return assessment;
}

async function getById(id) {
  const assessments = await readAll();
  return assessments.find(a => a.id === id);
}

module.exports = {
  readAll,
  writeAll,
  create,
  getById
};
