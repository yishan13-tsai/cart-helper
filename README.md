# 血拼小幫手 / ShopBuddy

> NURIE.AI 2026 Cross-Platform Innovation Awards entry
>
> **Tagline**: 逛街有伴，結帳不慌 · Shop smart. Check twice.

A PWA shopping companion. Photograph items as you go → AI builds your cart with names, prices, and quantities → live total + cross-currency preview → photograph the receipt at checkout → see a three-section verdict (matched / missing / extra) so you never wonder "did they ring me up right?" again.

## Status

Feature-complete v1. 60/60 tests pass. Bundle: 382 KB JS / 121 KB gzip. Four locales (zh-TW · en · ko · ja).

⚠️ **Demo blocker**: see [`docs/CRITICAL_ISSUES.md`](docs/CRITICAL_ISSUES.md). The current VaultSage API key bleeds unrelated files into OCR results — must swap to a dedicated hackathon account before demo day.

## Tech stack

- **Build**: Vite 5 + React 18 + TypeScript (strict)
- **Styling**: Tailwind 3 + JetBrains Mono for amounts + Noto Sans CJK for body
- **State**: Zustand with `persist` (cart + history both survive reloads)
- **i18n**: react-i18next (4 locales, auto-detect → localStorage → fallback `zh-TW`)
- **PWA**: vite-plugin-pwa (autoUpdate, full precache)
- **API**: VaultSage Server-side API (chat v2 + file upload)
- **FX**: fawazahmed0 currency-api via jsDelivr (Cloudflare Pages mirror fallback)

## Setup

```bash
pnpm install
cp .env.example .env.local      # fill in VITE_VAULTSAGE_API_KEY
pnpm dev                         # http://localhost:5180/
```

Without an API key the app runs against in-process mock recognizers — useful for UI work and offline demos.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Vite dev server on port 5180 (5173/5174 are reserved for other projects on this machine) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | vitest run (60 tests) |
| `pnpm build` | typecheck + Vite production build |
| `pnpm preview` | preview the built `dist/` |
| `bun run scripts/smoke-test.ts <image>` | live VaultSage e2e probe (needs `.env.local`) |

## Routes

| Path | Page | Purpose |
|---|---|---|
| `/` | CameraPage | Item-mode camera; tap shutter → OCR → confirm → add to cart |
| `/cart` | CartPage | Running total + FX preview + editable items |
| `/history` | HistoryPage | Past comparisons grouped by date |
| `/settings` | SettingsPage | Language + base currency + clear actions |
| `/receipt/capture` | ReceiptCapturePage | Receipt-mode camera; on capture → run comparison |
| `/receipt/comparison/:id` | ComparisonResultPage | Three-section matched / missing / extra reveal |

## Project layout

```
.claude/
  agents/                 # 6 subagent definitions
CLAUDE.md                 # team rules + API notes
docs/                     # design, reports, screenshots
  CRITICAL_ISSUES.md      # ⚠️ read this first
  demo-script.md          # 3-minute demo, zh-TW + en
  social-post.md          # #vaultsage post drafts
  qa-report.md            # full QA + risk register
  design-v0.md            # brand, palette, wireframes
  week1-plan.md           # data model + sequencing decisions
  fx-research.md          # why fawazahmed0 over frankfurter
  lib-vaultsage-report.md # VaultSage client design notes
  lib-fx-report.md        # FX client design notes
  scaffold-report.md
  i18n-report.md
  camera-report.md
  vaultsage-openapi.json  # cached API spec
scripts/
  smoke-test.ts           # live VaultSage probe
  README.md
src/
  pages/                  # Camera, Cart, History, Settings, ReceiptCapture, ComparisonResult
  components/             # CameraCapture, OcrConfirmModal, LocaleSwitcher
  store/                  # cart (persist), history (persist)
  hooks/                  # useBaseCurrency, useFxPreview
  lib/
    fx/                   # currency client + ISO whitelist + convert
    vaultsage/            # client / files / chat / prompts / recognize / compare
    recognizer.ts         # mock-or-real recognizer factory
    compareReceiptRunner.ts
    format.ts
  i18n/                   # init, types, llm-locale helper
  locales/{zh-TW,en,ko,ja}/common.json
```

## Architecture

The app is a Vite-built SPA served by a tiny Express BFF (`server/index.js`). The BFF:
- Serves the static `dist/` with SPA fallback
- Reverse-proxies `/api/v1/*` → `https://api.vaultsage.ai/api/v1/*`, injecting `X-Api-Key` server-side from `VAULTSAGE_API_KEY`

**Why a BFF, not pure static**: VaultSage's CORS allowlist only lets `localhost` call the API directly from a browser. Any deployed origin (Render, GitHub Pages, custom domain, LAN IP) gets blocked at preflight. The BFF makes server-side calls that bypass CORS entirely, and as a bonus the API key never reaches the browser.

In `pnpm dev`, Vite's dev server has the same `/api/v1` proxy wired in `vite.config.ts`, so the dev experience is identical without needing to run the Express server separately.

## Deploy (Render Web Service)

`render.yaml` at the repo root is the IaC config.

1. https://dashboard.render.com/web/new
2. Connect `yishan13-tsai/cart-helper`
3. Render auto-detects `render.yaml`:
   - Build command: `corepack enable && pnpm install --frozen-lockfile && pnpm build`
   - Start command: `pnpm start`
   - Health check: `/healthz`
   - Node version: 20
4. **Set the secret env var: `VAULTSAGE_API_KEY`** (paste your VaultSage personal key — no `VITE_` prefix)
   - `VAULTSAGE_BASE_URL` is already set in `render.yaml`
5. Click **Create Web Service** — first deploy takes ~3 minutes
6. Open `/healthz` on the Render URL to confirm the BFF is up: `{"ok":true,"hasApiKey":true,...}`

## Submission checklist (2026-05-25)

- [ ] Dedicated VaultSage hackathon account created and wired
- [ ] Repo pushed to GitHub (`gh repo create cart-helper --public`)
- [ ] Deployed to Vercel
- [ ] PWA installable on iPhone Safari + Android Chrome (real device test)
- [ ] `#vaultsage` social post live + URL captured
- [ ] Demo video recorded (per `docs/demo-script.md`)
- [ ] Submission form filled

## Demo day (2026-06-06)

See [`docs/demo-script.md`](docs/demo-script.md) for scene-by-scene voiceover.
Wow moments to defend:
1. Live running total ticker (JetBrains Mono mono-width digits)
2. FX cross-currency preview
3. Three-section receipt comparison ⭐

## License & credits

Hackathon entry — license TBD pending submission rules. Powered by [VaultSage](https://vaultsage.ai). #vaultsage
