// BFF (backend-for-frontend) for cart-helper.
//
// - Serves Vite-built static assets from ../dist
// - Proxies /api/v1/* to https://api.vaultsage.ai/api/v1/* and injects the
//   X-Api-Key header server-side. Browser never sees the key.
// - Strips the browser's Origin/Referer before forwarding (VaultSage rejects
//   unknown origins via its CORS allowlist; server-side calls don't need to
//   carry one).

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const API_KEY = process.env.VAULTSAGE_API_KEY;
const UPSTREAM = process.env.VAULTSAGE_BASE_URL ?? 'https://api.vaultsage.ai';

if (!API_KEY) {
  console.warn('[server] WARNING: VAULTSAGE_API_KEY is not set — proxy calls will return 401');
}

const app = express();
app.disable('x-powered-by');

app.get('/healthz', (_req, res) => {
  res.json({ ok: true, hasApiKey: Boolean(API_KEY), upstream: UPSTREAM });
});

app.use(
  '/api/v1',
  createProxyMiddleware({
    target: UPSTREAM,
    changeOrigin: true,
    xfwd: false,
    timeout: 60_000,
    proxyTimeout: 60_000,
    // app.use('/api/v1', ...) strips the prefix before handing to the proxy,
    // so req.url here starts at '/'. Re-add /api/v1 so VaultSage sees the
    // original path.
    pathRewrite: (path) => '/api/v1' + path,
    on: {
      proxyReq: (proxyReq, req) => {
        if (API_KEY) proxyReq.setHeader('X-Api-Key', API_KEY);
        proxyReq.removeHeader('origin');
        proxyReq.removeHeader('referer');
        proxyReq.removeHeader('cookie');
        if (process.env.PROXY_DEBUG === '1') {
          console.log(`[proxy] ${req.method} ${req.url} -> ${proxyReq.path}`);
        }
      },
      error: (err, _req, res) => {
        console.error('[proxy] upstream error:', err.message);
        if ('writeHead' in res && !res.headersSent) {
          res.writeHead(502, { 'content-type': 'application/json' });
          res.end(JSON.stringify({ error: 'proxy_error', message: err.message }));
        }
      },
    },
  }),
);

const distDir = path.resolve(__dirname, '..', 'dist');
app.use(express.static(distDir, { index: false, maxAge: '1h' }));
app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));

app.listen(PORT, () => {
  console.log(`[server] cart-helper listening on :${PORT}`);
  console.log(`[server] dist=${distDir} upstream=${UPSTREAM} apiKey=${API_KEY ? 'set' : 'MISSING'}`);
});
