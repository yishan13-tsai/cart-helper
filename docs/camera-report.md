# Camera Flow Report — Task #8

Date: 2026-04-24 · Agent: frontend

## 交付

| 檔案 | 用途 |
|---|---|
| `src/pages/CameraPage.tsx` | 主頁 — ModeToggle (商品/收據) + top bar running total + OcrConfirmModal 整合 |
| `src/components/CameraCapture.tsx` | `getUserMedia({facingMode: ideal environment})` + canvas → `image/jpeg` blob + 72px shutter button + 4 status (idle/requesting/streaming/denied/unsupported) + 相簿 fallback |
| `src/components/OcrConfirmModal.tsx` | Bottom sheet，可編輯 name / unitPrice / quantity，低信心 (<0.7) 和未知價警示，footer 顯示 running 小計 |
| `src/lib/recognizer.ts` | `Recognizer = (blob, locale) => Promise<CartItem[]>` contract + `mockRecognizer` + `resolveRecognizer()`（讓 `window.__MOCK_RECOGNIZE__` 覆蓋用） |

另修：`src/router.tsx` 把 `/` 換成 CameraPage；`src/App.tsx` 相機頁隱藏 header；`tailwind.config.ts` 加 `colors.brand.warm50 = '#FFF6E6'`。

## 驗收（agent-browser, viewport 375×812）

| 步驟 | 結果 |
|---|---|
| 開 `http://localhost:5180/` | ✅ 200 + CameraPage render |
| Camera permission | ✅ headless Chrome → denied → 顯示 `Camera access denied` + 「Use photo library」fallback button |
| Shutter / 相簿 流程 | ✅ `window.__MOCK_RECOGNIZE__` 注入 3 筆假資料 → OcrConfirmModal 開啟「Confirm 3 item(s)」 |
| Modal editing | ✅ 三筆都可改 name/price/qty，蘋果 unitPrice=null 顯示警示 |
| Running total | ✅ 89 + 55×2 + 0 = 199 (蘋果價格 null 不計入) |
| Add to cart | ✅ 點按鈕 → modal 關 → top bar 由 `NT$ 0 / 0 items` → `NT$ 199 / 3 items` |
| Typecheck / Build | ✅ `pnpm typecheck` 0 errors；`pnpm build` 成功 |

Bundle: JS 287 KB (gzip 93.6 KB), CSS 11.7 KB (gzip 3.1 KB)，precache 9 entries 295 KiB。比 scaffold 後的 208/6.7 增長主因：i18next + 4 locale + zustand 增加使用 + vaultsage client + fx client。

截圖：`docs/screenshots/01-camera.png` · `02-ocr-confirm.png` · `03-camera-after-add.png`

## 踩的坑

### 1. iOS Safari `getUserMedia` 準備狀況

**現狀**：code 寫好了，但真機尚未驗收。準備清單：

- ✅ 使用 `navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } })` — Safari 15+ 支援，iOS Safari 14.3+ 起支援
- ✅ **必須 HTTPS 或 localhost**：iOS Safari 對 `getUserMedia` 強制 secure context。dev 用 localhost 過 secure context exception；正式 deploy 必須 HTTPS（Vercel/CF Pages 預設就是）
- ✅ `<video playsInline muted>`：iOS 若沒 `playsInline`，`<video>` 會被 iOS 強制全螢幕；沒 `muted` + `autoplay` 被擋
- ✅ `stream.getTracks().forEach(t => t.stop())` on unmount：iOS 對相機資源敏感，洩漏會導致再次 getUserMedia 失敗或卡死
- ⚠️ **尚未驗證**：iOS 對 permissions 的 UX — 第一次 deny 後會記住；要在 settings UI 引導用戶到「設定 → Safari → 相機」重置
- ⚠️ **PWA 模式（加到主畫面）**：iOS 17 之前 standalone PWA 的 `getUserMedia` 不可用或有 bug；需要真機確認 iOS 17+ 行為。若仍有問題，標準解法是從 Safari 本身開啟

