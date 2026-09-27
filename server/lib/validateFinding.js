function validateFinding(finding) {
  const errors = [];
  const requiredFields = [
    'title',
    'description',
    'affectedComponent',
    'cwe',
    'cvssVector',
    'cvssScore',
    'severity',
    'stepsToReproduce',
    'pocEvidence',
    'businessImpact',
    'remediation',
    'disclosureStatus',
    'discoveredAt',
    'category'
  ];

  for (const field of requiredFields) {
    if (finding[field] === undefined || finding[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Type & Value Validations
  if (finding.cvssScore !== undefined && typeof finding.cvssScore !== 'number') {
    errors.push('cvssScore must be a number');
  }

  const validSeverities = ['Critical', 'High', 'Medium', 'Low', 'Informational'];
  if (finding.severity && !validSeverities.includes(finding.severity)) {
    errors.push(`severity must be one of: ${validSeverities.join(', ')}`);
  }

  if (finding.stepsToReproduce && !Array.isArray(finding.stepsToReproduce)) {
    errors.push('stepsToReproduce must be an array of strings');
  }

  const validCategories = ['auth', 'authz', 'input-validation', 'api', 'client-side', 'communication', 'data-storage'];
  if (finding.category && !validCategories.includes(finding.category)) {
    errors.push(`category must be one of: ${validCategories.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateFinding
};
