import { AgentFleetPanel } from '@/components/AgentFleetPanel';

export default function Home() {
  return (
    <main className="rdk-page">
      <div className="rdk-page-header">
        <h1 className="rdk-page-title">🏗️ RDK Sandbox</h1>
        <p className="rdk-page-description">
          Fortress Stack proof-of-concept: Zod → Drizzle → tRPC → React (type-safe end-to-end)
        </p>
      </div>
      <AgentFleetPanel />
    </main>
  );
}
