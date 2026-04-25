#!/usr/bin/env bun
/**
 * Run contamination test multiple times and tabulate reliability stats.
 *
 * Variants tested:
 *   A: no contextual_file_ids (current default behavior, "auto-retrieve")
 *   B: contextual_file_ids: [] (empty array)
 *   C: contextual_file_ids: [<uploaded id>] (single-id array)
 *   D: variant C + stronger anti-contamination preamble in the prompt
 *
 * For each run we score "contaminated" if the items returned do not match
 * the expected brand list for the test image (Australian Bushells/Milo shelf).
 *
 * Usage:
 *   VAULTSAGE_API_KEY=... bun run scripts/contamination-stats.ts <image> [N]
 *
 * N defaults to 5.
 */

import { z } from "zod";
import { readFile, stat } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";

const BASE_URL = "https://api.vaultsage.ai";
const POLL_MAX_MS = 30_000;
const POLL_INTERVAL_MS = 750;

// Expected real items in the Australian shelf photo (lowercase substrings).
// If the model output mentions any of these, we score "clean".
const EXPECTED_TOKENS = [
  "bushells",
  "milo",
  "美祿",
  "ovaltine",
  "阿華田",
  "uncle tobys",
  "carman",
  "vittoria",
  "nestle",
  "tea",
  "茶",
  "麥片",
  "穀物",
];

// Items we expect to NOT see (account-bleed signals — common Taiwanese snacks
// not in the shelf photo).
const CONTAMINATION_TOKENS = [
  "樂事",
  "lays",
  "lay's",
  "品客",
  "pringles",
  "多力多滋",
  "doritos",
  "奇多",
  "cheetos",
  "義美",
  "i-mei",
  "蘇打餅",
  "義美蘇打",
  "牛丼",
  "便當",
];

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

const ChatV2ResultSchema = z.object({
  result: z.string(),
  suggested_files: z.array(z.unknown()).nullable().optional(),
});

function authHeaders(apiKey: string) {
  return { "X-Api-Key": apiKey } as Record<string, string>;
}

