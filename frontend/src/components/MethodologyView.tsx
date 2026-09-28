

export default function MethodologyView() {
  return (
    <div className="max-w-screen-xl mx-auto space-y-6 p-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold text-textMain">Testing Methodology</h1>
      </div>
      <div className="prose prose-sm max-w-none text-textMain">
        <h2 className="text-lg font-semibold mt-4 mb-2">1. Scope Validation</h2>
        <p className="text-textMuted mb-4">Initial validation of the target environment to ensure authorization and connectivity.</p>
        
        <h2 className="text-lg font-semibold mt-4 mb-2">2. Attack Surface Discovery</h2>
        <p className="text-textMuted mb-4">Mapping of endpoints, API routes, client modules, and trust boundaries.</p>

        <h2 className="text-lg font-semibold mt-4 mb-2">3. Vulnerability Scanning</h2>
        <p className="text-textMuted mb-4">Execution of Static Application Security Testing (SAST), Dynamic Application Security Testing (DAST), and Dependency analysis.</p>

        <h2 className="text-lg font-semibold mt-4 mb-2">4. Triage and Correlation</h2>
        <p className="text-textMuted mb-4">Automated validation of findings via Proof of Concept (PoC) executions to filter out false positives.</p>
      </div>
    </div>
  );
}
