// Database layer — schema exports only
// Runtime queries go through Hasura (see hasura.ts)
// Direct pg Pool is only used by seed.ts (CLI tool, not runtime)
export * as schema from './schema';

// Re-export hasura for convenience
export { hasuraQuery } from './hasura';
