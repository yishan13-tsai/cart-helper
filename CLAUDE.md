# 血拼小幫手 (cart-helper)

NURIE.AI 2026 Cross-Platform Innovation Awards 參賽作品。
購物車助手：拍照辨識商品 → 即時計算金額 → **匯率即時換算** → 拍收據對照差異。

## 比賽要點
- **報名截止**: 2026-04-30
- **作品提交**: 2026-05-25
- **Demo Day**: 2026-06-06
- **平台**: Web App (PWA)
- **評分**: Tech 45% / Creativity 40% / Business 15%
- **必要**: 使用 VaultSage Server-side API + 社群貼文標 `#vaultsage`

## 技術棧
- Vite + React 18 + TypeScript
- Tailwind CSS
- react-i18next (zh-TW / en / ko / ja)
- vite-plugin-pwa
- 相機: `getUserMedia` + `<canvas>` 截圖
- 部署: Vercel static / Cloudflare Pages

## VaultSage API
- Base URL: `https://api.vaultsage.ai`
- Auth: `X-Api-Key: <personal>` 或 `X-Team-Api-Key: <team>`（不可同時送）
- OpenAPI: `https://api.vaultsage.ai/api/v1/openapi.json`
- 環境變數: `VITE_VAULTSAGE_API_KEY`（注意：browser 暴露 key 有風險，正式版應走自家 BFF；hackathon demo 階段可先 client 直連）

### 核心 endpoint
| 用途 | Method | Path | 備註 |
|---|---|---|---|
| 上傳圖片 | POST | `/api/v1/files/` | multipart, 回傳 `file_id` (uuid) |
| LLM 對話 | POST | `/api/v1/chat/message/v2` | 支援 OpenAI/Gemini，message 可帶 `file_ids` |
| 列檔案 | GET | `/api/v1/files/` | 歷史購物紀錄查詢 |
| 處理狀態 | POST | `/api/v1/files/processing-status` | 圖片上傳後 polling |

### 標準流程：商品 OCR
```
1. 拍照 → blob
2. POST /api/v1/files/  (multipart, files=[blob])  → file_id
3. POST /api/v1/chat/message/v2
   {
     "messages": [{
       "actor": "user",
       "content": "<OCR prompt 見下>",
       "file_ids": ["<file_id>"]
     }],
     "persist": false
   }
4. parse JSON from response
```

### OCR prompt template
```
你是購物商品辨識助手。從圖片中辨識所有商品，輸出 JSON：
{
  "items": [
    {"name": "<商品名>", "unit_price": <數字>, "quantity": <數字>, "currency": "<ISO 4217>"}
  ],
  "confidence": <0-1>
}
規則：
- 價格無法確定時設為 null
- 不要解釋，只回 JSON
- 用 <user_locale> 回傳商品名
```

### 收據對照 prompt
```
比對購物車與收據，找出差異：
購物車: <JSON>
收據圖片: 見 file_ids
輸出：
{
  "matched": [...], "missing_from_receipt": [...], "extra_on_receipt": [...],
  "total_in_cart": <num>, "total_on_receipt": <num>, "difference": <num>
}
```

## 匯率換算
- v1 IN scope（user override architect's out-of-scope）
- 使用情境：旅遊購物（韓/日/台/美使用者跨幣別）顯示「換算成主幣別」
- API 候選：frankfurter.app（免 key、ECB 每日匯率）為主；exchangerate.host 為備援
- 快取：每日匯率寫 localStorage `fx:rates:YYYY-MM-DD`，避免重複請求
- 主幣別由 user 在 settings 設定，預設依 locale 推測（zh-TW→TWD, en→USD, ko→KRW, ja→JPY）

## i18n 規則
- 預設 locale: zh-TW
- 偵測順序: localStorage → navigator.language → 預設
- LLM prompt 內 `<user_locale>` 動態注入
- 字串檔位置: `src/locales/{lang}/common.json`

## 開發守則
- TypeScript strict mode
- 不放秘密到 git，用 `.env.local`
- **git push 前必須先跑 `pnpm build`，build 失敗不可 push**
- PR 前跑 `pnpm typecheck && pnpm test`
- UI 改動要在瀏覽器實測（用 agent-browser）
- **技術架構決策一律寫進本檔的「架構決策」章節**，不要散落在 commit message 或臨時筆記裡

## 架構決策
記錄關鍵技術選擇與其理由。新加的決策放最後並標日期。

