import { router } from './init';
import { agentRouter } from './routers/agent';
import { workflowRouter } from './routers/workflow';

export const appRouter = router({
  agent: agentRouter,
  workflow: workflowRouter,
});

export type AppRouter = typeof appRouter;
