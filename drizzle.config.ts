import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:BLO%2BK3l%2FzW7udHplGXNY5s6uGeCn8v64wqhOLB3Q2lU%3D@localhost:5434/rdk_sandbox',
  },
});