### 設計系統
- **8 主題 token 系統**（2026-04-28）— 從 Claude Design handoff 落地，CSS vars 在 `src/index.css`、Tailwind 對應在 `tailwind.config.ts`。預設 `tomato`，由 `<html data-ch-theme>` 切換。新增主題只要加一組 CSS vars。
- **Icon 一律用 SVG，不用 emoji**（2026-04-28）— 原因：emoji 跨平台/作業系統渲染不一致（iOS / Android / Windows / web fonts 差異大），且配色受系統強制（無法 `currentColor`）。**統一用 lucide-react** 經 `src/components/TIcon.tsx` 包裝，提供穩定的 design-handoff naming（`scan` / `cart` / `chev` 等）。新增 icon → 在 `TIcon.tsx` 加一筆 lucide 對應，**不要直接在頁面 import lucide**，保持單一改動點。
  - 適用範圍：所有 UI（nav、按鈕、狀態標、空狀態、empty state、toast）
  - 例外：locale JSON 檔內的字串可以用 emoji（純文字內容，不是裝飾）
- **PWA 行動端體感全域 CSS**（2026-05-08）— `body` 加 `touch-action: manipulation`（擋 iOS 雙擊縮放）、`-webkit-tap-highlight-color: transparent`（去掉藍色 tap 殘影）、`overscroll-behavior-y: none`（停掉 scroll bounce 漏底）。viewport meta 已禁 pinch-zoom。理由：cart-helper 是相機驅動的單頁工具，使用者單手操作，原生 iOS Safari 預設手勢會干擾掃描節奏。

### API
- **OCR 走 RAG mode**（2026-04-27）— `chat v2` 不帶 `file_ids` 而是 `contextual_file_ids`，因為 VaultSage chat-end vision 會幻覺，indexing-end summary 才準。代價：要先等 `pollProcessing(file_id, { waitFor: 'summary' })`（10–25s）。
- **chat timeout 90s + 1 retry**（2026-04-28）— RAG 路徑慢，原 45s 常 timeout；BFF proxy 設 180s 給 retry headroom。
- **OCR prompt + Zod schema 加 `promotion` 欄位**（2026-05-08）— LLM 抓商品時順便把價格標上的促銷字串（`第二件 6 折` / `兩件 99` / `會員價 79` …）原樣抄回，存到 `CartItem.promotion`。**刻意不結構化**，因為促銷句型寫法太多，硬要 LLM fit schema 反而脆弱；下游用 `parsePromotion()` 自己 regex 解。OCR prompt 額外明確要求 `unit_price` 是「單件原價、不要預先扣折」，避免跟促銷標重複扣。Schema 用 `.optional().nullable()` 向後相容老歷史資料。

### 資料模型 / 路由
- **Trip metadata 整合進 cart store**（2026-04-28）— 沒拆 `useTripStore`，因為「同一時間最多一個 active trip」這個不變式很強。在 `useCartStore` 多 `startedAt` / `store` 兩個欄位 + `startTrip(store?)` / `endTrip()` action；結束 trip = 把 cart snapshot 推進 `useHistoryStore` 後重置。歷史 = `useHistoryStore.entries`。
- **首次加品項自動 startTrip**（2026-04-28）— 使用者沒按「開始購物」也能直接掃；`addItem` 偵測 `startedAt === 0` 時自動補時間戳，避免強迫流程。
- **路由：`/` = HomePage，`/scan` = CameraPage**（2026-04-28）— 原本 `/` 直接是相機，改後 Home 變 landing dashboard。底部 nav 5 格，中間是凸起 SCAN 圓鈕（`navigate('/scan')`），不是頁面 tab。`isFullscreen` 判斷 `/scan` 與 `/receipt/*` 時隱藏 nav。
- **Budget 用獨立 hook（`useBudget`）而非 cart store**（2026-04-28）— 預算是 user setting 不是 trip data，存 `localStorage['app.tripBudget']`。`classifyBudget` 給 UI 三檔（ok / warning >80% / over >100%）。
- **TripGate 內嵌在 CameraPage**（2026-04-28）— 沒 active trip 時 `/scan` 不直接渲染相機，先 render `<TripGate>` 強制使用者開 trip。原本 HomePage 已刪，`/` 改 `<Navigate to="/scan" replace />`。底部 nav 第一格也從 Home 換成 History。理由：每張掃描的照片都該有歸屬 trip；hackathon 評分時 demo 才不會出現「孤兒商品」。
- **Nav 顯示邏輯：camera 啟動才隱藏**（2026-04-28）— `App.tsx` 用 `tripActive = startedAt > 0 || items.length > 0`，只在 `/scan && tripActive` 與 `/receipt/*` 隱藏 nav。TripGate 出現時 nav 留著，使用者不會被困在 modal。
- **CartPage 改 fixed-height + 內部捲動**（2026-05-08）— page 容器是 `flex h-full flex-col overflow-hidden`，分三段：header / 商品列表（`min-h-0 flex-1 overflow-y-auto`）/ 訂金卡（`shrink-0`，靜態置底）。原本訂金卡是 `absolute bottom-7`，列表 padding 留缺口，但 keyboard / safe-area / dynamic content 一變就破版。新版只有列表 scroll，訂金卡永遠在視野裡。`min-h-0` 是 flexbox 必要的「允許 flex-1 子元素縮小到內容高度以下」的眉角。底部 `pb-10` 給中央凸起 SCAN 圓鈕（h-16，`-translate-y-1/2`）clearance，避免壓到「結束購物」連結。

