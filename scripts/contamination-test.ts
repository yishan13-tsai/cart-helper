#!/usr/bin/env bun
/**
 * Tests workarounds for the VaultSage suggested_files contamination issue.
 *
 * Hypothesis: passing `contextual_file_ids: []` or only the uploaded id
 * may stop the server from auto-pulling unrelated files into chat v2.
 *
 * Usage:
 *   VAULTSAGE_API_KEY=... bun run scripts/contamination-test.ts <image>
 */

import { z } from "zod";
import { readFile, stat } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";

const BASE_URL = "https://api.vaultsage.ai";
const POLL_MAX_MS = 30_000;
const POLL_INTERVAL_MS = 750;

const UploadSuccessSchema = z.object({
  file_id: z.string().uuid(),
  name: z.string(),
  file_size: z.number(),
});

const FileProcessingStatusItemSchema = z.object({
  file_id: z.string().uuid(),
  task_summary_status: z.string(),
  task_snapshot_status: z.string(),
});

const FileProcessingStatusResponseSchema = z.object({
  result: z.array(FileProcessingStatusItemSchema),
});

interface SuggestedFile {
  id?: string;
  file_name?: string;
  tool_name?: string;
}

const ChatV2ResultSchema = z.object({
  result: z.string(),
  suggested_questions: z.array(z.string()).default([]),
  general_file_tool_results: z.array(z.unknown()).nullable().optional(),
  suggested_files: z.array(z.unknown()).nullable().optional(),
});

function authHeaders(apiKey: string): Record<string, string> {
  return { "X-Api-Key": apiKey };
}

