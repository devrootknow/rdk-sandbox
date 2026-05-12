import { describe, it, expect } from 'vitest';
import { agentSchema, agentFilterSchema } from '@/schemas/agent';

describe('Agent Zod Schema (matches Hasura ag_fleet)', () => {
  it('validates a real Hasura agent record', () => {
    const valid = {
      id: 'devpc:9011',
      machine: 'devpc',
      port: 9011,
      ag_role: 'lead',
      status: 'idle',
      context_percent: 13,
      current_task: null,
      last_seen: '2026-05-13T01:46:42.201489+07:00',
      domain: 'commander',
      module: 'dev-lead',
    };
    expect(agentSchema.parse(valid)).toEqual(valid);
  });

  it('rejects invalid port (< 9000)', () => {
    expect(() =>
      agentSchema.parse({
        id: 'test:80',
        machine: 'test',
        port: 80,
        ag_role: 'x',
        status: 'online',
        context_percent: null,
        current_task: null,
        last_seen: null,
        domain: null,
        module: null,
      }),
    ).toThrow();
  });

  it('accepts null context_percent and current_task', () => {
    const agent = agentSchema.parse({
      id: 'imac:9043',
      machine: 'imac',
      port: 9043,
      ag_role: 'legal',
      status: 'offline',
      context_percent: null,
      current_task: null,
      last_seen: null,
      domain: null,
      module: null,
    });
    expect(agent.context_percent).toBeNull();
    expect(agent.current_task).toBeNull();
  });

  it('validates filter schema', () => {
    expect(agentFilterSchema.parse({})).toEqual({});
    expect(agentFilterSchema.parse({ machine: 'devpc' })).toEqual({ machine: 'devpc' });
    expect(agentFilterSchema.parse({ status: 'busy' })).toEqual({ status: 'busy' });
  });

  it('handles all status values from production', () => {
    const statuses = ['idle', 'busy', 'online', 'offline', 'error'];
    for (const status of statuses) {
      const agent = agentSchema.parse({
        id: `test:9011`,
        machine: 'test',
        port: 9011,
        ag_role: 'test',
        status,
        context_percent: 0,
        current_task: null,
        last_seen: null,
        domain: null,
        module: null,
      });
      expect(agent.status).toBe(status);
    }
  });
});
