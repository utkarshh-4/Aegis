/**
 * PoC for WM-API-001: MCP Proxy Authentication Gate Verification 
 * (SSRF Defense-in-Depth Precondition Check)
 */

async function run(targetBaseUrl) {
  // Step 3: This PoC intentionally does NOT attempt to bypass authentication or trigger the DNS-rebinding condition itself (out of safe-testing scope) — it verifies the documented defense-in-depth precondition (auth gate) that limits exploitability of the maintainer-acknowledged residual SSRF/DNS-rebinding risk (issue #5061 / GHSA-887j-p88r-qmm9) is actually enforced at runtime
  
  try {
    const url = new URL('/api/mcp-proxy?serverUrl=https://example.com', targetBaseUrl.trim()).toString();
    
    // Step 1: Send an unauthenticated GET request to targetBaseUrl + '/api/mcp-proxy?serverUrl=https://example.com' with no Authorization header and no API key headers
    // Note: We supply a descriptive User-Agent to avoid getting rejected by the baseline WAF before reaching the auth gate.
    // We also request JSON and disable redirects to ensure we see the raw 401 API response.
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'WM-Toolkit-Security-Scanner/1.0',
        'Accept': 'application/json'
      },
      redirect: 'manual'
    });
    
    const status = res.status;
    const bodyText = await res.text();
    
    // Step 2: Observe the response returns HTTP 401 with a JSON body containing an error indicating Pro authentication is required, confirming the Pro-auth gate (resolvePremiumCallerIdentity) is active in front of the SSRF-sensitive proxy logic before any outbound fetch or DNS resolution can occur
    if (status === 401) {
      return {
        success: true,
        evidence: `Auth gate correctly enforced. Status: 401. Body: ${bodyText}`,
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        success: false,
        evidence: `Auth gate not enforced properly. Expected 401, got Status: ${status}. Body: ${bodyText}`,
        timestamp: new Date().toISOString()
      };
    }
  } catch (err) {
    return {
      success: false,
      evidence: `Failed to execute request: ${err.message}`,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = { run };
