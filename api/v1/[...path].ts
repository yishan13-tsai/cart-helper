/**
 * BFF proxy for VaultSage API — Edge Runtime.
 *
 * All /api/v1/* requests from the browser land here. The API key lives
 * exclusively in the Vercel environment variable VAULTSAGE_API_KEY and is
 * never shipped in the client bundle.
 *
 * Dev: Vite's server.proxy handles the same routes (see vite.config.ts).
 */
export const config = { runtime: 'edge' };

const UPSTREAM = 'https://api.vaultsage.ai';
const HOP_BY_HOP = new Set([
  'transfer-encoding', 'connection', 'keep-alive',
  'upgrade', 'proxy-connection', 'te', 'trailers',
]);

export default async function handler(req: Request): Promise<Response> {
  const apiKey = process.env.VAULTSAGE_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'VAULTSAGE_API_KEY not configured' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }

  const { pathname, search } = new URL(req.url);
  const upstreamUrl = `${UPSTREAM}${pathname}${search}`;

  // Forward only content-type; let upstream set everything else.
  // x-api-key is injected here and never touches the browser.
  const headers = new Headers();
  headers.set('x-api-key', apiKey);
  const ct = req.headers.get('content-type');
  if (ct) headers.set('content-type', ct);

  const isBodyless = req.method === 'GET' || req.method === 'HEAD';
  const body = isBodyless ? undefined : await req.arrayBuffer();

  const upstream = await fetch(upstreamUrl, { method: req.method, headers, body });

  const resHeaders = new Headers();
  for (const [k, v] of upstream.headers.entries()) {
    if (!HOP_BY_HOP.has(k.toLowerCase())) resHeaders.set(k, v);
  }

  return new Response(upstream.body, { status: upstream.status, headers: resHeaders });
}
