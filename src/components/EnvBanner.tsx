import { useEffect, useState } from 'react';

interface HealthState {
  ok: boolean;
  hasApiKey?: boolean;
  upstream?: string;
}

/**
 * Pings the BFF health endpoint at startup and shows a red banner if the
 * server is unreachable or the proxy was started without VAULTSAGE_API_KEY.
 *
 * In Vite dev mode there is no /healthz endpoint (the dev proxy handles
 * /api/v1 only), so this component stays silent in dev.
 */
export function EnvBanner() {
  const [state, setState] = useState<HealthState | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/healthz')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) setState(data as HealthState);
      })
      .catch(() => {
        // No /healthz route in dev — not an error.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!state) return null;
  if (state.ok && state.hasApiKey) return null;

  return (
    <div className="bg-danger-500 px-3 py-2 text-center text-xs leading-snug text-neutral-0">
      ⚠️ Server is missing <strong>VAULTSAGE_API_KEY</strong>. Real OCR / receipt comparison
      will fail. Set it in Render env vars and redeploy.
    </div>
  );
}
