'use client';

import { trpc } from '@/trpc/client';

function StatusBadge({ status }: { status: string }) {
  const statusClass = ['online', 'offline', 'busy', 'error', 'idle'].includes(status)
    ? status
    : 'offline';
  return <span className={`rdk-badge rdk-badge--${statusClass}`}>{status}</span>;
}

export function AgentFleetPanel() {
  const { data: agents, isLoading, error } = trpc.agent.getAll.useQuery();

  return (
    <div className="rdk-panel">
      <div className="rdk-panel-header">
        <div>
          <div className="rdk-panel-title">🤖 Fleet Overview</div>
          <div className="rdk-panel-subtitle">
            LIVE from Hasura ag_fleet — real production data
          </div>
        </div>
        <div className="rdk-panel-subtitle">
          {agents ? `${agents.length} agents` : '...'}
        </div>
      </div>

      {isLoading && <div className="rdk-panel-subtitle">Loading agents...</div>}
      {error && (
        <div className="rdk-badge rdk-badge--error">
          Error: {error.message}
        </div>
      )}

      {agents && agents.length > 0 && (
        <table className="rdk-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Machine</th>
              <th>Port</th>
              <th>Role</th>
              <th>Status</th>
              <th>Context %</th>
              <th>Domain</th>
              <th>Current Task</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent.id}>
                <td className="rdk-table-cell--mono">{agent.id}</td>
                <td className="rdk-table-cell--machine">{agent.machine}</td>
                <td className="rdk-table-cell--mono">{agent.port}</td>
                <td>{agent.ag_role}</td>
                <td><StatusBadge status={agent.status} /></td>
                <td>
                  {agent.context_percent !== null
                    ? `${agent.context_percent}%`
                    : '—'}
                </td>
                <td>{agent.domain || '—'}</td>
                <td className="rdk-table-cell--truncate">
                  {agent.current_task || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {agents && agents.length === 0 && (
        <div className="rdk-panel-subtitle rdk-panel-empty">
          No agents found in ag_fleet.
        </div>
      )}
    </div>
  );
}
