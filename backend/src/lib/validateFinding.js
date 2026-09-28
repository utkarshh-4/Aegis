exports.validateFinding = (data) => {
  const errors = [];
  if (!data.title) errors.push('Title is required');
  if (!data.severity) errors.push('Severity is required');
  if (!data.category) errors.push('Category is required');
  return {
    isValid: errors.length === 0,
    errors
  };
};
