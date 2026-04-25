export interface VaultSageConfig {
  /**
   * Base URL prefix for VaultSage requests. Defaults to '' so paths like
   * `/api/v1/files/` go to the same origin and are proxied by the BFF
   * server (or the Vite dev proxy) to the real VaultSage API. The browser
   * bundle never carries the API key.
   *
   * Set `VITE_VAULTSAGE_BASE_URL` to a full origin only if you want to
   * point a non-default deploy at a specific upstream — normal use leaves
   * it empty.
   */
  baseUrl: string;
}

export function getConfig(): VaultSageConfig {
  const env = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env;
  return {
    baseUrl: env.VITE_VAULTSAGE_BASE_URL ?? '',
  };
}
