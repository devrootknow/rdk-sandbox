/**
 * DBOS Durable Workflow: Fleet Sync
 *
 * Uses @dbos-inc/dbos-sdk v4 decorators for real durable execution:
 * - @DBOS.workflow(): orchestrates steps with crash recovery
 * - @DBOS.step(): atomic unit of work with retry + checkpoint
 *
 * DBOS SDK is excluded from Next.js bundler via serverExternalPackages
 * in next.config.ts, so it runs as native Node.js at runtime.
 *
 * @see https://docs.dbos.dev/typescript/tutorials/workflow-tutorial
 */
import { DBOS } from '@dbos-inc/dbos-sdk';
import { hasuraQuery } from '@/db/hasura';
import { agentSchema, type Agent } from '@/schemas/agent';

// ─── Result Types ───
interface WorkflowResult {
  state: {
    id: string;
    status: 'completed' | 'failed';
    step: number;
    totalSteps: number;
    error: string | null;
    startedAt: string;
    completedAt: string;
  };
  health: Record<string, unknown>;
}

// ─── DBOS Initialization ───
let dbosInitialized = false;

async function ensureDBOS(): Promise<void> {
  if (dbosInitialized || DBOS.isInitialized()) {
    dbosInitialized = true;
    return;
  }

  const dbUrl =
    process.env.DATABASE_URL ||
    'postgresql://supabase_admin:rootknow-supa-2026@172.22.0.11:5432/postgres';

  DBOS.setConfig({
    name: 'rdk-sandbox',
    systemDatabaseUrl: dbUrl,
    enableOTLP: false,
    tracingEnabled: false,
    runAdminServer: false,
    logLevel: 'warn',
  });

  await DBOS.launch();
  dbosInitialized = true;
}

// ─── Fleet Sync Workflow Class ───
class FleetSync {
  /**
   * Step 1: Fetch agents from Hasura (retriable, maxAttempts: 3)
   * @DBOS.step() ensures at-least-once execution with checkpoint
   */
  @DBOS.step({ retriesAllowed: true, maxAttempts: 3, backoffRate: 2, intervalSeconds: 1 })
  static async fetchAgents(): Promise<Agent[]> {
    const QUERY = `
      query { ag_fleet(order_by: { port: asc }) {
        id machine port ag_role status
        context_percent current_task last_seen
        domain module
      }}
    `;
    const data = await hasuraQuery<{ ag_fleet: Agent[] }>(QUERY);
    return data.ag_fleet;
  }

  /**
   * Step 2: Validate agents via Zod schema (deterministic, idempotent)
   * @DBOS.step() checkpoints the validation output
   */
  @DBOS.step()
  static async validateAgents(raw: Agent[]): Promise<{ valid: Agent[]; errors: string[] }> {
    const valid: Agent[] = [];
    const errors: string[] = [];

    for (const agent of raw) {
      const result = agentSchema.safeParse(agent);
      if (result.success) {
        valid.push(result.data);
      } else {
        errors.push(`${agent.id}: ${result.error.issues[0]?.message}`);
      }
    }

    return { valid, errors };
  }

  /**
   * Step 3: Compute fleet health metrics (pure function)
   * @DBOS.step() checkpoints the computed health snapshot
   */
  @DBOS.step()
  static async computeHealth(agents: Agent[]): Promise<Record<string, unknown>> {
    const byStatus: Record<string, number> = {};
    const byMachine: Record<string, number> = {};

    for (const a of agents) {
      byStatus[a.status] = (byStatus[a.status] || 0) + 1;
      byMachine[a.machine] = (byMachine[a.machine] || 0) + 1;
    }

    const avgContext =
      agents.reduce((sum, a) => sum + (a.context_percent ?? 0), 0) / (agents.length || 1);

    return {
      totalAgents: agents.length,
      byStatus,
      byMachine,
      avgContextPercent: Math.round(avgContext * 10) / 10,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Workflow Orchestrator: coordinates 3 steps with DBOS durable execution
   * @DBOS.workflow() persists state across steps for crash recovery
   */
  @DBOS.workflow()
  static async run(): Promise<WorkflowResult> {
    const workflowId = `fleet-sync-${Date.now()}`;
    const startedAt = new Date().toISOString();

    try {
      // Step 1: Fetch (with DBOS retry policy)
      const rawAgents = await FleetSync.fetchAgents();

      // Step 2: Validate (deterministic, checkpointed)
      const { valid } = await FleetSync.validateAgents(rawAgents);

      // Step 3: Compute health (pure, checkpointed)
      const health = await FleetSync.computeHealth(valid);

      return {
        state: {
          id: workflowId,
          status: 'completed',
          step: 3,
          totalSteps: 3,
          error: null,
          startedAt,
          completedAt: new Date().toISOString(),
        },
        health,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      return {
        state: {
          id: workflowId,
          status: 'failed',
          step: 1,
          totalSteps: 3,
          error,
          startedAt,
          completedAt: new Date().toISOString(),
        },
        health: { error, failedAtStep: 1 },
      };
    }
  }
}

/**
 * Public entry point — preserves backward-compatible function signature.
 * Ensures DBOS is launched before invoking the workflow.
 * Called by tRPC router and tests.
 */
export async function fleetSyncWorkflow(): Promise<WorkflowResult> {
  await ensureDBOS();
  return FleetSync.run();
}

export { FleetSync };
