/**
 * Security headers.
 *
 * H1 added the low-risk set. H5 adds Content-Security-Policy in
 * REPORT-ONLY mode and records why it is not enforced yet.
 *
 * ---
 *
 * WHY CSP IS REPORT-ONLY AND NOT ENFORCED
 *
 * An enforcing CSP authored without measured violation data is the fastest
 * way to ship a white screen. Next.js injects its own inline bootstrap and
 * hydration scripts, and the exact shape of those varies by version and by
 * whether a route is static or dynamic. Guessing at `script-src` and getting
 * it wrong takes the whole app down — including the crisis flow.
 *
 * So the staged path is: inventory sources (done, below), deploy Report-Only,
 * collect real violations, then enforce. Steps 3 and 4 need a deployment, and
 * DEPLOY_AUTHORIZED is false — see docs/H5_PRIVACY_CI_A11Y_EVIDENCE.md for the
 * procedure and the decision criteria.
 *
 * MEASURED SOURCE INVENTORY (by grep over src/, excluding tests):
 *   - no dangerouslySetInnerHTML, no inline <script>, no eval, no new Function
 *   - 4 inline style={{...}} usages -> style-src needs 'unsafe-inline' until
 *     they are moved to classes
 *   - next/font/google: Next self-hosts these at BUILD time, so there is no
 *     runtime font host to allow
 *   - api.anthropic.com is called server-side only, never from the browser,
 *     so it must NOT be in connect-src
 *   - 112.gov.tr / aile.gov.tr appear only as provenance metadata and comment
 *     text; the browser never requests them
 *   - w3.org appears only as an SVG xmlns, which is not a fetch
 *
 * HSTS is also still deferred. It is effectively irreversible for the length
 * of its max-age once a browser has seen it, so it belongs on a confirmed
 * always-HTTPS production domain, not on a preview URL.
 */

/**
 * Report-Only policy. `'unsafe-inline'` on script-src is present ONLY because
 * Next's bootstrap requires it and we have not yet measured whether a nonce
 * setup covers every route. That is precisely the kind of assumption
 * Report-Only exists to test before it becomes load-bearing.
 */
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Stop MIME sniffing turning a user-influenced response into script.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // A reading question can appear in a URL only by mistake, but if it
          // ever does, do not leak the full path to third-party origins.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // This app needs none of these; deny by default rather than inherit
          // whatever a future embed or dependency decides to ask for.
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
          },
          // No legitimate reason to frame this app; blocks clickjacking of the
          // crisis flow in particular. Kept alongside CSP frame-ancestors for
          // older browsers.
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          // Reports violations without blocking anything. Safe to ship.
          { key: 'Content-Security-Policy-Report-Only', value: CSP_REPORT_ONLY },
        ],
      },
      {
        // API responses are never a browsing context and must never be cached
        // by a shared cache - a reading is specific to one request.
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ];
  },
};

export { CSP_REPORT_ONLY };
export default nextConfig;
