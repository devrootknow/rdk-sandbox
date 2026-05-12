import { z } from 'zod';

// Single Source of Truth: matches Hasura ag_fleet table EXACTLY
export const agentSchema = z.object({
  id: z.string(), // "devpc:9011" format
  machine: z.string().min(1),
  port: z.number().int().min(9000).max(9999),
  ag_role: z.string().min(1),
  status: z.string(),
  context_percent: z.number().min(0).max(100).nullable(),
  current_task: z.string().nullable(),
  last_seen: z.string().nullable(),
  domain: z.string().nullable(),
  module: z.string().nullable(),
});

export const agentFilterSchema = z.object({
  machine: z.string().optional(),
  status: z.string().optional(),
});

export type Agent = z.infer<typeof agentSchema>;
export type AgentFilter = z.infer<typeof agentFilterSchema>;
