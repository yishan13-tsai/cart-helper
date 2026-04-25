#!/usr/bin/env bun
/**
 * VaultSage end-to-end smoke test for cart-helper.
 *
 * Usage:
 *   VAULTSAGE_API_KEY=sk-... bun run scripts/smoke-test.ts <image-path>
 *
 * Flow:
 *   1. POST /api/v1/files/           (multipart upload -> file_id)
 *   2. POST /api/v1/files/processing-status  (poll until ready, max 30s)
 *   3. POST /api/v1/chat/message/v2  (OCR prompt with file_ids)
 *   4. Print raw response + attempt JSON.parse of model output
 */

import { z } from "zod";
import { readFile, stat } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";

// ---------- config ----------
const BASE_URL = "https://api.vaultsage.ai";
const POLL_MAX_MS = 30_000;
const POLL_INTERVAL_MS = 750;

// ---------- schemas ----------
const UploadSuccessSchema = z.object({
  file_id: z.string().uuid(),
  name: z.string(),
  file_size: z.number(),
  fileb_content_type: z.string(),
});

const FileProcessingStatusItemSchema = z.object({
  file_id: z.string().uuid(),
  file_exists: z.boolean().optional(),
  task_summary_status: z.string(),
  task_snapshot_status: z.string(),
  processing_progress: z.number().optional(),
});

const FileProcessingStatusResponseSchema = z.object({
  result: z.array(FileProcessingStatusItemSchema),
});

const ChatV2ResultSchema = z.object({
  result: z.string(),
  suggested_questions: z.array(z.string()).default([]),
  general_file_tool_results: z
    .array(
      z.object({
        id: z.string(),
        file_name: z.string(),
        tool_name: z.string(),
      }),
    )
    .nullable()
    .optional(),
  new_chat_id: z.string().uuid().nullable().optional(),
});

const OcrItemSchema = z.object({
  name: z.string(),
  unit_price: z.number().nullable(),
  quantity: z.number().nullable(),
  currency: z.string().nullable(),
});

const OcrPayloadSchema = z.object({
  items: z.array(OcrItemSchema),
  confidence: z.number().min(0).max(1).optional(),
});

// ---------- helpers ----------
function authHeaders(apiKey: string): Record<string, string> {
  return { "X-Api-Key": apiKey };
}

function mimeFromExt(path: string): string {
  const ext = extname(path).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".heic":
      return "image/heic";
    default:
      return "application/octet-stream";
  }
}

async function uploadFile(apiKey: string, imagePath: string) {
  const buf = await readFile(imagePath);
  const blob = new Blob([buf], { type: mimeFromExt(imagePath) });
  const form = new FormData();
  form.append("files", blob, basename(imagePath));

  const res = await fetch(`${BASE_URL}/api/v1/files/`, {
    method: "POST",
    headers: authHeaders(apiKey),
    body: form,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`upload failed (${res.status}): ${text}`);
  }

  // OpenAPI declares a single UploadSuccess; some deployments may wrap in array.
  const parsed = JSON.parse(text);
  const candidate = Array.isArray(parsed) ? parsed[0] : parsed;
  return UploadSuccessSchema.parse(candidate);
}