function mimeFromExt(p: string) {
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
  if (!res.ok) throw new Error(`upload ${res.status}`);
  const text = await res.text();
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

const PROMPT_BASIC = [
  `You are a shopping product recognition assistant.`,
  `From the image attached, identify every product visible and output JSON ONLY:`,
  `{"items":[{"name":"<product name>","unit_price":<number|null>,"quantity":<number>,"currency":"<ISO 4217>"}],"confidence":<0-1>}`,
  `Rules:`,
  `- Set price to null when uncertain.`,
  `- Output JSON only.`,
  `- Product names MUST be in locale: zh-TW.`,
].join("\n");

const PROMPT_GUARDED = [
  `STRICT INSTRUCTION: Look ONLY at the photograph attached to this message. Do NOT use any document, file, or knowledge from your retrieval index. Do NOT mention any product brand that is not visibly present in the photo. If you cannot read a brand clearly, transliterate or omit it — never substitute a similar brand from memory.`,
  ``,
  `You are a shopping product recognition assistant.`,
  `From the image attached, identify every product visible and output JSON ONLY:`,
  `{"items":[{"name":"<product name>","unit_price":<number|null>,"quantity":<number>,"currency":"<ISO 4217>"}],"confidence":<0-1>}`,
  `Rules:`,
  `- Set price to null when uncertain.`,
  `- Output JSON only.`,
  `- Product names MUST be in locale: zh-TW (translate or transliterate brands seen in the photo to Traditional Chinese).`,
].join("\n");

interface Variant {
  label: string;
  body: (fileId: string) => object;
}

const variants: Variant[] = [
  {
    label: "A: no field",
    body: (id) => ({
      messages: [{ actor: "user", content: PROMPT_BASIC, file_ids: [id] }],
      persist: false,
    }),
  },
  {
    label: "B: ctx=[]",
    body: (id) => ({
      messages: [{ actor: "user", content: PROMPT_BASIC, file_ids: [id] }],
      persist: false,
      contextual_file_ids: [],
    }),
  },
  {
    label: "C: ctx=[id]",
    body: (id) => ({
      messages: [{ actor: "user", content: PROMPT_BASIC, file_ids: [id] }],
      persist: false,
      contextual_file_ids: [id],
    }),
  },
  {
    label: "D: ctx=[id]+guarded",
    body: (id) => ({
      messages: [{ actor: "user", content: PROMPT_GUARDED, file_ids: [id] }],
      persist: false,
      contextual_file_ids: [id],
    }),
  },
];

interface RunResult {
  variant: string;
  hits: string[];      // expected tokens that appeared
  contam: string[];    // contamination tokens that appeared
  itemsCount: number;
  ms: number;
  raw: string;
}

async function runOne(apiKey: string, fileId: string, v: Variant): Promise<RunResult> {
  const t0 = Date.now();
  const res = await fetch(`${BASE_URL}/api/v1/chat/message/v2`, {
    method: "POST",
    headers: { ...authHeaders(apiKey), "Content-Type": "application/json" },
    body: JSON.stringify(v.body(fileId)),
  });
  const text = await res.text();
  const ms = Date.now() - t0;
  if (!res.ok) {
    return { variant: v.label, hits: [], contam: [], itemsCount: 0, ms, raw: `HTTP ${res.status}` };
  }
  const parsed = ChatV2ResultSchema.parse(JSON.parse(text));
  const lower = (parsed.result ?? "").toLowerCase();
  const hits = EXPECTED_TOKENS.filter((t) => lower.includes(t.toLowerCase()));
  const contam = CONTAMINATION_TOKENS.filter((t) => lower.includes(t.toLowerCase()));
  let itemsCount = 0;
  try {
    const m = parsed.result.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const json = m ? JSON.parse(m[1]) : JSON.parse(parsed.result);
    if (Array.isArray(json?.items)) itemsCount = json.items.length;
  } catch {}
  return { variant: v.label, hits, contam, itemsCount, ms, raw: parsed.result };
}

async function main() {
  const imagePath = process.argv[2];
  const N = Number(process.argv[3] ?? 5);
  if (!imagePath) {
    console.error("usage: bun run scripts/contamination-stats.ts <image> [N=5]");
    process.exit(2);
  }
  const apiKey = process.env.VAULTSAGE_API_KEY;
  if (!apiKey) {
    console.error("missing VAULTSAGE_API_KEY");
    process.exit(2);
  }
  const abs = resolve(imagePath);
  if (!(await stat(abs).catch(() => null))?.isFile()) {
    console.error(`not a file: ${abs}`);
    process.exit(2);
  }

  console.log(`Image: ${basename(abs)}, runs per variant: ${N}`);
  const stats: Record<string, RunResult[]> = {};

  for (let i = 1; i <= N; i++) {
    console.log(`\n--- run ${i}/${N}: fresh upload ---`);
    const up = await uploadFile(apiKey, abs);
    await pollSnapshot(apiKey, up.file_id);
    for (const v of variants) {
      const r = await runOne(apiKey, up.file_id, v);
      const score =
        r.contam.length > 0
          ? `CONTAM (${r.contam.join(",")})`
          : r.hits.length > 0
          ? `clean (${r.hits.length} hits)`
          : `unknown (no expected, no contam — ${r.itemsCount} items)`;
      console.log(`  ${v.label.padEnd(25)} ${r.ms}ms · ${score}`);
      (stats[v.label] ??= []).push(r);
    }
  }

  console.log("\n========== reliability summary ==========");
  console.log("variant                    | clean | contam | unknown | avg_ms");
  console.log("---------------------------+-------+--------+---------+--------");
  for (const v of variants) {
    const runs = stats[v.label];
    const clean = runs.filter((r) => r.contam.length === 0 && r.hits.length > 0).length;
    const contam = runs.filter((r) => r.contam.length > 0).length;
    const unknown = runs.filter((r) => r.contam.length === 0 && r.hits.length === 0).length;
    const avg = Math.round(runs.reduce((s, r) => s + r.ms, 0) / runs.length);
    console.log(
      `${v.label.padEnd(25)}  | ${String(clean).padStart(5)} | ${String(contam).padStart(6)} | ${String(unknown).padStart(7)} | ${String(avg).padStart(6)}`,
    );
  }
}

main().catch((e) => {
  console.error("FAILED:", e?.message ?? e);
  process.exit(1);
});
