import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "http://100.91.95.30:3502",
    "http://localhost:3502",
    "http://127.0.0.1:3502",
  ],
  serverExternalPackages: ['@dbos-inc/dbos-sdk'],
};

export default withSentryConfig(nextConfig, {
  // Suppresses source map uploading logs during build
  silent: true,
  // Org and project for source map upload (set when DSN is configured)
  org: process.env.SENTRY_ORG || "rootknow",
  project: process.env.SENTRY_PROJECT || "rdk-sandbox",
  // Upload source maps only when auth token is available
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Telemetry off in production
  telemetry: false,
});
