# Vulnerability Finding Schema (fixed — do not modify field names)

Each finding is an object with exactly these fields:

- id: string, format "WM-<CATEGORY>-<3digit>", e.g. "WM-API-001"
- title: string
- description: string
- affectedComponent: string (file path or endpoint)
- cwe: string, e.g. "CWE-918"
- cvssVector: string, e.g. "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N"
- cvssScore: number (0.0–10.0)
- severity: one of "Critical" | "High" | "Medium" | "Low" | "Informational"
- stepsToReproduce: string[] (ordered array)
- pocEvidence: string (text log, request/response transcript, or path to screenshot)
- businessImpact: string
- remediation: string
- disclosureStatus: string, e.g. "Local test-bed only — not applicable to production" or "Reported to maintainer on <date>"
- discoveredAt: ISO date string
- category: one of "auth" | "authz" | "input-validation" | "api" | "client-side" | "communication" | "data-storage"