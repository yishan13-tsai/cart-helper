# cart-helper · Design

---

## v1 修訂（2026-04-24）— 定案：血拼小幫手

User 拍板 app 名為 **血拼小幫手**，覆蓋 v0 的「算盤 Suan」提案。v0 內容保留於下方作為 archive。

### 最終命名（4 語系）

| Locale | 名稱 | 備註 |
|---|---|---|
| zh-TW | **血拼小幫手** | 主名；「血拼」為 shopping 台式音譯，俏皮但大眾化 |
| en | **ShopBuddy** | 選 ShopBuddy 而非 Shopping Sidekick（過長）或 Cart Pal（偏兒童向）；一詞、好記、能當 wordmark |
| ko | **쇼핑 도우미** | 「도우미」= 小幫手，最自然通用；「친구」太隨性 |
| ja | **お買い物アシスタント** | 敬體保禮貌感；「お供」太古風，與友善俏皮 tone 不合 |

### Tagline 4 語系（配合 sidekick 友善感，避免幼稚）

| Locale | Tagline | 設計意圖 |
|---|---|---|
| zh-TW | 逛街有伴，結帳不慌 | 對仗工整、口語；點出「陪伴 + 安心」雙價值 |
| en | Shop smart. Check twice. | 雙動詞、押 sh/ch 音；smart 收斂可愛、twice 呼應「對收據」 |
| ko | 쇼핑도, 계산도, 같이 | 「연도」韻腳；突顯「一起」sidekick 感 |
| ja | 買い物、いっしょに賢く。 | 「いっしょに」= 一起，「賢く」收住不幼稚 |

### Palette 決定：**保留 v0 不動**

理由：
- `#0E9F7E` 藍綠同時傳達「信任 / 健康 / 不浮誇」，放在友善 tone 上反而是**反差優勢**——「小幫手」已靠文字給俏皮感，視覺若再暖化成橘紅會變玩具感，失去「幫你管錢」的可信度。
- accent `#F5A524`（琥珀）本來就是暖色錨點，友善感已經夠。
- 唯一微調：之前列的 `primary-50 #E6F6F0` 僅用於 tag bg，v1 追加一個 **`brand-warm-50 #FFF6E6`**（淺奶油）用於 onboarding / empty state 背景，帶一點溫度但不搶 CTA。

```ts
// 追加到 theme.extend.colors
brand: { warm50: '#FFF6E6' },
```

### Logo wordmark 概念

**zh-TW 主 wordmark**：「血拼小幫手」**Noto Sans TC 700** 字重，「血拼」`secondary-500` 深藍 + 「小幫手」`primary-500` 藍綠，兩色分段暗示「購物 → 幫你算」的流程；「手」字最後一筆向右延伸成一條細底線（2px，primary-500），收束成微笑曲線——不加任何 icon，字體本身即 logo。

**en wordmark**：`ShopBuddy` 連寫，B 大寫，`Shop` 深藍 + `Buddy` 藍綠，同色邏輯跨語系一致。

**為什麼不畫 icon**：1 個月工期、avoid「AI sparkle 過度」原則、多語系 app 在 PWA icon 用單字「血」或「S」反而比購物車 icon 更有記憶點。App icon 方案：藍綠底 + 白色「血」字（Noto Sans TC 900）。

### 下游影響（frontend / i18n-locale 注意）
- `src/locales/{lang}/common.json` 的 `app.name` 與 `app.tagline` 以上表為準
- Noto Sans TC 對「血拼」二字渲染沒問題；但 iOS Safari PWA home screen icon 建議 pre-render 成 PNG，避免字型未載入
- AppBar 標題若放全名「血拼小幫手」較長（6 字），在 375px 下要給 160px 寬，或在進入子頁後縮成「血拼」二字

---

# Archive: Design v0（已被 v1 覆蓋，保留參考）

## 1. App 名稱 3 選 1

### 方案 A（主推）：**算盤 Suan** / Suan
- Tagline
  - zh-TW：逛到哪、算到哪
  - en：See it. Scan it. Know the total.
  - ko：담으면 바로, 계산 끝
  - ja：かごに入れたら、もう合計
- 理由：「算盤」一字華人秒懂，Suan 國際唸得出；單音節 logo 好做，暗示「精算、踏實」，呼應 brand tone「calm cashier」。

### 方案 B：**Tallie**
- zh-TW：小計 Tallie / en：Tallie / ko：탈리 / ja：タリー
- Tagline：小計不小氣 / Every item counts / 장바구니의 작은 계산기 / 買い物のそばに
- 理由：tally（清點）擬人化，親和；但偏可愛，與「不 cute」原則略衝突，故次位。

### 方案 C：**ReceiptZero**
- Tagline：收據不再是謎 / Zero-surprise checkout / 영수증 제로 미스터리 / レシートに驚かない
- 理由：直白功能導向；但名稱長、CJK 翻譯散。

## 2. Brand direction（主推 Suan）

**個性**：可靠的櫃台會計，動作快但不催你；冷靜的藍綠 + 暖中性，拒絕 AI 紫漸層。

**Palette**
| Token | Hex | 用途 |
|---|---|---|
| primary-500 | `#0E9F7E` | 主 CTA、shutter、running total 強調 |
| primary-600 | `#0B8468` | pressed |
| primary-50  | `#E6F6F0` | tag bg |
| secondary-500 | `#1F3A5F` | 深藍；title、AppBar |
| accent-500 | `#F5A524` | 差異警示（amber，非紅） |
| neutral-900 | `#111418` |
| neutral-700 | `#3D434D` |
| neutral-400 | `#9AA0AA` |
| neutral-100 | `#F4F5F7` |
| neutral-0   | `#FFFFFF` |
| success-500 | `#16A34A` | matched |
| warning-500 | `#D97706` | missing |
| danger-500  | `#DC2626` | extra / 金額不符 |

