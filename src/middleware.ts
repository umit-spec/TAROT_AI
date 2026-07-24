import { NextRequest, NextResponse } from 'next/server';
import { REQUEST_ID_HEADER, getOrCreateRequestId } from './server/observability/request-id';

/**
 * First middleware in the app (Sprint S3). Attaches a correlation id to every
 * /api request and echoes it back on the response, so logs and clients can
 * correlate a request end-to-end. No sensitive data, no auth logic here.
 */
export function middleware(request: NextRequest): NextResponse {
  const requestId = getOrCreateRequestId(request.headers);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(REQUEST_ID_HEADER, requestId);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set(REQUEST_ID_HEADER, requestId);
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
