# QA Report — 血拼小幫手 / ShopBuddy

**Date**: 2026-04-25 · **Branch state**: feature-complete v1 (no git init yet)
**Environment**: Vite 5.4.21 dev server at `http://localhost:5180/`, Node 24, pnpm 10.5
**Test viewport**: 375×812 (iPhone-style portrait)

## Build & test status

| Check | Result |
|---|---|
| `pnpm typecheck` | ✅ 0 errors |
| `pnpm test --run` | ✅ 60/60 pass (fx 24 + recognizer 6 + vaultsage 30) |
| `pnpm build` | ✅ JS 382.6 KB / gzip 121.0 KB · CSS 14.0 KB / gzip 3.6 KB · PWA precache 392 KiB / 9 entries |
| `pnpm dev` reachable | ✅ HTTP 200 at `/` |

## Routes implemented (smoke test on dev server)

| Route | Status | Notes |
|---|---|---|
| `/` (CameraPage) | ✅ | getUserMedia + fallback `<input type=file capture>` |
| `/cart` (CartPage) | ✅ | Hero ticker + FX line + items + action bar |
| `/history` (HistoryPage) | ✅ | Empty state + grouped-by-date list (today/yesterday/this week/older) |
| `/settings` (SettingsPage) | ✅ | LocaleSwitcher + base currency dropdown + danger-zone clear actions + #vaultsage credit |
| `/receipt/capture` (ReceiptCapturePage) | ✅ | wired to `runCompare` → history store → `/receipt/comparison/:id` |
| `/receipt/comparison/:id` (ComparisonResultPage) | ✅ | three-section reveal, success/warning/danger tones, "back to cart" + "start over" |

Persistence is live: cart and history both round-trip through `localStorage`.

## Screenshots captured

| Set | Count | Location |
|---|---|---|
| Original camera flow (frontend Task #8) | 3 | `docs/screenshots/01-camera.png`, `02-ocr-confirm.png`, `03-camera-after-add.png` |
| Cart + FX preview (frontend Task #9) | 3 | `docs/screenshots/cart-01-empty.png`, `cart-02-with-items-fx.png`, `cart-03-receipt-capture.png` |
| i18n (i18n-locale Task #7) | 8 | `docs/screenshots/i18n-{zh-TW,en,ko,ja}-{home,settings}.png` |
| QA initial sweep (qa-design Task #12) | 16 | `docs/screenshots/qa-{camera,cart,history,settings,receipt-capture}-{4 locales}.png` |

**Deferred**: ComparisonResult / SettingsPage-final / HistoryPage-with-data screenshots — qa-design agent terminated before completion. The pages are wired and visible at the corresponding routes; capture before submission day with a clean device + a `window.__MOCK_COMPARE__` injection so the result is deterministic.

## Bugs / issues by severity

### P0 — must fix before demo
- **VaultSage account contamination poisons OCR** — see `docs/CRITICAL_ISSUES.md`. User must create a dedicated hackathon account before 2026-06-06. Two live e2e probes confirmed item names from unrelated files in the account bleed into chat v2 responses.

### P1 — fix before submission (2026-05-25)
1. **No git repo initialized** — project has been entirely outside version control. Submission requires a public repo URL. `git init && git add . && git commit && gh repo create` before submission.
2. **No deployed URL** — `vercel.json` ready, but no deploy run. User needs to `vercel --prod` (or Cloudflare equivalent) and paste the URL into the submission form.
3. **iOS Safari real-device test pending** — agent-browser ran in headless Chromium with camera-denied → fallback path. Real iPhone test for camera permission + PWA install + `<video playsInline muted>` behavior has not happened. Add 30 min before submission to test on a real iPhone.
4. **Cart persistence + i18n SSR-safety** — zustand `persist` middleware reads `localStorage` synchronously; if we ever add SSR (Vercel does default to it for SSG sometimes), this would crash. Currently OK because `vercel.json` is static-only.

### P2 — polish, fix if time
1. **Japanese AppBar overflow risk** — flagged by i18n-locale during Task #7. "お買い物アシスタント" (10 chars) currently fits, but adding a right-side icon to the header would push it. Mitigation: shrink to "ShopBuddy" / "アシスタント" on /receipt/* if needed.
2. **History grouping i18n** — date group labels ("Today" / "今天" / "오늘" / "今日") are hardcoded in `HistoryPage.tsx` rather than coming from common.json. Acceptable for v1 (4 strings) but not future-proof.
3. **No haptic feedback on shutter** — design doc mentions it; not wired to `navigator.vibrate`. Trivial to add.
4. **Comparison sections always start expanded** — design intent. If receipts get long (50+ items) consider collapsing matched section by default.
5. **No skeleton during initial cart load from localStorage** — first paint shows empty cart for ~50ms before zustand hydrates. Imperceptible on fast devices but visible on cold starts.

### P3 — nice to have
- Designer logo PNG (currently SVG placeholder green basket)
- Onboarding flow (first-run camera permission prep + locale picker)
- Export comparison as image / share sheet
- Receipt OCR raw text view (debug aid)

## i18n completeness check

| Locale | Strings present | Notable | Native review |
|---|---|---|---|
| zh-TW | 100% | Default; canonical source | ✅ team-lead native |
| en | 100% | International polite tone, no idioms | ✅ team-lead native |
| ko | 100% | Polite 존댓말 | ⚠️ no native reviewer; LLM-translated |
| ja | 100% | です/ます 敬体 | ⚠️ no native reviewer; LLM-translated |

Recommend: native pass for ko/ja before demo day. The strings are functional but tone may read slightly off to a native speaker.

## Demo-day risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| VaultSage account contamination | **certain** if old key | **demo-killing** | New account before demo (P0) |
| API rate limit hits during live demo | low | high | Pre-recorded backup video; mock toggles already exist |
| jsDelivr CDN regional flakiness | low | medium | `currency-api.pages.dev` fallback already wired |
| iOS Safari camera permission denial | medium | medium | `<input type=file capture>` fallback already wired |
| Venue Wi-Fi unstable | medium | high | Tether to phone hotspot |
| Demo person taps wrong button mid-flow | medium | low | Practice run-through; demo-script.md has scene timing |
| Translation tone reads off in ko/ja | low | low | Native pass before demo if possible |

## Validation matrix (run before submission)

```bash
pnpm install
pnpm typecheck       # 0 errors
pnpm test --run      # 60/60 pass
pnpm build           # gzip < 150 KB on JS
pnpm dev             # HTTP 200 at http://localhost:5180/
```

Plus on a real device:
- [ ] Install PWA via Add to Home Screen (iOS Safari + Android Chrome)
- [ ] Camera permission flow from cold start
- [ ] FX line shows reasonable rate (not "unavailable")
- [ ] Locale switcher round-trips with persistence
- [ ] Cart survives app close-and-reopen
- [ ] History entry persists after page reload