**Typography**（Google Fonts，全支援 CJK）
- Display / UI：**Noto Sans TC** 700 / 500 / 400（同字型族同時處理 en / ko / ja 以 Noto Sans KR+JP fallback）
- Numeric（金額）：**JetBrains Mono** 600 — 等寬，running total 跳動不晃
- Size ramp：11 / 13 / 15 / 17 / 22 / 28

## 3. Tailwind tokens（貼入 `tailwind.config.ts` → `theme.extend`）

```ts
colors: {
  primary: { 50:'#E6F6F0', 500:'#0E9F7E', 600:'#0B8468' },
  secondary: { 500:'#1F3A5F' },
  accent: { 500:'#F5A524' },
  neutral: { 0:'#FFFFFF', 100:'#F4F5F7', 400:'#9AA0AA', 700:'#3D434D', 900:'#111418' },
  success: { 500:'#16A34A' },
  warning: { 500:'#D97706' },
  danger:  { 500:'#DC2626' },
},
fontFamily: {
  sans: ['"Noto Sans TC"','"Noto Sans KR"','"Noto Sans JP"','system-ui','sans-serif'],
  mono: ['"JetBrains Mono"','ui-monospace','monospace'],
},
```

## 4. 關鍵畫面 Wireframe（375px）

### A. Camera mode
```
┌─────────────────────────────┐
│ ← 算盤              NT$ 284 │ ← AppBar + running total
├─────────────────────────────┤
│ [ 商品 ]   收據              │ ← segmented toggle
│┌───────────────────────────┐│
││                           ││
││      live camera          ││
││      [ focus box ]        ││
││                           ││
│└───────────────────────────┘│
│       ╭───────╮              │
│       │   ●   │ 72px shutter │
│       ╰───────╯              │
│  相簿        閃光        翻轉 │
└─────────────────────────────┘
```

### B. OCR 結果確認（可編輯）
```
┌─────────────────────────────┐
│ ← 確認 3 項商品              │
├─────────────────────────────┤
│ [縮圖] 鮮乳 930ml            │
│        NT$ 89   × [ 1 ] ✎   │
│ ─────────────────────────── │
│ [縮圖] 吐司 (信心低 ⚠)       │
│        NT$ --   × [ 1 ] ✎   │
│ ─────────────────────────── │
│ + 手動新增                   │
├─────────────────────────────┤
│      加入購物車  →  NT$ 284 │
└─────────────────────────────┘
```

### C. 購物車主畫面（running total = hero）
```
┌─────────────────────────────┐
│ 購物車 (7)         ⋯         │
├─────────────────────────────┤
│                              │
│        NT$ 1,284             │ ← 44px mono, primary-500
│        7 件 · 估算           │
│                              │
├─────────────────────────────┤
│ 鮮乳 930ml      89 × 1   🗑 │
│ 蘋果            35 × 6   🗑 │
│ 吐司           55  × 2   🗑 │
│ ...                          │
├─────────────────────────────┤
│ [ 📷 繼續拍 ]  [ 🧾 對收據 ] │
└─────────────────────────────┘
```

### D. 收據對照結果（hero moment #2）
```
┌─────────────────────────────┐
│ ← 對照結果                   │
├─────────────────────────────┤
│  購物車 1,284   收據 1,320   │
│        差異 +NT$ 36  ⚠       │ ← accent-500
├─────────────────────────────┤
│ ✅ 相符 (5)          ▾       │
│   鮮乳 · 蘋果 · 吐司 …       │
├─────────────────────────────┤
│ ⚠ 收據少了 (1)       ▾       │
│   餅乾  NT$ 45               │
├─────────────────────────────┤
│ ❗ 多收了 (1)         ▾       │
│   袋子  NT$ 3                │
│   [ 這是對的 ] [ 向店家反映 ] │
└─────────────────────────────┘
```

### E. History
```
┌─────────────────────────────┐
│ 紀錄              🔍         │
├─────────────────────────────┤
│ 今天                         │
│ ┌─────────────────────────┐ │
│ │ 全聯 · 14:22   NT$ 1,284│ │
│ │ 7 件 · 差異 +36  ⚠      │ │
│ └─────────────────────────┘ │
│ 昨天                         │
│ ┌─────────────────────────┐ │
│ │ 家樂福 · 19:10  NT$ 620 │ │
│ │ 4 件 · 相符 ✅           │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

## 5. Demo Day 視覺策略
1. **Hero 鏡頭**：手持手機逛便利商店貨架，shutter 按下 → running total 跳動，等寬數字一格一格上跳，3 秒內講完核心價值。
2. **Split-screen before/after**：左「收據一疊對不上」紙本痛點，右「對照結果」綠勾 + 琥珀警示，顏色對比立刻說服評審。
3. **End card**：深藍 secondary-500 底 + primary-500 算盤 wordmark + 四語 tagline 輪播 0.8s 一張，收在 `#vaultsage`。

---
主推：**算盤 Suan** · 主色：**primary-500 `#0E9F7E`** · 最得意決策：**running total 用 JetBrains Mono 等寬數字**——讓 hero moment 的跳動不會因字寬變化而晃動，一個字型選擇同時解決視覺穩定 + 技術感 + 低成本。