async function pollProcessingStatus(apiKey: string, fileId: string) {
  const started = Date.now();
  let last: z.infer<typeof FileProcessingStatusItemSchema> | undefined;

  while (Date.now() - started < POLL_MAX_MS) {
    const res = await fetch(`${BASE_URL}/api/v1/files/processing-status`, {
      method: "POST",
      headers: { ...authHeaders(apiKey), "Content-Type": "application/json" },
      body: JSON.stringify({ file_ids: [fileId] }),
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`processing-status failed (${res.status}): ${text}`);
    }
    const body = FileProcessingStatusResponseSchema.parse(JSON.parse(text));
    last = body.result.find((r) => r.file_id === fileId);
    if (!last) {
      throw new Error(`processing-status did not return file_id ${fileId}`);
    }

    // Empirical: chat v2 with file_ids succeeds once snapshot is terminal,
    // even if summary is still `processing`. Waiting for summary adds ~10-13s
    // with no observable benefit for vision calls.
    const done = isTerminal(last.task_snapshot_status);

    process.stdout.write(
      `  poll: snapshot=${last.task_snapshot_status} summary=${last.task_summary_status} progress=${last.processing_progress ?? "-"}\n`,
    );

    if (done) return last;
    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error(
    `processing did not reach terminal state in ${POLL_MAX_MS}ms (last=${JSON.stringify(last)})`,
  );
}

function isTerminal(status: string): boolean {
  return ["completed", "failed", "skipped"].includes(status);
}

async function chatOcr(apiKey: string, fileId: string, locale: string) {
  const prompt = buildOcrPrompt(locale);

  const res = await fetch(`${BASE_URL}/api/v1/chat/message/v2`, {
    method: "POST",
    headers: { ...authHeaders(apiKey), "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ actor: "user", content: prompt, file_ids: [fileId] }],
      persist: false,
      // CRITICAL: explicit empty (or single-file) contextual_file_ids stops
      // the server from auto-pulling unrelated `suggested_files` from the
      // caller's VaultSage account into the LLM context. Without this the
      // OCR output gets contaminated with item names from other documents
      // in the same account. Confirmed via scripts/contamination-test.ts.
      contextual_file_ids: [fileId],
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`chat v2 failed (${res.status}): ${text}`);
  }
  return { raw: text, parsed: ChatV2ResultSchema.parse(JSON.parse(text)) };
}

function buildOcrPrompt(locale: string): string {
  return [
    `You are a shopping product recognition assistant. From the image, identify every product and output JSON ONLY:`,
    `{`,
    `  "items": [`,
    `    {"name": "<product name>", "unit_price": <number|null>, "quantity": <number>, "currency": "<ISO 4217>"}`,
    `  ],`,
    `  "confidence": <0-1>`,
    `}`,
    `Rules:`,
    `- Set price to null when uncertain.`,
    `- Do not explain. Output JSON only.`,
    `- Product names MUST be in locale: ${locale}.`,
  ].join("\n");
}

function tryExtractJson(modelText: string): unknown {
  const direct = safeParse(modelText);
  if (direct.ok) return direct.value;

  // Strip common fences: ```json ... ```
  const fenced = modelText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    const p = safeParse(fenced[1]);
    if (p.ok) return p.value;
  }

  // Fall back to first {...} block.
  const braceStart = modelText.indexOf("{");
  const braceEnd = modelText.lastIndexOf("}");
  if (braceStart >= 0 && braceEnd > braceStart) {
    const p = safeParse(modelText.slice(braceStart, braceEnd + 1));
    if (p.ok) return p.value;
  }

  return null;
}

function safeParse(s: string): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(s) };
  } catch {
    return { ok: false };
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------- main ----------
async function main() {
  const imagePath = process.argv[2];
  if (!imagePath) {
    console.error("usage: bun run scripts/smoke-test.ts <image-path>");
    process.exit(2);
  }
  const apiKey = process.env.VAULTSAGE_API_KEY;
  if (!apiKey) {
    console.error("missing VAULTSAGE_API_KEY env var");
    process.exit(2);
  }
  const abs = resolve(imagePath);
  const info = await stat(abs).catch(() => null);
  if (!info || !info.isFile()) {
    console.error(`image not found: ${abs}`);
    process.exit(2);
  }

  const locale = process.env.VAULTSAGE_LOCALE ?? "zh-TW";
  console.log(`[1/3] uploading ${abs} (${info.size} bytes)`);
  const up = await uploadFile(apiKey, abs);
  console.log(`      file_id=${up.file_id} name=${up.name}`);

  console.log(`[2/3] polling processing-status (max ${POLL_MAX_MS}ms)`);
  const status = await pollProcessingStatus(apiKey, up.file_id);
  console.log(
    `      final: snapshot=${status.task_snapshot_status} summary=${status.task_summary_status}`,
  );

  console.log(`[3/3] calling chat v2 with OCR prompt (locale=${locale})`);
  const { raw, parsed } = await chatOcr(apiKey, up.file_id, locale);

  console.log("----- chat v2 raw envelope -----");
  console.log(raw);
  console.log("----- chat v2 result text -----");
  console.log(parsed.result);

  const extracted = tryExtractJson(parsed.result);
  if (extracted == null) {
    console.error("could not locate JSON payload in model output");
    process.exit(1);
  }
  const ocr = OcrPayloadSchema.safeParse(extracted);
  if (!ocr.success) {
    console.error("OCR payload failed schema validation:");
    console.error(ocr.error.issues);
    console.error("extracted:", JSON.stringify(extracted, null, 2));
    process.exit(1);
  }
  console.log("----- parsed OCR payload -----");
  console.log(JSON.stringify(ocr.data, null, 2));
  console.log(`OK: ${ocr.data.items.length} item(s) recognized`);
}

main().catch((err) => {
  console.error("SMOKE TEST FAILED:", err?.message ?? err);
  if (err?.stack) console.error(err.stack);
  process.exit(1);
});
