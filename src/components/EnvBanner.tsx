import { getConfig } from '../lib/vaultsage/config';

/**
 * Shown when VITE_VAULTSAGE_API_KEY was not baked into the bundle at build time.
 * App still works in mock mode, but real OCR / receipt comparison will not run.
 *
 * Dismissible per-session via sessionStorage so it doesn't nag through a demo,
 * but reappears on hard refresh so you can't forget to fix it before a real run.
 */
export function EnvBanner() {
  const cfg = getConfig();
  if (cfg.apiKey) return null;

  return (
    <div className="bg-danger-500 px-3 py-2 text-center text-xs leading-snug text-neutral-0">
      ⚠️ <strong>VITE_VAULTSAGE_API_KEY</strong> not set —
      app is in <strong>mock mode</strong>. Set it in Render env vars and redeploy.
    </div>
  );
}
