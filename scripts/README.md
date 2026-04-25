# scripts/

Standalone utilities for validating VaultSage integration without booting the app.

## smoke-test.ts

End-to-end sanity check for the product OCR pipeline:
upload → poll processing → chat v2 with `file_ids` → schema-validate the JSON
the model returns.

### Prerequisites

- [Bun](https://bun.sh) (uses `bun run`; native `fetch` / `Blob` / `FormData`).
  No local `node_modules` or `package.json` required — `zod` is pulled from
  `esm.sh` at runtime.
- A VaultSage personal API key. Put it in `VAULTSAGE_API_KEY`.
  Hint: after you sign in to VaultSage, the key is managed under your account's
  API keys section (this script does not perform login; grab the key yourself
  and export it).
- A test image (shelf photo, product on a table, a small receipt, etc.)
  under ~10 MB.

### Usage

```bash
export VAULTSAGE_API_KEY=sk-...            # personal API key
# optional: override prompt locale (default zh-TW)
export VAULTSAGE_LOCALE=en

bun run scripts/smoke-test.ts ./samples/shelf.jpg
```

The script prints, in order:

1. `file_id` returned by `POST /api/v1/files/`
2. Every poll of `POST /api/v1/files/processing-status` (max 30 s).
3. The raw `ChatV2Result` envelope from `POST /api/v1/chat/message/v2`.
4. The extracted OCR JSON after `zod` validation.

Exit code:

- `0` — upload + chat succeeded and OCR JSON passed the schema.
- `1` — a step failed (network, non-2xx, JSON could not be extracted,
  payload failed schema). Error message points at which step.
- `2` — bad invocation (missing key, missing image path, image not found).

### What it does not cover

- Receipt comparison (`compareReceipt`) — add a second script once the prompt
  is stabilized.
- Image preprocessing (resize / JPEG re-encode) — the script uploads the file
  as-is so failures reflect raw API behavior rather than our client code.
- Auth retries or token refresh — personal API key only; no OAuth flow.

### Troubleshooting

- `422 API_KEY_HEADER_CONFLICT` — remove any `X-Team-Api-Key` from your
  environment; the script only sends `X-Api-Key`.
- `403 API_KEY_ENDPOINT_FORBIDDEN` — your key is not allowlisted for one of
  the endpoints; try another personal key or contact VaultSage.
- Polling times out at 30 s — bump `POLL_MAX_MS` in the script; large images
  (or Gemini vision warmup) can take longer on first run.
- Model replies with prose instead of JSON — the script tries code-fence
  stripping and first-`{`-to-last-`}` extraction before giving up. If it
  still fails, tighten the prompt or add a retry turn.
