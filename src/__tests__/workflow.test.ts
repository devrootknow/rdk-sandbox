import { describe, it, expect, vi, beforeAll } from 'vitest';

// Mock DBOS SDK — decorators become pass-through, no DB needed
vi.mock('@dbos-inc/dbos-sdk', () => {
  const passThrough = () => (_target: object, _key: string, descriptor: PropertyDescriptor) =>
    descriptor;
  return {
    DBOS: {
      workflow: passThrough,
      step:
        (_config?: Record<string, unknown>) =>
        (_target: object, _key: string, descriptor: PropertyDescriptor) =>
          descriptor,
      launch: vi.fn().mockResolvedValue(undefined),
      shutdown: vi.fn().mockResolvedValue(undefined),
      setConfig: vi.fn(),
      isInitialized: vi.fn().mockReturnValue(false),
    },
  };
});

// Mock Hasura
vi.mock('@/db/hasura', () => ({
  hasuraQuery: vi.fn().mockResolvedValue({
    ag_fleet: [
      {
        id: 'devpc:9011',
        machine: 'devpc',
        port: 9011,
        ag_role: 'lead',
        status: 'idle',
        context_percent: 14,
        current_task: null,
        last_seen: '2026-05-13T01:46:42Z',
        domain: 'commander',
        module: 'dev-lead',
      },
      {
        id: 'devpc:9012',
        machine: 'devpc',
        port: 9012,
        ag_role: 'frontend',
        status: 'busy',
        context_percent: 45,
        current_task: 'Panel build',
        last_seen: '2026-05-13T01:46:42Z',
        domain: 'commander',
        module: 'frontend-builder',
      },
      {
        id: 'ns2:9034',
        machine: 'ns2',
        port: 9034,
        ag_role: 'architect',
        status: 'idle',
        context_percent: 20,
        current_task: null,
        last_seen: '2026-05-13T01:46:42Z',
        domain: 'commander',
        module: 'system-owner',
      },
    ],
  }),
}));

describe('Fleet Sync Workflow (DBOS Decorators)', () => {
  it('completes workflow with valid agents', async () => {
    const { fleetSyncWorkflow } = await import('@/workflows/fleet-sync');
    const { state, health } = await fleetSyncWorkflow();

    expect(state.status).toBe('completed');
    expect(state.step).toBe(3);
    expect(state.totalSteps).toBe(3);
    expect(state.error).toBeNull();
    expect(health).toHaveProperty('totalAgents', 3);
    expect(health).toHaveProperty('byStatus');
    expect(health).toHaveProperty('byMachine');
    expect(health).toHaveProperty('avgContextPercent');
  });

  it('tracks workflow checkpoint state', async () => {
    const { fleetSyncWorkflow } = await import('@/workflows/fleet-sync');
    const { state } = await fleetSyncWorkflow();

    expect(state.id).toMatch(/^fleet-sync-\d+$/);
    expect(state.startedAt).toBeTruthy();
    expect(state.completedAt).toBeTruthy();
    expect(new Date(state.completedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(state.startedAt).getTime(),
    );
  });

  it('computes correct fleet health metrics', async () => {
    const { fleetSyncWorkflow } = await import('@/workflows/fleet-sync');
    const { health } = await fleetSyncWorkflow();

    const h = health as Record<string, unknown>;
    expect(h.totalAgents).toBe(3);
    expect((h.byStatus as Record<string, number>)['idle']).toBe(2);
    expect((h.byStatus as Record<string, number>)['busy']).toBe(1);
    expect((h.byMachine as Record<string, number>)['devpc']).toBe(2);
    expect((h.byMachine as Record<string, number>)['ns2']).toBe(1);
    expect(h.avgContextPercent).toBeCloseTo(26.3, 0);
  });

  it('handles Hasura failure gracefully', async () => {
    // Re-import with failed Hasura
    vi.resetModules();

    // Re-mock DBOS
    vi.doMock('@dbos-inc/dbos-sdk', () => {
      const passThrough = () => (_target: object, _key: string, descriptor: PropertyDescriptor) =>
        descriptor;
      return {
        DBOS: {
          workflow: passThrough,
          step:
            (_config?: Record<string, unknown>) =>
            (_target: object, _key: string, descriptor: PropertyDescriptor) =>
              descriptor,
          launch: vi.fn().mockResolvedValue(undefined),
          shutdown: vi.fn().mockResolvedValue(undefined),
          setConfig: vi.fn(),
          isInitialized: vi.fn().mockReturnValue(false),
        },
      };
    });

    vi.doMock('@/db/hasura', () => ({
      hasuraQuery: vi.fn().mockRejectedValue(new Error('Connection refused')),
    }));

    const { fleetSyncWorkflow } = await import('@/workflows/fleet-sync');
    const { state } = await fleetSyncWorkflow();

    expect(state.status).toBe('failed');
    expect(state.error).toContain('Connection refused');
    expect(state.step).toBe(1); // Failed at fetch step
  });
});
