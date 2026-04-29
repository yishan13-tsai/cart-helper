import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  // Load all env vars (including unprefixed VAULTSAGE_API_KEY) for the dev proxy.
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.VAULTSAGE_API_KEY ?? env.VITE_VAULTSAGE_API_KEY ?? '';
  const upstream = env.VAULTSAGE_BASE_URL ?? 'https://api.vaultsage.ai';

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon-192.svg', 'icon-512.svg'],
        manifest: {
          name: '血拼小幫手',
          short_name: '血拼',
          description: '拍照辨識商品、即時計算金額、拍收據對照差異',
          // Match Tailwind tomato theme: --ch-page (E84F2A) / --ch-bg (FFFAF5).
          // Keep these in sync with src/index.css if the default theme changes.
          theme_color: '#E84F2A',
          background_color: '#FFFAF5',
          display: 'standalone',
          lang: 'zh-TW',
          start_url: '/',
          icons: [
            { src: 'icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
            { src: 'icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
          // Don't intercept proxy paths — let them pass through to the network.
          navigateFallbackDenylist: [/^\/api\//, /^\/healthz$/],
        },
      }),
    ],
    server: {
      port: 5180,
      host: true,
      strictPort: false,
      proxy: {
        '/api/v1': {
          target: upstream,
          changeOrigin: true,
          // Inject the API key here in dev. Browser never sees it.
          headers: apiKey ? { 'X-Api-Key': apiKey } : undefined,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.removeHeader('origin');
              proxyReq.removeHeader('referer');
            });
          },
        },
      },
    },
  };
});
