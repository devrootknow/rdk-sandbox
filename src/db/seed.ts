import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:BLO%2BK3l%2FzW7udHplGXNY5s6uGeCn8v64wqhOLB3Q2lU%3D@localhost:5434/rdk_sandbox';

async function seed() {
  const pool = new Pool({ connectionString: DATABASE_URL });

  // Create table if not exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS rdk_agents (
      id SERIAL PRIMARY KEY,
      machine VARCHAR(50) NOT NULL,
      port INTEGER NOT NULL,
      role VARCHAR(50) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'offline',
      context_percent INTEGER,
      active_task TEXT,
      last_heartbeat TIMESTAMPTZ
    );
  `);

  // Clear existing sandbox data
  await pool.query(`DELETE FROM rdk_agents;`);

  // Seed with fleet data
  const agents = [
    { machine: 'devpc', port: 9011, role: 'lead', status: 'online', context: 7, task: 'RDK Sandbox #553' },
    { machine: 'devpc', port: 9012, role: 'frontend', status: 'online', context: 12, task: 'Panel component' },
    { machine: 'devpc', port: 9013, role: 'backend', status: 'busy', context: 45, task: 'tRPC wiring' },
    { machine: 'devpc', port: 9015, role: 'qa', status: 'online', context: 3, task: null },
    { machine: 'devpc', port: 9016, role: 'devops', status: 'online', context: 5, task: 'Sandbox deploy' },
    { machine: 'ns2', port: 9034, role: 'architect', status: 'online', context: 20, task: 'Blueprint review' },
    { machine: 'ns2', port: 9031, role: 'researcher', status: 'busy', context: 60, task: 'Docs→Skills R4-E' },
    { machine: 'gram', port: 9051, role: 'coordinator', status: 'online', context: 15, task: 'Fleet dispatch' },
    { machine: 'imac', port: 9043, role: 'legal', status: 'offline', context: null, task: null },
  ];

  for (const a of agents) {
    await pool.query(
      `INSERT INTO rdk_agents (machine, port, role, status, context_percent, active_task, last_heartbeat)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [a.machine, a.port, a.role, a.status, a.context, a.task]
    );
  }

  console.log(`✅ Seeded ${agents.length} agents into rdk_agents`);
  await pool.end();
}

seed().catch(console.error);
