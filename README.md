# 血拼小幫手 / Cart Helper

> NURIE.AI 2026 Cross-Platform Innovation Awards 參賽作品
>
> **Tagline**: 逛街有伴，結帳不慌 · Shop smart. Check twice.

一款專為旅遊購物設計的 PWA，解決「出國逛街算不清楚花了多少錢」的痛點。

拍照辨識商品 → 購物車即時計算 + 匯率換算 → 掃收據對照差異

---

## 功能總覽

### 拍照辨識商品
對準價格標籤按快門，VaultSage AI（RAG 模式）自動抓取品名、單價、數量、幣別、促銷文字，加入購物車。辨識期間可繼續拍下一張，不需等待。

### 購物車
- **即時小計**：每件商品可點擊修改單價，支援還原 OCR 原始值
- **匯率換算**：OCR 自動辨識幣別（¥ → JPY）；購物車小計與每件商品下方同步顯示換算成主幣別的金額（由 Settings 設定）
- **促銷自動套用**：解析「第 2 件 6 折 / 兩件 99 / 買一送一」等優惠字串，點擊 pill 套用折扣
- **歷史比價警示**：比對近期購物紀錄，漲價 / 降價以顏色 pill 標示
- **預算提醒**：超過 80% 顯示警告，超支變紅

### 收據對照
結帳後掃收據，AI 比對購物車 vs 發票，分四類標示：相符 / 價差 / 收據少了 / 多收了。差額自動計算。

### 購物清單
- 出發前手動加入商品；到店掃描到後自動打勾
- **AI 解析**：貼上或輸入自由文字（「牛奶 2 瓶、衛生紙、洗髮精」），VaultSage 解析後批次加入

### 購物紀錄
每次購物存檔。可回顧品項明細；有收據對照的顯示差異統計，沒對照的顯示購物清單。

---

## 技術棧

| 項目 | 選擇 |
|---|---|
| Build | Vite 5 + React 18 + TypeScript (strict) |
| Styling | Tailwind 3 · 8 主題 CSS token 系統 |
| State | Zustand + persist（cart / history / list 存活於 reload）|
| i18n | react-i18next · zh-TW / en / ko / ja 四語系 |
| PWA | vite-plugin-pwa（autoUpdate, full precache）|
| AI / OCR | VaultSage Server-side API（chat v2 RAG 模式 + file upload）|
| FX | fawazahmed0 currency-api（ECB 每日匯率，localStorage 快取）|
| 安全 | Express BFF proxy（`server/index.js`）· API Key 不落地 browser |

---

## 架構說明

```
Browser  ──→  Vite SPA (dist/)
                  ↓ /api/v1/*
             Express BFF (server/index.js)
                  ↓ X-Api-Key injected server-side
             VaultSage API (api.vaultsage.ai)
```

BFF 代理 `/api/v1/*` 並注入 `VAULTSAGE_API_KEY`（Render 環境變數），API Key 從不進入 client bundle。開發環境由 `vite.config.ts` 的 `server.proxy` 處理，體驗一致。

---

## 本地開發

```bash
pnpm install
cp .env.example .env.local   # 填入 VAULTSAGE_API_KEY
pnpm dev                      # http://localhost:5180/
```

```bash
pnpm typecheck   # tsc --noEmit
pnpm test        # vitest
pnpm build       # typecheck + Vite production build
```

---

## 路由

| Path | 頁面 |
|---|---|
| `/` | → redirect `/scan` |
| `/scan` | 相機（掃商品）|
| `/list` | 購物清單 + AI 解析 |
| `/cart` | 購物車 + 匯率 + 促銷 |
| `/history` | 購物紀錄 |
| `/settings` | 語言 / 主幣別 / 主題 |
| `/receipt/capture` | 相機（掃收據）|
| `/receipt/comparison/:id` | 對照結果 |

---

## 部署（Render）

1. 連結 GitHub repo
2. `render.yaml` 自動設定 build / start / healthcheck
3. 設定 env var：`VAULTSAGE_API_KEY`
4. 驗證：`/healthz` 回傳 `{"ok":true,"hasApiKey":true}`

---

## 提交 Checklist（截止 2026-05-25）

- [ ] 專用 VaultSage hackathon 帳號建立並替換 API Key
- [ ] `#vaultsage` 社群貼文發布
- [ ] 實機測試（iPhone Safari + Android Chrome PWA 安裝）
- [ ] Demo 影片錄製
- [ ] 報名 / 提交表單填寫

---

## Demo Day（2026-06-06）

亮點場景：
1. 拍照 → 商品即時加入購物車 + ¥ → NT$ 換算
2. AI 購物清單解析（貼上文字批次加入）
3. 掃收據 → 三欄對照差異報告

---

Powered by [VaultSage](https://vaultsage.ai) · #vaultsage
