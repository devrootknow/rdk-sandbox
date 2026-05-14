'use client';

import React from 'react';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Icon, Spinner, Tag } from '@blueprintjs/core';
import gt from '@/components/shared/GoldenTemplate.module.css';
import s from './FleetSandboxPanel.module.css';

type AgentStatus = 'online' | 'offline' | 'busy' | 'error' | 'idle';

interface AgentData {
  id: number | string;
  machine: string;
  port: number;
  role: string;
  status: string;
  context_percent?: number | null;
  active_task?: string | null;
  last_heartbeat?: string | null;
  contextPercent?: number | null;
  activeTask?: string | null;
  lastHeartbeat?: string | Date | null;
  error_count?: number | null;
}

function normalizeAgent(raw: AgentData) {
  return {
    id: raw.id,
    machine: raw.machine,
    port: raw.port,
    role: raw.role,
    status: (raw.status || 'offline') as AgentStatus,
    currentTask: raw.active_task ?? raw.activeTask ?? null,
    contextPercent: raw.context_percent ?? raw.contextPercent ?? 0,
    errorCount: raw.error_count ?? 0,
    lastHeartbeat: raw.last_heartbeat ?? raw.lastHeartbeat ?? null,
  };
}

function StatusBadge({ status }: { status: AgentStatus }) {
  const m: Record<string, string> = {
    online: s.statusOnline,
    busy: s.statusBusy,
    error: s.statusError,
    offline: s.statusOffline,
    idle: s.statusIdle,
  };
  return (
    <span className={m[status] ?? s.statusOffline}>
      <span className={s.statusDotInline} />
      {status}
    </span>
  );
}

function ContextBar({ percent }: { percent: number }) {
  const fillRef = React.useRef<HTMLSpanElement>(null);
  React.useEffect(() => {
    if (fillRef.current) {
      fillRef.current.style.setProperty(
        '--progress-width',
        `${Math.min(100, Math.max(0, percent))}%`,
      );
    }
  }, [percent]);
  return (
    <span>
      <span className={s.contextBar}>
        <span ref={fillRef} className={s.contextFill} />
      </span>
      <span className={s.contextLabel}>{percent}%</span>
    </span>
  );
}

interface Props {
  initialAgents?: AgentData[];
}

