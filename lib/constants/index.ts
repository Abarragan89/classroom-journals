export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Jotter Blog'
export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

// Master switch for all OpenAI-backed features: rubric autograde, exit ticket
// auto-grading, and rubric file import. When false, no jobs are queued and no
// data is sent to OpenAI.
export const AI_FEATURES_ENABLED = false
