/**
 * Example PoC: Checks if the target root URL returns a Content-Security-Policy header.
 * Must export a single async function `run(targetBaseUrl)` returning { success, evidence, timestamp }.
 */
async function run(targetBaseUrl) {
  try {
    // Note: Node 18+ has a built-in fetch API
    const res = await fetch(`${targetBaseUrl}/`);
    const csp = res.headers.get('content-security-policy');
    
    if (csp) {
      return {
        success: true,
        evidence: `Target returned CSP header: ${csp}`,
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        success: false,
        evidence: 'Target did not return a Content-Security-Policy header in the response.',
        timestamp: new Date().toISOString()
      };
    }
  } catch (err) {
    return {
      success: false,
      evidence: `Failed to connect to target or retrieve headers: ${err.message}`,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = { run };