function mimeFromExt(p: string): string {
  switch (extname(p).toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

async function uploadFile(apiKey: string, p: string) {
  const buf = await readFile(p);
  const blob = new Blob([buf], { type: mimeFromExt(p) });
  const form = new FormData();
  form.append("files", blob, basename(p));
  const res = await fetch(`${BASE_URL}/api/v1/files/`, {
    method: "POST",
    headers: authHeaders(apiKey),
    body: form,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`upload failed (${res.status}): ${text}`);
  const parsed = JSON.parse(text);
  return UploadSuccessSchema.parse(Array.isArray(parsed) ? parsed[0] : parsed);
}

async function pollSnapshot(apiKey: string, fileId: string) {
  const started = Date.now();
  while (Date.now() - started < POLL_MAX_MS) {
    const res = await fetch(`${BASE_URL}/api/v1/files/processing-status`, {
      method: "POST",
      headers: { ...authHeaders(apiKey), "Content-Type": "application/json" },
      body: JSON.stringify({ file_ids: [fileId] }),
    });
    const body = FileProcessingStatusResponseSchema.parse(await res.json());
    const item = body.result.find((r) => r.file_id === fileId);
    if (item && ["completed", "failed", "skipped"].includes(item.task_snapshot_status)) {
      return item;
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  throw new Error("snapshot poll timeout");
}

const PROMPT = [
  `You are a shopping product recognition assistant.`,
  `From the image attached, identify every product visible and output JSON ONLY:`,
  `{"items":[{"name":"<product name>","unit_price":<number|null>,"quantity":<number>,"currency":"<ISO 4217>"}],"confidence":<0-1>}`,
  `Rules:`,
  `- Base your answer ONLY on the image attached. Do NOT use any other files or context you have access to.`,
  `- Set price to null when uncertain.`,
  `- Output JSON only, no explanation.`,
  `- Product names MUST be in locale: zh-TW.`,
].join("\n");

interface Variant {
  label: string;
  body: object;
}

async function runVariant(apiKey: string, fileId: string, v: Variant) {
  const t0 = Date.now();
  const res = await fetch(`${BASE_URL}/api/v1/chat/message/v2`, {
    method: "POST",
    headers: { ...authHeaders(apiKey), "Content-Type": "application/json" },
    body: JSON.stringify(v.body),
  });
  const text = await res.text();
  const ms = Date.now() - t0;
  if (!res.ok) {
    return { variant: v.label, ok: false, status: res.status, ms, raw: text };
  }
  const parsed = ChatV2ResultSchema.parse(JSON.parse(text));
  return {
    variant: v.label,
    ok: true,
    ms,
    result: parsed.result,
    suggestedFiles: parsed.suggested_files ?? null,
    generalFileToolResults: parsed.general_file_tool_results ?? null,
  };
}

function summarizeResult(label: string, result: string): string {
  const items = (() => {
    try {
      const m = result.match(/```(?:json)?\s*([\s\S]*?)```/i);
      const json = m ? JSON.parse(m[1]) : JSON.parse(result);
      if (Array.isArray(json?.items)) {
        return json.items.map((i: { name?: string }) => i.name ?? "?").slice(0, 8);
      }
    } catch {}
    return [];
  })();
  return `[${label}] items: ${items.length ? items.join(" / ") : "(parse failed)"}`;
}

async function main() {
  const imagePath = process.argv[2];
  if (!imagePath) {
    console.error("usage: bun run scripts/contamination-test.ts <image>");
    process.exit(2);
  }
  const apiKey = process.env.VAULTSAGE_API_KEY;
  if (!apiKey) {
    console.error("missing VAULTSAGE_API_KEY");
    process.exit(2);
  }
  const abs = resolve(imagePath);
  const info = await stat(abs).catch(() => null);
  if (!info?.isFile()) {
    console.error(`image not found: ${abs}`);
    process.exit(2);
  }

  console.log(`Uploading ${basename(abs)} (${info.size} bytes)...`);
  const up = await uploadFile(apiKey, abs);
  console.log(`  file_id=${up.file_id}`);
  await pollSnapshot(apiKey, up.file_id);
  console.log(`  snapshot ready`);

  const baseMessage = { actor: "user", content: PROMPT, file_ids: [up.file_id] };
  const variants: Variant[] = [
    {
      label: "A: no contextual_file_ids (baseline / current behavior)",
      body: { messages: [baseMessage], persist: false },
    },
    {
      label: "B: contextual_file_ids = [] (empty array)",
      body: { messages: [baseMessage], persist: false, contextual_file_ids: [] },
    },
    {
      label: "C: contextual_file_ids = [<uploaded only>]",
      body: {
        messages: [baseMessage],
        persist: false,
        contextual_file_ids: [up.file_id],
      },
    },
  ];

  const summary: string[] = [];
  for (const v of variants) {
    console.log(`\n=== ${v.label} ===`);
    const r = await runVariant(apiKey, up.file_id, v);
    if (!r.ok) {
      console.log(`  HTTP ${r.status} in ${r.ms}ms`);
      console.log(`  raw: ${r.raw.slice(0, 400)}`);
      summary.push(`${v.label}: HTTP ${r.status}`);
      continue;
    }
    console.log(`  duration: ${r.ms}ms`);
    console.log(
      `  suggested_files: ${
        r.suggestedFiles == null
          ? "null"
          : `${(r.suggestedFiles as SuggestedFile[]).length} entries`
      }`,
    );
    console.log(
      `  general_file_tool_results: ${
        r.generalFileToolResults == null
          ? "null"
          : `${(r.generalFileToolResults as unknown[]).length} entries`
      }`,
    );
    if (Array.isArray(r.suggestedFiles) && r.suggestedFiles.length) {
      console.log(`  suggested_files content:`);
      for (const f of r.suggestedFiles as SuggestedFile[]) {
        console.log(`    - ${f.file_name ?? "?"} (${f.tool_name ?? "?"})`);
      }
    }
    console.log(`  result text:\n${(r.result ?? "").slice(0, 800)}`);
    summary.push(summarizeResult(v.label, r.result ?? ""));
  }

  console.log("\n========== summary ==========");
  for (const s of summary) console.log(s);
}

main().catch((err) => {
  console.error("FAILED:", err?.message ?? err);
  process.exit(1);
});
