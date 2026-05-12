import { router, publicProcedure } from '../init';
import { agentSchema, agentFilterSchema } from '@/schemas/agent';
import { hasuraQuery } from '@/db/hasura';
import type { Agent } from '@/schemas/agent';

const FLEET_QUERY = `
  query GetAgents {
    ag_fleet(order_by: { port: asc }) {
      id machine port ag_role status
      context_percent current_task last_seen
      domain module
    }
  }
`;

const AGENT_BY_ID_QUERY = `
  query GetAgent($id: String!) {
    ag_fleet_by_pk(id: $id) {
      id machine port ag_role status
      context_percent current_task last_seen
      domain module
    }
  }
`;

export const agentRouter = router({
  // GET all agents from Hasura ag_fleet (REAL production data)
  getAll: publicProcedure
    .input(agentFilterSchema.optional())
    .output(agentSchema.array())
    .query(async ({ input }) => {
      const data = await hasuraQuery<{ ag_fleet: Agent[] }>(FLEET_QUERY);
      let agents = data.ag_fleet;

      // Client-side filter (Hasura where() could be used for perf)
      if (input?.machine) {
        agents = agents.filter((a) => a.machine === input.machine);
      }
      if (input?.status) {
        agents = agents.filter((a) => a.status === input.status);
      }

      return agents;
    }),

  // GET single agent by ID (e.g. "devpc:9011")
  getById: publicProcedure
    .input(agentSchema.shape.id)
    .output(agentSchema.nullable())
    .query(async ({ input }) => {
      const data = await hasuraQuery<{ ag_fleet_by_pk: Agent | null }>(AGENT_BY_ID_QUERY, {
        id: input,
      });
      return data.ag_fleet_by_pk;
    }),
});
