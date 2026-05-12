import { initTRPC } from '@trpc/server';

// Context: shared resources available to all procedures
// Hasura is called directly from routers — no db pool in context
export const createTRPCContext = () => ({});

const t = initTRPC.context<typeof createTRPCContext>().create();

// Base exports for building routers
export const router = t.router;
export const publicProcedure = t.procedure;
