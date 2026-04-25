export interface VaultSageConfig {
  baseUrl: string;
  apiKey: string | null;
}

export function getConfig(): VaultSageConfig {
  const env = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env;
  return {
    baseUrl: env.VITE_VAULTSAGE_BASE_URL ?? 'https://api.vaultsage.ai',
    apiKey: env.VITE_VAULTSAGE_API_KEY ?? null,
  };
}
