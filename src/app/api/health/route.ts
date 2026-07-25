import { NextResponse } from 'next/server';

/**
 * Liveness/health endpoint (Sprint S3). Used by staging/monitoring for a
 * cheap up-check. No secrets, no DB dependency (S3 wires no database). `commit`
 * comes from the platform's git-sha env var when present, else 'unknown'.
 */
export function GET(): NextResponse {
  return NextResponse.json(
    {
      status: 'ok',
      version: process.env.npm_package_version ?? '0.1.0',
      commit: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GIT_COMMIT_SHA ?? 'unknown',
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}
