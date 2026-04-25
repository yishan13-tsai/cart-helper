# Week 1 Plan — cart-helper

> 報名 4/30、提交 5/25、Demo 6/6。Week 1 目標：能跑 dev server、OCR 能回一筆商品。

## 1. Sequencing 決策

順序：**B → A → D → C**

- **B (設計文件) 先**：資料模型、API flow、state shape 沒定下來，scaffold 和 task 拆分都會白做。這份 plan 本身就是 B 的一部分。
- **A (scaffold) 第二**：Vite+React+TS+Tailwind+i18next+PWA skeleton，先把跑得起來的空殼蓋好，agents 才有地方下手。
- **D (API smoke test) 第三**：VaultSage key user 還沒給，擋在 B/A 之前會卡住全隊；scaffold 完成後再做，key 到了就能立刻驗。先用 `openapi.json` + mock response 推進 api-integration 的型別層。
- **C (拆 task 開工)**：B/A 有產出後，task 才有清楚的 interface 和落點。

## 2. 資料模型 v0

```ts
type Currency = 'TWD' | 'USD' | 'JPY' | 'KRW';

interface CartItem {
  id: string;              // uuid, client-generated
  name: string;
  unitPrice: number | null;
  quantity: number;
  currency: Currency;
  sourceFileId?: string;   // VaultSage file_id (商品照)
  confidence?: number;     // 0-1, from OCR
  createdAt: number;
}

interface Cart {
  id: string;
  items: CartItem[];
  currency: Currency;
  total: number;           // derived, cached
  updatedAt: number;
}

interface Receipt {
  fileId: string;          // VaultSage file_id
  capturedAt: number;
  totalOnReceipt?: number;
}

interface ComparisonResult {
  cartId: string;
  receipt: Receipt;
  matched: CartItem[];
  missingFromReceipt: CartItem[];
  extraOnReceipt: Array<Omit<CartItem, 'id'> & { id: string }>;
  totalInCart: number;
  totalOnReceipt: number;
  difference: number;
}

interface HistoryEntry {
  id: string;
  cart: Cart;
  comparison?: ComparisonResult;
  savedAt: number;
}
```

持久化：localStorage（`cart:current`, `history:*`）。State：Zustand。

## 3. Week 1 任務清單

| Agent | 任務 |
|---|---|
| **architect (me)** | (1) 本文件 (2) review scaffold PR + API flow 設計 doc |
| **frontend** | (1) Vite+React+TS+Tailwind+PWA scaffold，能 `pnpm dev` (2) `CameraCapture` component（getUserMedia + canvas snapshot） |
| **api-integration** | (1) 從 `vaultsage-openapi.json` 產 TS types + `vaultsageClient`（upload/chat/status 三個 method，含 mock mode） (2) OCR prompt runner：blob → CartItem[] |
| **designer** | (1) 三主畫面 wireframe：購物中 / 購物車列表 / 收據對照 (2) Tailwind design tokens（色彩、間距、字級） |
| **i18n-locale** | (1) react-i18next 設定 + zh-TW/en 兩語系 common.json (2) locale 偵測 hook（localStorage → navigator → 預設 zh-TW） |
| **qa-design** | (1) 定義 Week 1 demo 驗收腳本（相機→OCR→加入購物車 happy path） (2) 列 camera permission / iOS Safari 相容性要點 |

## 4. Top 3 風險

1. **VaultSage API key 延遲 / 額度** — 擋住 E2E。緩解：api-integration 先做 mock mode，client 抽象同介面；key 到位後切換只改 env。
2. **LLM OCR 準確度 / 延遲 2-5s** — 體驗殺手。緩解：上傳前壓縮（max 1280px, JPEG 0.8）、loading skeleton、失敗時允許手動修正（`CartItem` 本來就可編輯）。
3. **iOS Safari getUserMedia 權限** — PWA 殺手。緩解：qa-design Day 2 就用真機測，備援 `<input type="file" capture>`。

## 5. 不做什麼 (v1 out of scope)

- ❌ 帳號 / 登入 / 雲端同步（history 只存 localStorage）
- ❌ 多人共享購物車
- ❌ 自家 BFF（API key 暫時 client 直連，README 註明）
- ❌ 商品條碼掃描（只做拍照 OCR）
- ❌ 多幣別換算（同一購物車固定單一 currency）
- ❌ ko / ja 文案（i18n 框架留好，Week 1 只交 zh-TW + en）
- ❌ 離線 OCR（service worker 只 cache app shell）
- ❌ 歷史紀錄搜尋 / 篩選 / 匯出
