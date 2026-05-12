import { pgTable, serial, varchar, integer, text, timestamp } from 'drizzle-orm/pg-core';

// Drizzle schema — maps to real PostgreSQL table
export const agents = pgTable('rdk_agents', {
  id: serial('id').primaryKey(),
  machine: varchar('machine', { length: 50 }).notNull(),
  port: integer('port').notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('offline'),
  contextPercent: integer('context_percent'),
  activeTask: text('active_task'),
  lastHeartbeat: timestamp('last_heartbeat', { withTimezone: true }),
});

// Drizzle inferred types (alternative to Zod for DB layer)
export type AgentRow = typeof agents.$inferSelect;
export type AgentInsertRow = typeof agents.$inferInsert;
