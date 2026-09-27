/**
 * PoC for WM-DEP-001: Denial-of-Service via Infinite Loop in image-size Dependency.
 * NOTE: This PoC does NOT make an HTTP request to targetBaseUrl. It performs a local 
 * file check only on the target repository's package-lock.json file.
 */

const fs = require('fs/promises');
const path = require('path');
const semver = require('semver');

async function run(targetBaseUrl) {
  // Step 3: This is a static dependency-audit finding, not a live network-exploitable endpoint — the PoC verifies the vulnerable version is present rather than triggering the DoS against the running app
  
  // Step 1: Run `npm audit` in the World Monitor repository root (Simulated here by statically analyzing the package-lock.json)
  const targetRepoPath = process.env.TARGET_REPO_PATH || '../../target';
  const lockfilePath = path.resolve(__dirname, '..', targetRepoPath, 'package-lock.json');
  
  try {
    const data = await fs.readFile(lockfilePath, 'utf8');
    const lockfile = JSON.parse(data);
    const vulnerableVersions = [];

    const packages = lockfile.packages || {};
    
    // Step 2: Observe image-size 0.6.3-2.0.2 flagged high severity via GHSA-5p2g-fcmc-qvqq and GHSA-w3rx-r6r6-pgpr, reached through deck.gl's texture/gltf loading chain
    for (const [pkgPath, pkgData] of Object.entries(packages)) {
      if (pkgPath.endsWith('node_modules/image-size') && pkgData.version) {
        if (semver.gte(pkgData.version, '0.6.3') && semver.lte(pkgData.version, '2.0.2')) {
          vulnerableVersions.push(`version ${pkgData.version} at path "${pkgPath}"`);
        }
      }
    }

    if (vulnerableVersions.length > 0) {
      return {
        success: true,
        evidence: `Vulnerable image-size version(s) found in package-lock.json:\n${vulnerableVersions.join('\n')}`,
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        success: false,
        evidence: 'No vulnerable image-size version found in lockfile.',
        timestamp: new Date().toISOString()
      };
    }
  } catch (err) {
    return {
      success: false,
      evidence: `package-lock.json not found or unreadable at path ${lockfilePath}; set TARGET_REPO_PATH. Error: ${err.message}`,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = { run };
