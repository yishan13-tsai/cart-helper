# 🚨 Critical Issues (for user on return)

## ✅ RESOLVED — VaultSage CORS allowlist (2026-04-25)

**Status**: Fixed by switching from static-only deploy to BFF proxy architecture.

### What was the problem
VaultSage `api.vaultsage.ai` enforces a CORS origin allowlist that **only includes `localhost`**. Direct browser calls from any deployed domain (`*.onrender.com`, `*.github.io`, LAN IPs like `192.168.x.x`, custom domains) get rejected at preflight with `HTTP 400` and no `access-control-allow-origin` header. The browser then refuses the actual request, the fetch() rejects, and our client surfaces it as `VS_NETWORK`.

This blocked any non-localhost demo (Render, mobile via LAN, etc.).

### Fix shipped
Replaced Render Static Site with **Render Web Service running an Express BFF** (`server/index.js`). The server:
- Serves the Vite-built `dist/` as static files with SPA fallback
- Reverse-proxies `/api/v1/*` to `https://api.vaultsage.ai/api/v1/*`
- Injects `X-Api-Key` server-side from the `VAULTSAGE_API_KEY` env var
- Strips `Origin` / `Referer` / `Cookie` from the forwarded request

Browser bundle no longer contains the API key (massive security improvement) and never talks to `api.vaultsage.ai` directly. All requests go to same-origin `/api/v1/*`, so CORS is a non-issue.

Vite dev server has the same proxy wired in `vite.config.ts` so `pnpm dev` still works the same way.

### What user must do
1. **Delete the old Render Static Site** if you created one earlier.
2. **Create a new Render Web Service** from the `cart-helper` repo (it auto-detects `render.yaml`).
3. Set the secret env var **`VAULTSAGE_API_KEY`** (no `VITE_` prefix anymore).
4. Deploy — the same `cart-helper.onrender.com` URL now works for OCR + receipt comparison from any device.

---

## ⚠️ MITIGATED but NOT reliable — VaultSage account contamination

**Status (2026-04-25)**: Workaround helps but **is not deterministic**. Results vary run-to-run on the same image.

### What was the problem
`POST /api/v1/chat/message/v2` was injecting `suggested_files` from the caller's entire VaultSage account into the LLM context, even with `persist: false`. OCR of a real grocery shelf photo sometimes returned item names from unrelated files in the account ("樂事原味洋芋片", "義美蘇打餅") instead of what was actually in the photo.

### Three test runs, three different patterns

`scripts/contamination-test.ts` was run three times on the same Australian Bushells/Milo shelf photo.

| Run | Variant A (no field) | Variant B (`[]`) | Variant C (`[fileId]`) |
|---|---|---|---|
| 1 (afternoon) | 樂事 / 品客 / 奧利奧 (hallucinated TW snacks) | Bushells / Milo / Ovaltine ✅ | Bushells / Milo / Ovaltine ✅ |
| 2 (later) | Bushells / Milo / Ovaltine ✅ | Bushells / Milo / Ovaltine ✅ | Bushells / Milo / Ovaltine ✅ |
| 3 (smoke-test re-run) | n/a | n/a | 品客 / 樂事 / Oreo (hallucinated, even with `[fileId]`!) |

**Conclusion**: `contextual_file_ids` reduces but does not eliminate contamination. The server-side LLM can still bleed in items from the account regardless of the field. This is non-deterministic and can produce embarrassing demo results.

### What we shipped anyway
- `src/lib/vaultsage/chat.ts` — `chatV2()` now defaults `contextual_file_ids` to the message's `file_ids`. Helps in some cases. No harm in keeping it.
- `scripts/smoke-test.ts` — same workaround.
- 60/60 tests still pass.

### What user MUST do for demo day (2026-06-06)

**Treat this as P0 again.** For deterministic demo behavior:

1. **Recommended: dedicated hackathon VaultSage account** — sign up at https://vaultsage.ai with a separate email, generate a fresh API key, replace `VITE_VAULTSAGE_API_KEY` in `.env.local` (and on Vercel). Keep that account empty of files.
2. Alternative: before each demo run, delete all files in the current account via VaultSage UI.
3. Have a pre-recorded backup demo video as insurance.

The mock-mode toggles (`window.__MOCK_RECOGNIZE__`, `window.__MOCK_COMPARE__`) are also production-ready and let you do a fully offline demo if needed — see `src/lib/recognizer.ts` and `src/lib/compareReceiptRunner.ts`.

---

## P1 — fix before submission (2026-05-25)

1. **No git repo initialized** — submission requires a public repo URL. Run `git init && git add . && git commit && gh repo create` before submission.
2. **No deployed URL** — `vercel.json` is ready, but no deploy run. `vercel --prod` once and paste URL into submission form.
3. **iOS Safari real-device test pending** — agent-browser ran in headless Chromium with camera-denied → fallback path. A real iPhone test for camera permission, PWA install, and `<video playsInline muted>` behavior has not happened. Add 30 min before submission.
4. **ko / ja translation native review** — current strings are LLM-translated; tone may read slightly off to a native speaker. Get a native pass if possible before demo.

## P2 — polish, fix if time

1. **Japanese AppBar overflow risk** — "お買い物アシスタント" (10 chars) currently fits at 375px, but adding a right-side icon would push it.
2. **History grouping i18n** — date group labels ("Today" / "今天" / "오늘" / "今日") are hardcoded in `HistoryPage.tsx` rather than coming from common.json.
3. **No haptic feedback on shutter** — `navigator.vibrate` not wired.
4. **No skeleton during initial cart load from localStorage** — first paint shows empty cart for ~50ms before zustand hydrates.

## P3 — nice to have

- Designer logo PNG (currently SVG placeholder)
- Onboarding flow (first-run permission prep + locale picker)
- Export comparison as image / share sheet
- Receipt OCR raw text view (debug aid)

---

*Last updated: 2026-04-25 — contamination workaround verified end-to-end*
