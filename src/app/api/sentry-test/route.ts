import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET() {
  // Check Sentry status
  const client = Sentry.getClient();
  const dsn = client?.getDsn();
  const isActive = !!dsn;

  return NextResponse.json({
    sentryInstalled: true,
    sentryActive: isActive,
    sdkVersion: Sentry.SDK_VERSION ?? 'unknown',
    dsn: dsn ? `${dsn.protocol}://${dsn.publicKey}@${dsn.host}/${dsn.projectId}` : 'NOT CONFIGURED',
    environment: process.env.NODE_ENV,
    configFiles: ['sentry.client.config.ts', 'sentry.server.config.ts', 'sentry.edge.config.ts'],
    timestamp: new Date().toISOString(),
  });
}

export async function POST() {
  // Throw a test error to verify Sentry captures it
  const testId = `test-${Date.now()}`;
  
  try {
    throw new Error(`[SENTRY TEST] DevOps verification — id:${testId}`);
  } catch (error) {
    Sentry.captureException(error);
    await Sentry.flush(2000);
    
    return NextResponse.json({
      success: true,
      testId,
      message: 'Test error captured and sent to Sentry',
      sentryActive: !!Sentry.getClient()?.getDsn(),
      timestamp: new Date().toISOString(),
    });
  }
}