### 2. Fallback 機制

多層防線，從好到差：

```
getUserMedia 成功 (streaming)
    ↓ 失敗
<input type="file" accept="image/*" capture="environment"> (denied/unsupported UI 上都放了按鈕)
    ↓ 失敗
(未實作) 手動加商品 — 之後在 CartPage 補「+ 手動新增」入口
```

- `capture="environment"` attribute：iOS/Android Chrome 會直接叫相機 app；桌機 browser fallback 到相簿選檔
- 按鈕文案走 i18n key `camera.permission.cta` / `camera.unsupported` / `camera.permission.fallbackInput`，i18n-locale agent 已收錄 zh-TW/en/ko/ja 四語

### 3. 與其他 agent 的整合摩擦

| 議題 | 解決 |
|---|---|
| `src/lib/recognize.ts`（api-integration 的檔）原本我建的，但 agent 改寫接 VaultSage，型別不再是 `CartItem[]` 而是自己的 `RecognizeResult`。團隊 lead 在第二輪指示用 `Recognizer = (blob, locale) => Promise<CartItem[]>` contract | 新建 `src/lib/recognizer.ts`（注意 `r` 結尾，與他們的 `recognize.ts` 不同檔），走指定 contract；api-integration 之後可以讓 `recognizeProducts` 匹配 `Recognizer` type |
| `__MOCK_RECOGNIZE__` global type 衝突（他們先宣告成回 `RecognizeResult`，我新的是 `Recognizer`） | 我這邊用 `(window as unknown as { __MOCK_RECOGNIZE__?: unknown }).__MOCK_RECOGNIZE__` 取值 + `typeof === 'function'` 檢查，避免重複 `declare global` |
| i18n key 命名：我原本用 `camera.tab.product`，i18n-locale 規範化成 `camera.mode.product` | 已對齊，components 全改用 `useTranslation()` hook，key 對 i18n-locale 的 JSON |
| 第一輪完成後（scaffold phase）我跑完 agent-browser verify 收工；i18n-locale agent 上線後把 `i18n/strings.ts` 的本地 dict 改成 i18next shim，而我 components 剛好那時改成 `useTranslation`，沒要 migrate | 本次已完全不依賴 `strings.ts` shim |

### 4. Headless Chrome 驗收限制

agent-browser 預設沒開 `--use-fake-ui-for-media-stream`，所以 getUserMedia 在 CI 一律 denied。好處：**驗證了 fallback 路徑**；壞處：沒驗到 streaming/capture 路徑。正式用 UI 建議 qa-design 用真機 + HTTPS dev tunnel。

### 5. CartPage 與 store 脫鉤（發現但不在 task 範圍）

`/cart` 頁顯示 "Your cart is empty" 即使 cart store 有 3 筆 — i18n-locale agent 寫的是純 placeholder 沒讀 store。這不影響 task #8（top bar 的 running total 走 store 是對的），但下一個 task（列表 UI）要修。

## 下一步建議

1. **api-integration**：讓 `recognizeProducts` 實作 `Recognizer` contract，然後 `resolveRecognizer()` 在沒有 `__MOCK_RECOGNIZE__` 時回 `recognizeProducts` 而不是 `mockRecognizer`。現在我寫的 mock 是 demo/CI 跑路；production 接真 API 後 `mockRecognizer` 只在無 key 時兜底
2. **qa-design**：iOS Safari 真機測 getUserMedia、PWA standalone 模式、照片權限 revoke 後的 UX，把測試腳本放 `docs/qa-camera-ios.md`
3. **下一個 frontend task**：CartPage 接 zustand、`/cart` 的商品列表（遵循 design-v0.md wireframe C）
4. **順勢清理**：`src/lib/recognize.ts` 之後可以被 `src/lib/recognizer.ts` + `src/lib/vaultsage/` 取代，移除重複 concept（這要跟 api-integration 協調）
