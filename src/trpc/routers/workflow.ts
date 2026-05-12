import { router, publicProcedure } from '../init';
import { fleetSyncWorkflow } from '@/workflows/fleet-sync';

export const workflowRouter = router({
  // Run fleet sync workflow (durable, recoverable)
  runFleetSync: publicProcedure.mutation(async () => {
    const result = await fleetSyncWorkflow();
    return result;
  }),
});
