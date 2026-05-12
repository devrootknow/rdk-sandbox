#!/bin/bash
cd /opt/xknow/rdk-sandbox/app
export DATABASE_URL="postgresql://postgres:rootknow-supa-2026@172.22.0.11:5432/postgres"
export SUPABASE_URL="http://localhost:8010"
export NODE_ENV=development
exec npx next dev -p 3500 -H 0.0.0.0
