import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET() {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || '';
  const client = Sentry.getClient();
  const clientDsn = client?.getDsn();
  const isActive = !!dsn;

  // Test error capture if active
  if (isActive) {
    try {
      Sentry.captureMessage('Sentry self-hosted test ping', 'info');
    } catch { /* ignore */ }
  }

  return NextResponse.json({
    sentryInstalled: true,
    sentryActive: isActive,
    sdkVersion: Sentry.SDK_VERSION ?? 'unknown',
    dsn: dsn ? dsn.replace(/\/\/([^@]+)@/, '//<key>@') : 'NOT CONFIGURED',
    dsnFromClient: clientDsn ? `${clientDsn.protocol}://${clientDsn.publicKey}@${clientDsn.host}:${clientDsn.port}/${clientDsn.projectId}` : 'client not initialized in this context',
    environment: process.env.NODE_ENV,
    configFiles: ['sentry.client.config.ts', 'sentry.server.config.ts', 'sentry.edge.config.ts'],
    timestamp: new Date().toISOString(),
  });
}
