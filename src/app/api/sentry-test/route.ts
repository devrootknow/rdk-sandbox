import { NextResponse } from 'next/server';

export async function GET() {
  let sentryConfigured = false;
  let sdkVersion = 'unknown';

  try {
    const Sentry = await import('@sentry/nextjs');
    const client = Sentry.getClient();
    sentryConfigured = !!client;
    sdkVersion = Sentry.SDK_VERSION ?? 'unknown';
  } catch {
    // Sentry not loaded
  }

  return NextResponse.json({
    sentryInstalled: true,
    sentryConfigured,
    sdkVersion,
    configFiles: ['sentry.client.config.ts', 'sentry.server.config.ts', 'sentry.edge.config.ts'],
    dsnConfigured: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    note: 'Set NEXT_PUBLIC_SENTRY_DSN to activate. Currently disabled (no DSN) = zero overhead.',
    timestamp: new Date().toISOString(),
  });
}
