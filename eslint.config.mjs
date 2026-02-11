// eslint.config.mjs
import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextVitals,
  // Add global ignores if needed (default ignores are already included in nextVitals)
];

export default config;