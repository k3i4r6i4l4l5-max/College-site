export const average = values => values.length
  ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
  : 0;
