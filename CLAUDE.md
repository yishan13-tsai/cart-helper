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
- PR 前跑 `pnpm typecheck && pnpm test`
- UI 改動要在瀏覽器實測（用 agent-browser）

## Agent team
見 `.claude/agents/`：architect / frontend / api-integration / designer / i18n-locale / qa-design
