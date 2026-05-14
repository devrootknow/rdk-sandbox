import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { agents } from './schema';

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://supabase_admin:rootknow-supa-2026@172.22.0.11:5432/postgres';

async function seed() {
  const db = drizzle(DATABASE_URL);

  // Create table if not exists via Drizzle raw SQL (no pg Pool needed)
  await db.execute(sql`
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
  await db.execute(sql`DELETE FROM rdk_agents`);

  // Seed with fleet data using Drizzle insert
  const seedAgents = [
    {
      machine: 'devpc',
      port: 9011,
      role: 'lead',
      status: 'online',
      contextPercent: 7,
      activeTask: 'RDK Sandbox #553',
    },
    {
      machine: 'devpc',
      port: 9012,
      role: 'frontend',
      status: 'online',
      contextPercent: 12,
      activeTask: 'Panel component',
    },
    {
      machine: 'devpc',
      port: 9013,
      role: 'backend',
      status: 'busy',
      contextPercent: 45,
      activeTask: 'tRPC wiring',
    },
    {
      machine: 'devpc',
      port: 9015,
      role: 'qa',
      status: 'online',
      contextPercent: 3,
      activeTask: null,
    },
    {
      machine: 'devpc',
      port: 9016,
      role: 'devops',
      status: 'online',
      contextPercent: 5,
      activeTask: 'Sandbox deploy',
    },
    {
      machine: 'ns2',
      port: 9034,
      role: 'architect',
      status: 'online',
      contextPercent: 20,
      activeTask: 'Blueprint review',
    },
    {
      machine: 'ns2',
      port: 9031,
      role: 'researcher',
      status: 'busy',
      contextPercent: 60,
      activeTask: 'Docs→Skills R4-E',
    },
    {
      machine: 'gram',
      port: 9051,
      role: 'coordinator',
      status: 'online',
      contextPercent: 15,
      activeTask: 'Fleet dispatch',
    },
    {
      machine: 'imac',
      port: 9043,
      role: 'legal',
      status: 'offline',
      contextPercent: null,
      activeTask: null,
    },
  ];

  await db.insert(agents).values(
    seedAgents.map((a) => ({
      machine: a.machine,
      port: a.port,
      role: a.role,
      status: a.status,
      contextPercent: a.contextPercent,
      activeTask: a.activeTask,
      lastHeartbeat: new Date(),
    })),
  );

  console.log(`✅ Seeded ${seedAgents.length} agents into rdk_agents (via Drizzle)`);
  process.exit(0);
}

seed().catch(console.error);
