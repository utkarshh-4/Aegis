exports.runPoc = async (id) => {
  // Mock PoC runner
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        evidence: `[POC EXECUTION] Verified finding ${id}\\nTarget: http://localhost:3000\\nPayload: ' OR 1=1--\\nResult: Bypass successful`,
        timestamp: new Date().toISOString()
      });
    }, 1500);
  });
};
