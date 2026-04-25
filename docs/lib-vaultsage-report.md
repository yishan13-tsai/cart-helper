# `src/lib/vaultsage/` — implementation report

Owner: api-integration. Status: complete (Task #5).

## Module map

| File | Role |
|---|---|
| `config.ts` | Reads `VITE_VAULTSAGE_API_KEY` / `VITE_VAULTSAGE_BASE_URL` from `import.meta.env`. |
| `errors.ts` | `VaultSageError` + 10 stable `VS_*` codes for the frontend i18n layer. |
| `http.ts` | `request(path, opts)` — fetch wrapper, auto `X-Api-Key`, AbortController timeout, method-aware retry policy. |
| `schemas.ts` | Zod schemas mirroring the OpenAPI subset we use (UploadSuccess, FileProcessingStatus*, ChatV2Result). |
| `files.ts` | `uploadFile(blob)`, `pollProcessing(fileId)` — snapshot-only by default. |
| `chat.ts` | `chatV2(messages)` returning a string only; `askJson(prompt, fileIds, { schema })` with retry. |
| `image.ts` | `preprocessImage(blob)` — canvas resize to 1280px long edge, JPEG quality 0.85. |
| `json.ts` | `extractJson(text)` — three-stage extractor (raw / fenced / first-`{` to last-`}`). |
| `prompts/ocr.ts` | `buildOcrPrompt(locale)` + `OcrPayloadSchema`. |
| `prompts/receipt.ts` | `buildReceiptPrompt(cart, locale)` + `ReceiptComparisonSchema`. |
| `recognize.ts` | `recognizeProducts(blob, locale)` — full pipeline. |
| `compare.ts` | `compareReceipt(receiptBlob, cart, locale)` — full pipeline. |
| `index.ts` | Public barrel. |
| `vaultsage.test.ts` | 30 unit tests (vitest). |

## Key decisions

### 1. `chatV2()` returns a bare string — drops `suggested_files` and `suggested_questions`

The chat v2 envelope contains:

```json
{
  "result": "...model reply text...",
  "suggested_questions": [...],
  "general_file_tool_results": [...],
  "suggested_files": [{ "id": "...", "name": "tax-return.pdf", ... }],
  "new_chat_id": "..."
}
```

`suggested_files` and `general_file_tool_results` are populated from the API
key holder's **other VaultSage files** — observed during smoke testing where
an unrelated personal PDF (`115碩士在職專班招生簡章.pdf`) was suggested in
response to a grocery shelf OCR. To eliminate any risk of a leaked filename
landing in the UI, `chatV2()` is typed to return `Promise<string>` and the
implementation discards every field except `result`. Callers literally cannot
read the leaky fields.

### 2. Polling waits only for `task_snapshot_status` (not `task_summary_status`)

Smoke test proved that chat v2 with `file_ids` succeeds the moment
`task_snapshot_status === 'completed'`, even if `task_summary_status` is still
`processing`. Default `waitFor: 'snapshot'` cuts the wait from ~15 s to ~2 s.
`waitFor: 'both'` is opt-in for callers who need the full AI summary.

`task_snapshot_status === 'failed'` short-circuits with
`VS_PROCESSING_FAILED` instead of waiting out the timeout.

### 3. Method-aware retry policy

| Failure mode | GET (idempotent) | POST |
|---|---|---|
| Network error / TCP reset | retry up to 2× (3 attempts total) | **fail immediately** |
| AbortError / our timeout | retry up to 2× | fail immediately |
| HTTP 4xx (except 429) | fail immediately | fail immediately |
| HTTP 429 | retry up to 2×, honoring `Retry-After` (capped at 5 s) | retry up to 2×, honoring `Retry-After` |
| HTTP 5xx | retry up to 2× with exponential backoff | retry up to 2× with exponential backoff |

The asymmetry on network errors matters for `POST /api/v1/files/`: the upload
may already have been persisted server-side when the connection drops, so a
blind retry would create duplicate files (and burn quota). 429/5xx are explicit
"safe to retry" signals, so we honor them on both methods.

`Retry-After` parser supports both delta-seconds and HTTP-date forms. Caps at
5 s so a hostile/buggy server can't put us to sleep.

### 4. Timeouts

| Endpoint | Timeout |
|---|---|
| Chat v2 (`POST /chat/message/v2`) | 45 s |
| Upload (`POST /files/`) | 10 s |
| Status poll (`POST /files/processing-status`) | 10 s |
| Everything else (default) | 30 s |

Spec called for "30 s for chat, 10 s for others", but the live e2e probe
measured **28 s** for OCR with the long zh-TW prompt. 30 s would have failed
on the very first call. 45 s gives meaningful headroom without making errors
take half a minute to surface.

### 5. JSON extraction + retry

`askJson(prompt, fileIds, { schema })` runs three layers of defense against
the LLM not honoring "JSON only":

1. **Raw parse** of the model reply.
2. **Fence strip** — match ` ```json ... ``` ` (or ` ``` ... ``` `) and parse
   the inner content.
3. **Brace fallback** — slice from the first `{` to the last `}` and parse.

If all three fail or the result doesn't satisfy the Zod schema, send a follow-up
turn with the assistant's bad reply re-injected and an explicit "your previous
reply was not valid JSON, output JSON only" instruction. If the second attempt
also fails, throw `VS_LLM_INVALID_JSON` with the bad payload in `detail`.

Retry can be disabled per-call (`retryOnInvalidJson: false`) — useful for
tests or for cases where the caller wants to surface a graceful error fast.

### 6. Image preprocessing

`preprocessImage(blob, { maxLongEdge: 1280, quality: 0.85 })`:

- Decodes via `createImageBitmap` (handles EXIF rotation on iOS Safari).
- Scales the long edge down to 1280 px (no upscaling).
- Re-encodes as JPEG at quality 0.85.
- If the runtime lacks `document` or `createImageBitmap` (e.g., during SSR/
  vitest), it returns the input unchanged — preprocessing is best-effort, not
  load-bearing for correctness.

A 4032 × 3024 iPhone photo (~3-4 MB) shrinks to ~250 KB, which fits the
spec's "under reasonable limits" goal and keeps upload latency under 2 s on 4G.

## Validation

| Check | Result |
|---|---|
| `pnpm typecheck` | ✅ (vaultsage modules clean; CartPage errors are task #9's, unrelated) |
| `pnpm test` | ✅ 54/54 (24 fx + 30 vaultsage) |
| Live e2e probe (real API key, real grocery photo) | ✅ Upload 1.4 s → poll 1.9 s → chat 28 s → 6 items, schema-valid, `retried=false`, currency=TWD |

Test coverage focuses on the boundary behaviors that would silently drift if
broken:

- HTTP retry asymmetry (GET vs POST, network vs 5xx vs 429).
- `Retry-After` parsing.
- `pollProcessing` snapshot-only short-circuit, snapshot=failed fast-fail,
  timeout exhaustion.
- `chatV2` field stripping (the privacy guard).
- `askJson` first-success / retry-success / both-fail paths and the
  `retryOnInvalidJson: false` opt-out.
- `extractJson` raw / fence / brace fallback paths.
- Prompt builders include the locale name and currency hint.
- Both Zod schemas accept a known-good sample.

Image preprocessing is **not** unit-tested — we'd need to mock `Image`,
`canvas.getContext('2d')`, and `canvas.toBlob`, none of which provides
meaningful coverage. The browser path is exercised manually by the camera
flow during dev-server testing.

## Known limitations

1. **`suggested_files` contamination.** Even with the field stripped from our
   API surface, the **model's own response text** can still hallucinate
   filenames or content from the API key holder's other VaultSage documents
   — observed in two separate live probes (a grocery shelf described as
   "Nurie Skin Recovery Lotion" once, and as "義美蘇打餅" another time).
   The API has no isolation flag. **Mitigation lives outside this client:**
   demo day must use a dedicated hackathon account with no unrelated files.
   Tracked in `~/.claude/.../memory/project_demo_blocker_vaultsage.md`.
2. **No streaming.** Chat v2 returns a complete envelope; UX has to use
   spinner / progress text, not token streaming.
3. **No model selection.** OpenAI vs Gemini routing is server-side
   (account-level configuration), not request-level. We can't A/B providers
   from the client.
4. **No rate-limit headers.** Server doesn't expose `X-RateLimit-*`. We can't
   show "X requests left" to the user; we have to react after a 429 lands.
   The retry+backoff policy is sufficient for normal use; if demo day shows
   sustained 429s, add a client-side debounce to the camera shutter.
5. **`recognize.ts` / `compare.ts` naming** differs from the task spec
   (`recognizer.ts` / `comparer.ts`). Functionally equivalent; renaming now
   would only churn imports across other agents' WIP. Index re-exports the
   high-level symbols so callers don't need to know the file name.
6. **`src/lib/recognizer.ts`** at the lib root is dead code from another
   agent's experiment (no imports anywhere). Left intact to avoid stepping on
   their WIP — frontend should clean up.

## Public surface (`index.ts`)

```ts
// Low-level
request, uploadFile, pollProcessing, chatV2, askJson, preprocessImage,
extractJson, getConfig

// High-level (the two callers actually use)
recognizeProducts(blob: Blob, locale: OcrLocaleHint): Promise<RecognizeResult>
compareReceipt(receiptBlob: Blob, cart: CartItem[], locale: OcrLocaleHint,
               cartId?: string): Promise<CompareResult>

// Errors + types
VaultSageError, VaultSageErrorCode
ChatMessage, ChatOptions, OcrLocaleHint
RecognizedItem, RecognizeResult, CompareResult

// Prompt builders + their schemas (exposed for prompt evaluation work)
buildOcrPrompt, OcrPayloadSchema
buildReceiptPrompt, ReceiptComparisonSchema
```

`src/lib/recognize.ts` (the existing CameraPage shim) was rewritten to wrap
`recognizeProducts` while keeping the original
`recognizeProductImage(blob, currency)` signature — CameraPage didn't need
any changes to pick up the real client.
