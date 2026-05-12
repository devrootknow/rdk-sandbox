module.exports = {
  apps: [{
    name: 'rdk-sandbox',
    script: 'node_modules/.bin/next',
    args: 'start -p 3500 -H 0.0.0.0',
    cwd: '/opt/xknow/rdk-sandbox/app',
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://postgres:BLO%2BK3l%2FzW7udHplGXNY5s6uGeCn8v64wqhOLB3Q2lU%3D@localhost:5434/rdk_sandbox',
      HASURA_URL: 'http://localhost:18086/v1/graphql',
      HASURA_ADMIN_SECRET: 'BZPmB1rR9tKwF5cSAdcdzXt9WBuT6apcIyzToyEEsfE=',
      // Sentry — set DSN to activate error tracking
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
      SENTRY_DSN: process.env.SENTRY_DSN || '',
    },
  }],
};
