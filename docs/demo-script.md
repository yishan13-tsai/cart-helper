# Demo Script — 血拼小幫手 / ShopBuddy

3 分鐘 demo，給 NURIE.AI 2026 評審。zh-TW + en 兩版本，依現場語言環境選用。

## 故事弧線

- **Hook (0:00-0:30)** — 結帳被嚇到的痛點
- **Build-up (0:30-1:30)** — 邊逛邊拍邊算（含 FX 即時換算）
- **Climax (1:30-2:30)** — 收據三段對照（demo HERO moment）
- **Resolution (2:30-3:00)** — 多語系切換、#vaultsage 收尾

---

## zh-TW 版本

| 時間 | 畫面 | 口白要點 | 視覺亮點 |
|---|---|---|---|
| 0:00–0:10 | 結帳台收據被收銀員劃線那種典型畫面（B-roll） | 「結帳那一刻，你看著總金額，心想——剛剛是不是漏算了什麼？」 | 真實感壓痛點 |
| 0:10–0:30 | 開 app，logo「血拼小幫手」一閃，camera mode 開啟 | 「血拼小幫手——逛街有伴，結帳不慌。」 | wordmark 動畫 0.5 秒 |
| 0:30–0:50 | 對著貨架商品按下 shutter（72px 大按鈕）→ Recognizing → OCR confirm modal 顯示 3 項商品 | 「拍一張，AI 直接幫你列出商品名、單價、數量。低信心的項目會標警示。」 | shutter 按下時觸感反饋 |
| 0:50–1:10 | 確認加入購物車 → CartPage 切過去，hero 數字 NT$ 0 → NT$ 254 一格一格跳上去 | 「金額即時計算。等寬數字跳動，不會晃。」 | **JetBrains Mono 跳數動畫** ⭐ |
| 1:10–1:30 | hero 下方第二行「≈ $8.06 USD」浮現 | 「韓國日本來的客人，App 已經幫你換成你熟悉的幣別。」 | FX line fade-in，淡淡的 |
| 1:30–1:50 | 點底部「對收據」按鈕 → Receipt Camera 開 → 拍下整張收據 | 「逛完到結帳，把收據拍進 App。」 | 切換時頁面從下滑入 |
| 1:50–2:30 | Comparing... loading → ComparisonResult 開 → top summary（cart 254 / receipt 290 / 差異 +36）→ 三段展開 ✅ 相符 5 / ⚠ 少了 1 / ❗ 多收了 1 | 「**這是這個 App 真正的價值。**5 項相符；收據少算了一項；多收了一個袋子。差異 +NT$36。」 | 3 段顏色：success/warning/danger，hero diff 用 amber accent | 
| 2:30–2:45 | 切到 Settings → 切換語言 zh-TW → ko → ja → en，每次切換 hero 標題即時翻譯 | 「四語系：繁中、英、韓、日。一個 LLM 抓商品名，自動翻譯到使用者的語言。」 | 0.4 秒淡入淡出 |
| 2:45–3:00 | end card：深藍底 + 算盤色 wordmark + tagline 4 語系輪播 + #vaultsage hashtag | 「血拼小幫手。Powered by VaultSage. #vaultsage」 | 結尾呼應 brand |

### 三個必到 wow moment（demo 失敗也要保住）
1. **Running total 跳動**（0:50）— `JetBrains Mono` 等寬不晃，視覺穩定 + 技術感
2. **FX 即時換算**（1:10）— 對國際評審加分
3. **三段收據對照**（1:50-2:30）— 整個 demo 的存在理由

---

## English version

| Time | Screen | Voiceover | Visual highlight |
|---|---|---|---|
| 0:00–0:10 | Generic checkout B-roll | "That moment at checkout — you stare at the total and wonder, did they ring me up right?" | empathy hook |
| 0:10–0:30 | App opens. ShopBuddy wordmark flashes. Camera mode active. | "ShopBuddy — shop smart, check twice." | 0.5s wordmark animation |
| 0:30–0:50 | Tap shutter on a shelf → Recognizing → OCR confirm modal with 3 items | "Snap a photo. The AI lists every item, price, and quantity. Low-confidence rows are flagged." | tactile shutter feedback |
| 0:50–1:10 | Add to cart → Cart hero number ticks up from $0 to NT$254 | "Total updates live. Monospace digits — no jitter." | **JetBrains Mono ticker** ⭐ |
| 1:10–1:30 | Below the hero, "≈ $8.06 USD" fades in | "Travelers in Taiwan? It converts to your home currency in real time." | FX line gentle fade |
| 1:30–1:50 | Tap "Compare receipt" → Receipt camera → snap full receipt | "When you check out, photograph the receipt." | slide-up transition |
| 1:50–2:30 | Comparing... → ComparisonResult: cart 254 / receipt 290 / diff +36 → three sections ✅ 5 matched / ⚠ 1 missing / ❗ 1 extra | "**This is the actual value of the app.** 5 matched. The receipt missed one item. They charged us for an extra bag. Difference: +NT$36." | three colors: success/warning/danger |
| 2:30–2:45 | Settings → switch ko → ja → zh-TW → en, header translates instantly | "Four locales — Traditional Chinese, English, Korean, Japanese. One LLM grabs item names; the UI translates automatically." | 0.4s fade |
| 2:45–3:00 | End card: dark navy + brand green wordmark + four-locale taglines rotate + `#vaultsage` | "ShopBuddy. Powered by VaultSage. #vaultsage" | brand closer |

### Wow moments to defend at all costs
1. Running total ticker (0:50)
2. FX conversion (1:10)
3. Three-section receipt comparison (1:50-2:30) — **the entire reason this app exists**

---

## Backup plan if API fails on demo day

- Pre-record the OCR + comparison flow as a fallback video segment
- Inject `window.__MOCK_RECOGNIZE__` and `window.__MOCK_COMPARE__` for fully offline demo (mock comparator already shipped in `src/lib/compareReceiptRunner.ts`)
- Have local test images ready: shelf photo, receipt photo

## Demo day setup checklist

- [ ] **Use a clean VaultSage hackathon account** (see `docs/CRITICAL_ISSUES.md` P0)
- [ ] iPhone or Android device with Chrome/Safari, PWA installed via "Add to Home Screen"
- [ ] Pre-warm: open the app, walk through camera once to grant permissions
- [ ] localStorage cleared for a fresh empty cart at start
- [ ] Network: tether to phone hotspot if venue Wi-Fi is sketchy
- [ ] Have the recorded backup video on a second laptop ready to swap
