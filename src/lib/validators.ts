import { z } from "zod/v4";

// Agent schemas — single source of truth for validation
export const AgentStatusEnum = z.enum(["idle", "busy", "error", "offline"]);

export const MachineEnum = z.enum(["devpc", "ns2", "imac", "gram", "thinkpad"]);

export const CreateAgentSchema = z.object({
  machine: MachineEnum,
  port: z.int().min(9000).max(9999),
  role: z.string().min(1).max(50),
  status: AgentStatusEnum.optional().default("idle"),
  currentTask: z.string().nullable().optional(),
  contextPercent: z.int().min(0).max(100).optional().default(0),
  errorCount: z.int().min(0).optional().default(0),
  isOnline: z.boolean().optional().default(true),
});

export const UpdateAgentSchema = CreateAgentSchema.partial();

export const AgentIdSchema = z.object({
  id: z.string().uuid(),
});

// Inferred types — compile-time safety
export type CreateAgentInput = z.infer<typeof CreateAgentSchema>;
export type UpdateAgentInput = z.infer<typeof UpdateAgentSchema>;
