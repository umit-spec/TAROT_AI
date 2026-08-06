/**
 * H1 baseline security headers.
 *
 * Deliberately excludes Content-Security-Policy. A CSP authored without first
 * inventorying this app's actual script/style sources is the fastest way to
 * ship a white screen, so CSP is staged separately in H5: inventory sources,
 * deploy as Report-Only, collect violations, then enforce. Everything below is
 * low-risk and safe to apply immediately.
 *
 * HSTS is also deferred to H5: it is effectively irreversible for the duration
 * of its max-age once a browser has seen it, so it should be turned on only
 * against a confirmed always-HTTPS production domain.
 */

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
          // crisis flow in particular. X-Frame-Options is kept alongside CSP's
          // frame-ancestors (H5) for older browsers.
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
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

export default nextConfig;