export default function FleetSandboxPanel({ initialAgents = [] }: Props) {
  const [agents, setAgents] = useState<AgentData[]>(initialAgents);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(initialAgents.length === 0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch('/api/trpc/agent.getAll');
      const json = await res.json();
      if (json.result?.data) {
        setAgents(json.result.data);
        setError(null);
      } else if (json.error) {
        setError(json.error.message || 'Unknown error');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => {
    if (initialAgents.length === 0) fetchAgents();
  }, [initialAgents.length, fetchAgents]);
  useEffect(() => {
    const iv = setInterval(fetchAgents, 30_000);
    return () => clearInterval(iv);
  }, [fetchAgents]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchAgents();
  }, [fetchAgents]);

  const { normalized, grouped, stats } = useMemo(() => {
    const normalized = agents.map(normalizeAgent);
    const order = ['devpc', 'ns2', 'gram', 'imac', 'thinkpad'];
    const groups: Record<string, ReturnType<typeof normalizeAgent>[]> = {};
    for (const a of normalized) {
      if (!groups[a.machine]) groups[a.machine] = [];
      groups[a.machine].push(a);
    }
    for (const m of Object.keys(groups)) {
      const seen = new Set<number>();
      groups[m] = groups[m]
        .sort((a, b) => a.port - b.port)
        .filter((a) => {
          if (seen.has(a.port)) return false;
          seen.add(a.port);
          return true;
        });
    }
    const sorted: typeof groups = {};
    for (const m of order) {
      if (groups[m]) sorted[m] = groups[m];
    }
    for (const m of Object.keys(groups)) {
      if (!sorted[m]) sorted[m] = groups[m];
    }
    const all = Object.values(sorted).flat();
    return {
      normalized: all,
      grouped: sorted,
      stats: {
        total: all.length,
        online: all.filter((a) => a.status === 'online' || a.status === 'idle').length,
        busy: all.filter((a) => a.status === 'busy').length,
        error: all.filter((a) => a.status === 'error').length,
      },
    };
  }, [agents]);

  if (isLoading)
    return (
      <div className={gt.root}>
        <div className={gt.header}>
          <div className={gt.headerTitle}>
            <Icon icon="people" size={14} />
            <h3>Fleet Agents</h3>
          </div>
        </div>
        <div className={gt.body}>
          <div className={s.loadingContainer}>
            <Spinner size={24} />
            <span>Loading agents…</span>
          </div>
        </div>
      </div>
    );

  if (error && normalized.length === 0)
    return (
      <div className={gt.root}>
        <div className={gt.header}>
          <div className={gt.headerTitle}>
            <Icon icon="people" size={14} />
            <h3>Fleet Agents</h3>
          </div>
          <div className={gt.headerActions}>
            <Button minimal small icon="refresh" onClick={handleRefresh} loading={isRefreshing} />
          </div>
        </div>
        <div className={gt.body}>
          <div className={s.errorContainer}>
            <Icon icon="error" size={32} />
            <span>Failed to load agents</span>
            <span className={s.errorMessage}>{error}</span>
            <Button intent="primary" icon="refresh" onClick={handleRefresh}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );

  if (normalized.length === 0)
    return (
      <div className={gt.root}>
        <div className={gt.header}>
          <div className={gt.headerTitle}>
            <Icon icon="people" size={14} />
            <h3>Fleet Agents</h3>
          </div>
          <div className={gt.headerActions}>
            <Button minimal small icon="refresh" onClick={handleRefresh} loading={isRefreshing} />
          </div>
        </div>
        <div className={gt.body}>
          <div className={s.emptyState}>
            <Icon icon="inbox" size={32} />
            <span>No agents found.</span>
          </div>
        </div>
      </div>
    );

  return (
    <div className={gt.root}>
      <div className={gt.header}>
        <div className={gt.headerTitle}>
          <span className={gt.statusDotLive} />
          <Icon icon="people" size={14} />
          <h3>Fleet Agents</h3>
          <Tag minimal round>
            {stats.total} agents
          </Tag>
        </div>
        <div className={gt.headerActions}>
          <span className={gt.lastUpdate}>{lastRefresh.toLocaleTimeString()}</span>
          <Button minimal small icon="refresh" onClick={handleRefresh} loading={isRefreshing} />
        </div>
      </div>
      <div className={gt.body}>
        <div className={s.statsRow}>
          <div className={s.statCard}>
            <span className={s.statLabel}>Total</span>
            <span className={s.statValue}>{stats.total}</span>
          </div>
          <div className={s.statCard}>
            <span className={s.statLabel}>Online</span>
            <span className={`${s.statValue} ${s.statValueOnline}`}>{stats.online}</span>
          </div>
          <div className={s.statCard}>
            <span className={s.statLabel}>Busy</span>
            <span className={`${s.statValue} ${s.statValueBusy}`}>{stats.busy}</span>
          </div>
          <div className={s.statCard}>
            <span className={s.statLabel}>Error</span>
            <span className={`${s.statValue} ${s.statValueError}`}>{stats.error}</span>
          </div>
        </div>
        {Object.entries(grouped).map(([machine, machineAgents]) => (
          <div key={machine} className={s.machineGroup}>
            <div className={s.machineHeader}>
              <Icon icon="desktop" size={12} />
              <span className={s.machineLabel}>{machine}</span>
              <span className={s.machineCount}>{machineAgents.length}</span>
            </div>
            <table className={s.agentTable}>
              <thead>
                <tr>
                  <th>Port</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Task</th>
                  <th>Context</th>
                  <th>Errors</th>
                </tr>
              </thead>
              <tbody>
                {machineAgents.map((a) => (
                  <tr key={`${a.machine}-${a.port}`}>
                    <td className={s.portCell}>{a.port}</td>
                    <td className={s.roleCell}>{a.role}</td>
                    <td>
                      <StatusBadge status={a.status} />
                    </td>
                    <td className={s.taskCell}>{a.currentTask ?? '—'}</td>
                    <td>
                      <ContextBar percent={a.contextPercent ?? 0} />
                    </td>
                    <td className={s.portCell}>{a.errorCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
