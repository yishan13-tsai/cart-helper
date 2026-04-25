# Scaffold Report — cart-helper

Date: 2026-04-24 · Agent: frontend

## 實際版本（lockfile 解出）

| 套件 | 指定 | 實際 |
|---|---|---|
| vite | ^5.4.10 | 5.4.21 |
| react | ^18.3.1 | 18.3.1 |
| react-dom | ^18.3.1 | 18.3.1 |
| react-router-dom | ^6.26.2 | 6.30.3 |
| typescript | ^5.6.3 | 5.9.3 |
| tailwindcss | ^3.4.14 | 3.4.19 |
| vite-plugin-pwa | ^0.20.5 | 0.20.5 |
| @vitejs/plugin-react | ^4.3.3 | 4.7.0 |
| zustand | ^4.5.5 | 4.5.7 |
| zod | ^3.23.8 | 3.25.76 |
| vitest | ^2.1.4 | 2.1.9 |
| postcss | ^8.4.47 | 8.5.10 |
| autoprefixer | ^10.4.20 | 10.5.0 |

Node v24.13.0 · pnpm 10.5.2

## 驗收

| 標準 | 結果 |
|---|---|
| `pnpm install` | OK（9.2s, 452 packages） |
| `pnpm typecheck` | 0 errors |
| `pnpm dev` + curl `http://localhost:5180/` | HTTP 200，HTML 帶 `血拼小幫手` |
| `pnpm build` | OK（dist 產出、sw.js + workbox 有產） |

## Bundle size（production build）

```
dist/index.html                  0.72 kB │ gzip  0.51 kB
dist/manifest.webmanifest        0.38 kB
dist/registerSW.js               0.13 kB
dist/assets/index-*.css          6.73 kB │ gzip  1.93 kB
dist/assets/index-*.js         208.34 kB │ gzip 68.04 kB
dist/sw.js                       1.35 kB
dist/workbox-*.js               15.12 kB
```

Precache: 9 entries, 211.87 KiB。

## 遇到的坑

1. **本機 5173/5174 被別的專案佔住**（twcg-frontend 跑在 5173、twcg-backend 跑在 5174）。vite 預設會自動 +1，但當 5174 被別的 node 鎖死時仍會出現「HTTP 200 但 HTML 不是我們的」假象（拿到別人的 `HF OPS Console`）。處理：把 `vite.config.ts` `server.port` 改成 `5180`（加 `strictPort: false` 讓衝突時仍能續）。日常開發請用 `http://localhost:5180/` 或以 port flag 覆寫。

2. **react-i18next 尚未裝**。Week 1 plan 有列，但本次 scaffold 任務範圍只包 router / zustand / zod / tailwind / PWA；i18n-locale agent 會在另一 task 裝 `i18next` + `react-i18next`、建 `src/locales/{zh-TW,en}/common.json`、以及 locale 偵測 hook。

3. **PWA icon 是 placeholder SVG**（綠底白色購物車線條 + 兩個輪子）。designer 給正式 logo 後替換 `public/icon-192.svg`、`public/icon-512.svg`，manifest 不用改（引用 svg 檔名）。

4. **Browser 表現尚未手測**（MCP agent-browser 本次未啟動，因 scaffold 以 curl + build 驗收已滿足任務標準）。下 UI task 時請用 agent-browser 真機跑一次 camera / permission 流程。

## 下一步建議

- i18n-locale agent：装 `i18next` + `react-i18next`、接 `detect-browser-language`、在 `App.tsx` 外圍包 `I18nextProvider`。
- api-integration agent：建 `src/lib/vaultsage/`（`client.ts`、`types.ts`、`ocr.ts`），以 zod schema 驗 response。
- frontend agent（下一棒）：`CameraCapture` component + `src/pages/CameraPage.tsx` 置換目前的 `HomePage` placeholder。
- qa-design agent：拉 agent-browser 跑 375px width 真機檢查 `HomePage` + bottom nav active 狀態。
- pnpm approve-builds：esbuild 的 postinstall script 被 ignore，功能上沒事，但若要最快的 native binary 可以 approve 一次。

## 檔案清單

```
package.json
pnpm-lock.yaml
tsconfig.json
tsconfig.node.json
vite.config.ts
tailwind.config.ts
postcss.config.js
index.html
README.md
public/
  icon-192.svg
  icon-512.svg
src/
  main.tsx
  App.tsx
  router.tsx
  index.css
  store/cart.ts
  types/index.ts
```
