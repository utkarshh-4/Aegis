const fs = require('fs');
const path = require('path');

async function runPoc(findingId) {
  const targetBaseUrl = process.env.TARGET_BASE_URL || 'http://localhost:3000';
  const pocPath = path.join(__dirname, '..', 'pocs', `${findingId}.js`);
  
  if (!fs.existsSync(pocPath)) {
    throw new Error('NOT_FOUND');
  }

  // Dynamically require the requested PoC module
  const pocModule = require(pocPath);
  
  if (typeof pocModule.run !== 'function') {
    throw new Error('PoC module does not export a run function');
  }

  const startTime = Date.now();
  
  // Call the PoC's run function with the target base URL
  const result = await pocModule.run(targetBaseUrl);
  
  const durationMs = Date.now() - startTime;

  // Enhance the result returned by the PoC with the ID and timing
  return {
    ...result,
    findingId,
    durationMs
  };
}

module.exports = {
  runPoc
};