### Features
- **漲價警示用純前端 history 比對**（2026-04-29）— `src/lib/priceHistory.ts` + `usePriceTrend` hook 比對當前商品名 vs `useHistoryStore.entries`，case-insensitive 雙向子字串 match（"統一鮮乳" ↔ "統一鮮乳 936ml"），±5% 閾值。**沒用 LLM** 因為純子字串足以 demo；之後若要做更模糊的 match（"牛奶" ↔ "鮮乳"）再加 chat v2。Pill 出現在 CartPage `ItemCard`，alert-wash 漲 / success-wash 降。
- **Comparison 頁的金額一律以本地 cart 為準**（2026-04-30）— `ComparisonResultPage` 不再相信 LLM 回的 `total_in_cart` 與 `difference`；改用 `entry.cart.total` 當購物車合計，再以 `totalOnReceipt - totalInCart` 重算 diff。LLM 偶爾會把 cart 總額幻覺掉，導致「1 相符 / 0 價差 / +NT$80」這種自相矛盾的畫面。Receipt 那邊仍信 LLM（它有看到收據印的合計）。
- **Matched 同名但價格不同 = 價差**（2026-04-30）— LLM 是用名字相似度判斷 matched，不會分辨價差，所以 UI 端要再比一次 line total（unitPrice × quantity）：差超過 0.01 就改判到 `price-diff` 狀態，4 格 stats 也用這個重新算「相符 vs 價差」。新增 `'price-diff'` 狀態 dot 用 `bg-alert`。
- **HistoryPage / Comparison 全面用 currency token**（2026-04-30）— 原本好幾個地方寫死 `NT$`，國際旅遊使用情境（韓 / 日 / 美）會顯示錯。改用 `currencySymbol(cart.currency)`、`formatAmount(amount, locale)`。本月省下只 sum 與 base currency 相同的 trip（避免跨幣別 ECB 換算的複雜度），不同幣別仍計入 trip / discrepancy 數字。
- **促銷自動套用 (regex parser)**（2026-05-06）— `src/lib/promotion.ts` 解析 OCR 抓到的優惠字串（第N件X折 / N件X / 買N送M / 加一元多一件 / 第N件半價），算出 line discount。`CartItem.promotionApplied` 是 boolean，使用者點 pill 才生效；store 的 `computeTotal` 偵測到旗標就把 discount 從該 line 扣掉，數量變動時自動重算（不需 invalidate）。**沒用 LLM** 因為這幾種句型 regex 就 cover 完，無 round-trip 延遲。Pattern 解不到時降級為 muted 「僅供參考」pill。促銷 pill 顯示金額用 `formatAmount(amount, locale)` 強制 0 小數位，TWD/JPY/KRW 不會出現 `Save NT$35.6` 這種破壞質感的數字。
- **OCR unitPrice 保留原始值供 undo**（2026-05-06）— `CartItem.originalUnitPrice` 在 ingest 時複製 `unitPrice`，使用者手改價格後出現「還原」按鈕，按下還原成 OCR 值並清掉 `priceEdited`。同時把編輯狀態從 10px icon 升級為「已修改」chip，可見度提高。input 也從 `type=number` 換成 `type=text inputMode=decimal`，commit 時 strip thousands separator，避免 Android 上小數點失蹤 / 貼上 `1,200` 變 NaN。

## Agent team
見 `.claude/agents/`：architect / frontend / api-integration / designer / i18n-locale / qa-design
