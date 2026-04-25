# i18n Report — cart-helper

Date: 2026-04-24 · Agent: i18n-locale · Task #7

## 套件版本（pnpm 安裝後）

| 套件 | 版本 | 備註 |
|---|---|---|
| i18next | 23.16.8 | 不選 26.x |
| react-i18next | 15.7.4 | 不選 17.x |
| i18next-browser-languagedetector | 8.2.1 | |

**為什麼降版**：先裝 i18next 26 + react-i18next 17（最新），但實機驗證發現
`t()` 對任何 key 都回傳 raw key（`t('app.name')` → `"app.name"`），
即便 `getResource('zh-TW','common','app.name')` 直接拿得到值。
追到 `services.languageUtils.toResolveHierarchy('zh-TW') === []`，translator
找不到該語言的 fallback 鏈。原因是當時設了 `nonExplicitSupportedLngs: true`，
i18next 26 改了行為導致無法處理 `zh-TW` 這種帶 region 的代碼。
拿掉該 flag 後即使在 26.x 應該也能跑，但為了 hackathon 期間的穩定性
直接退到 23.16 + 15.7 這對廣泛使用的版本，順便把該 flag 移除。

## Detection 實際行為

設定：
```ts
detection: {
  order: ['localStorage', 'navigator'],
  lookupLocalStorage: 'app.locale',
  caches: ['localStorage'],
}
fallbackLng: 'zh-TW'
supportedLngs: ['zh-TW', 'en', 'ko', 'ja']
load: 'currentOnly'  // 不要把 'zh-TW' 退化成 'zh' 找不到
```

實測：
- 全新瀏覽器（無 localStorage）開 macOS Safari/Chrome（system 中文）→ `zh-TW`
- 切換語言後 `localStorage['app.locale']` 即時寫入，重整保留
- LocaleSwitcher 直接呼叫 `i18n.changeLanguage(code)`，組件 re-render 在 100ms 內完成（無 loading flash）

## TODO / 未翻譯 key

無。task brief 列的 17 條 seed key 已全數寫入 4 語系，並擴充
舊 `src/i18n/strings.ts` 已存在的 `camera.*` / `ocr.*` / `common.currency.*`
keys，避免 frontend / api-integration agent 的既有呼叫站爆掉。

下游待補：
- `cart.empty.subtitle` 提到「右下」，`Tap below to scan`、`아래를 눌러 시작`、
  `下でスキャン開始` 都已對齊「向下」隱喻，但實際 CameraPage 是首頁
  入口，shutter 在底部中央——文案 OK，不需改。
- 收據對照（receipt comparison）相關 key 還沒建，等 architect / api-integration
  完成 compare flow 後再加 `compare.*` namespace。
- History 頁完全空白；需要 `history.empty.*` / `history.timeline.today` 等，
  待 frontend agent 開那頁時一起補。

## 設計 token vs 語系空間

| Locale | AppBar 標題長度（CJK 字數 / 英文字元）| 在 375px 下表現 |
|---|---|---|
| zh-TW | 「血拼小幫手」5 字 | OK |
| en | `ShopBuddy` 9 字元 | OK |
| ko | `쇼핑 도우미` 5 字 + 1 空白 | OK |
| ja | `お買い物アシスタント` **10 字** | **緊**，AppBar padding `px-4` 還夠，但若同行放右側「NT$ 0 點」會碰到 |

**處理建議**（已記錄，未動 token）：
1. 日文 AppBar 在子頁可保留全名，但 CameraPage 主頁的 AppBar 已是 compact 樣式
   （`text-sm` + 右側 running total），日文目前 visual safe，不需動。
2. 若 frontend agent 之後加更多右側元素到 AppBar，建議幫日文準備 `app.shortName`
   key（例：「お買い物」），由 LocaleSwitcher 那層判斷。
3. 字型 stack 已是 `Noto Sans TC / KR / JP / system-ui`，三語系字型 fallback 正確。

## 檔案清單

```
src/i18n/
  index.ts            // i18next init + detection
  resources.ts        // SUPPORTED_LOCALES, LOCALE_LABELS, resources mapping
  types.d.ts          // augment i18next CustomTypeOptions for key auto-complete
  llm-locale.ts       // getLocaleForLLM() helper for api-integration agent
  strings.ts          // backward-compat shim (legacy `t()` + `currencySymbol()`)

src/locales/
  zh-TW/common.json
  en/common.json
  ko/common.json
  ja/common.json

src/components/
  LocaleSwitcher.tsx  // 4-button group (default) or select (`variant="select"`)
```

## LLM prompt locale hint

`src/i18n/llm-locale.ts` 提供：
```ts
getLocaleForLLM(): { code: SupportedLocale, name: string, currency: string }
```

| code | name (LLM-readable) | currency |
|---|---|---|
| zh-TW | Traditional Chinese (zh-TW) | TWD |
| en | English (en) | USD |
| ko | Korean (ko) | KRW |
| ja | Japanese (ja) | JPY |

api-integration agent 的 prompt template 可這樣注入：
```ts
const { name, currency } = getLocaleForLLM();
const prompt = `${BASE_PROMPT}\n\nReply in ${name}. Currency: ${currency}.`;
```

## 已知 issue

1. **首頁標題截斷風險**：日文 `お買い物アシスタント` 10 字寬，未來如果在
   AppBar 右側塞更多東西可能擠壓。目前 CameraPage 的 AppBar 已 compact，
   非 camera 頁的 AppBar 只有標題沒有 running total，安全。
2. **i18n 26.x 不相容**：見上方版本說明，目前 lock 在 23.16；可後續測試
   「拿掉 `nonExplicitSupportedLngs` 後升回 26」是否仍 OK。
3. **`src/i18n/index.ts` 在 DEV 模式 expose `window.__i18n`**：純為開發
   debug，prod build 透過 `import.meta.env.DEV` 自動排除。
4. **`src/i18n/strings.ts` 仍存在**：舊 call sites（CameraPage 內某條
   `t(\`common.currency.${currency}\`)`、CameraCapture 內等）已部分 migrate
   到 `useTranslation`；shim 短期保留以防其他 agent 還在 import。下個
   refactor PR 可移除。
5. **`src/lib/vaultsage/recognize.ts` 有預先存在的 zod typecheck error**——
   非 i18n 範圍，留給 api-integration agent 處理。

## 驗收結果

| 標準 | 結果 |
|---|---|
| `pnpm install` | OK（5 packages added） |
| `pnpm typecheck` | i18n scope 0 errors（vaultsage 1 pre-existing error，非本任務） |
| `pnpm dev` 切 4 語系 AppBar 即時換 | OK（見截圖） |
| 4 語系 home/settings 截圖 | `docs/screenshots/i18n-{zh-TW,en,ko,ja}-{home,settings}.png` 共 8 張 |
