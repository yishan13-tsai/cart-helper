import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { askJson, chatV2 } from './chat';
import type { VaultSageConfig } from './config';
import { VaultSageError } from './errors';
import { pollProcessing, uploadFile } from './files';
import { request } from './http';
import { extractJson } from './json';
import { buildOcrPrompt, OcrPayloadSchema } from './prompts/ocr';
import { buildReceiptPrompt, ReceiptComparisonSchema } from './prompts/receipt';

const TEST_CONFIG: VaultSageConfig = {
  baseUrl: 'https://api.test.local',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('extractJson', () => {
  it('parses raw JSON', () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });

  it('strips ```json fences', () => {
    expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it('strips ``` fences without json tag', () => {
    expect(extractJson('```\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it('falls back to first { ... last }', () => {
    expect(extractJson('here is your data: {"a":1, "b":2} thanks!')).toEqual({ a: 1, b: 2 });
  });

  it('returns null when no JSON-like substring exists', () => {
    expect(extractJson('hello world')).toBeNull();
  });
});

describe('http.request', () => {
  it('does not inject X-Api-Key (BFF proxy adds it server-side)', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    await request('/foo', { config: TEST_CONFIG, fetcher: fetcher as unknown as typeof fetch });
    expect(fetcher.mock.calls[0][0]).toBe('https://api.test.local/foo');
    const init = fetcher.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>)['X-Api-Key']).toBeUndefined();
  });

  it('does not retry 4xx responses', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response('bad', { status: 422 }));
    await expect(
      request('/foo', { config: TEST_CONFIG, fetcher: fetcher as unknown as typeof fetch }),
    ).rejects.toMatchObject({ code: 'VS_HTTP_4XX', status: 422 });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('retries 5xx responses up to retries+1 attempts', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response('boom', { status: 502 }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }));
    const res = await request('/foo', {
      config: TEST_CONFIG,
      fetcher: fetcher as unknown as typeof fetch,
      retries: 1,
    });
    expect(res.status).toBe(200);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('retries network errors on GET (idempotent) by default', async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('connection reset'))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }));
    const res = await request('/foo', {
      config: TEST_CONFIG,
      fetcher: fetcher as unknown as typeof fetch,
      // method defaults to GET, retries defaults to 2
    });
    expect(res.status).toBe(200);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('does NOT retry network errors on POST (request may have hit server)', async () => {
    const fetcher = vi.fn().mockRejectedValue(new TypeError('connection reset'));
    await expect(
      request('/foo', {
        config: TEST_CONFIG,
        fetcher: fetcher as unknown as typeof fetch,
        method: 'POST',
        body: 'x',
      }),
    ).rejects.toMatchObject({ code: 'VS_NETWORK' });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('still retries 429 on POST (server told us to back off)', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response('rate limited', { status: 429, headers: { 'retry-after': '0' } }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }));
    const res = await request('/foo', {
      config: TEST_CONFIG,
      fetcher: fetcher as unknown as typeof fetch,
      method: 'POST',
      body: 'x',
    });
    expect(res.status).toBe(200);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('still retries 5xx on POST', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response('boom', { status: 503 }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }));
    const res = await request('/foo', {
      config: TEST_CONFIG,
      fetcher: fetcher as unknown as typeof fetch,
      method: 'POST',
      body: 'x',
    });
    expect(res.status).toBe(200);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});

describe('files.uploadFile', () => {
  it('parses UploadSuccess and posts multipart form', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      jsonResponse({
        file_id: '11111111-1111-4111-8111-111111111111',
        name: 'capture.jpg',
        file_size: 100,
        fileb_content_type: 'image/jpeg',
      }),
    );
    const blob = new Blob([new Uint8Array([1, 2, 3])], { type: 'image/jpeg' });
    const out = await uploadFile(blob, {
      config: TEST_CONFIG,
      fetcher: fetcher as unknown as typeof fetch,
      filename: 'capture.jpg',
    });
    expect(out.file_id).toBe('11111111-1111-4111-8111-111111111111');
    const init = fetcher.mock.calls[0][1] as RequestInit;
    expect(init.body).toBeInstanceOf(FormData);
  });

  it('rejects with VS_INVALID_RESPONSE when the body shape is wrong', async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse({ wat: true }));
    const blob = new Blob([new Uint8Array([1])], { type: 'image/jpeg' });
    await expect(
      uploadFile(blob, { config: TEST_CONFIG, fetcher: fetcher as unknown as typeof fetch }),
    ).rejects.toMatchObject({ code: 'VS_INVALID_RESPONSE' });
  });
});

describe('files.pollProcessing', () => {
  const FID = '22222222-2222-4222-8222-222222222222';

  it('returns immediately when snapshot is completed', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      jsonResponse({
        result: [
          { file_id: FID, task_snapshot_status: 'completed', task_summary_status: 'processing' },
        ],
      }),
    );
    const out = await pollProcessing(FID, {
      config: TEST_CONFIG,
      fetcher: fetcher as unknown as typeof fetch,
      intervalMs: 1,
      maxMs: 200,
    });
    expect(out.task_snapshot_status).toBe('completed');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('keeps polling while snapshot is processing', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          result: [
            { file_id: FID, task_snapshot_status: 'processing', task_summary_status: 'processing' },
          ],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          result: [
            { file_id: FID, task_snapshot_status: 'completed', task_summary_status: 'processing' },
          ],
        }),
      );
    const out = await pollProcessing(FID, {
      config: TEST_CONFIG,
      fetcher: fetcher as unknown as typeof fetch,
      intervalMs: 1,
      maxMs: 500,
    });
    expect(out.task_snapshot_status).toBe('completed');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('throws VS_PROCESSING_FAILED on snapshot=failed', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      jsonResponse({
        result: [{ file_id: FID, task_snapshot_status: 'failed', task_summary_status: 'failed' }],
      }),
    );
    await expect(
      pollProcessing(FID, {
        config: TEST_CONFIG,
        fetcher: fetcher as unknown as typeof fetch,
        intervalMs: 1,
        maxMs: 200,
      }),
    ).rejects.toMatchObject({ code: 'VS_PROCESSING_FAILED' });
  });

  it('throws VS_PROCESSING_TIMEOUT when never reaches terminal state', async () => {
    const fetcher = vi.fn().mockImplementation(() =>
      Promise.resolve(
        jsonResponse({
          result: [
            { file_id: FID, task_snapshot_status: 'processing', task_summary_status: 'processing' },
          ],
        }),
      ),
    );
    await expect(
      pollProcessing(FID, {
        config: TEST_CONFIG,
        fetcher: fetcher as unknown as typeof fetch,
        intervalMs: 5,
        maxMs: 30,
      }),
    ).rejects.toMatchObject({ code: 'VS_PROCESSING_TIMEOUT' });
  });
});

describe('chat.chatV2', () => {
  it('serializes camelCase ChatMessage to snake_case body', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      jsonResponse({ result: 'ok', suggested_questions: [], general_file_tool_results: null }),
    );
    await chatV2(
      [{ actor: 'user', content: 'hi', fileIds: ['fid'] }],
      { config: TEST_CONFIG, fetcher: fetcher as unknown as typeof fetch, persist: false },
    );
    const init = fetcher.mock.calls[0][1] as RequestInit;
    const body = JSON.parse(init.body as string);
    expect(body.messages[0].file_ids).toEqual(['fid']);
    expect(body.messages[0]).not.toHaveProperty('fileIds');
    expect(body.persist).toBe(false);
  });

  it('returns ONLY the result string, dropping suggested_files / suggested_questions', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      jsonResponse({
        result: 'hello',
        suggested_questions: ['leak1', 'leak2'],
        general_file_tool_results: [
          { id: '11111111-1111-4111-8111-111111111111', file_name: 'private.pdf', tool_name: 'x' },
        ],
        suggested_files: [
          { id: 'aaa', name: 'tax-return.pdf', relevance_score: 0.9 },
        ],
      }),
    );
    const result = await chatV2(
      [{ actor: 'user', content: 'hi' }],
      { config: TEST_CONFIG, fetcher: fetcher as unknown as typeof fetch },
    );
    expect(result).toBe('hello');
    // The return type is `string`, so there's no surface area for callers to
    // accidentally read the leaky fields. This assertion documents intent.
    expect(typeof result).toBe('string');
  });
});

describe('chat.askJson', () => {
  const Schema = z.object({ ok: z.boolean() });

  it('returns parsed value on first success', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      jsonResponse({ result: '{"ok":true}', suggested_questions: [], general_file_tool_results: null }),
    );
    const out = await askJson('q', undefined, {
      schema: Schema,
      config: TEST_CONFIG,
      fetcher: fetcher as unknown as typeof fetch,
    });
    expect(out.data.ok).toBe(true);
    expect(out.retried).toBe(false);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('retries once on invalid JSON and succeeds on second try', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          result: 'I cannot help with that.',
          suggested_questions: [],
          general_file_tool_results: null,
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          result: '{"ok":true}',
          suggested_questions: [],
          general_file_tool_results: null,
        }),
      );
    const out = await askJson('q', undefined, {
      schema: Schema,
      config: TEST_CONFIG,
      fetcher: fetcher as unknown as typeof fetch,
    });
    expect(out.retried).toBe(true);
    expect(out.data.ok).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(2);
    const retryBody = JSON.parse((fetcher.mock.calls[1][1] as RequestInit).body as string);
    expect(retryBody.messages).toHaveLength(3);
    expect(retryBody.messages[1].actor).toBe('assistant');
  });

  it('throws VS_LLM_INVALID_JSON when both attempts fail', async () => {
    const fetcher = vi.fn().mockImplementation(() =>
      Promise.resolve(
        jsonResponse({ result: 'nope', suggested_questions: [], general_file_tool_results: null }),
      ),
    );
    await expect(
      askJson('q', undefined, {
        schema: Schema,
        config: TEST_CONFIG,
        fetcher: fetcher as unknown as typeof fetch,
      }),
    ).rejects.toMatchObject({ code: 'VS_LLM_INVALID_JSON' });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('does not retry when retryOnInvalidJson is false', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      jsonResponse({ result: 'nope', suggested_questions: [], general_file_tool_results: null }),
    );
    await expect(
      askJson('q', undefined, {
        schema: Schema,
        config: TEST_CONFIG,
        fetcher: fetcher as unknown as typeof fetch,
        retryOnInvalidJson: false,
      }),
    ).rejects.toMatchObject({ code: 'VS_LLM_INVALID_JSON' });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});

describe('prompts', () => {
  const locale = { code: 'zh-TW', name: 'Traditional Chinese (zh-TW)', currency: 'TWD' };

  it('OCR prompt mentions locale name and currency', () => {
    const p = buildOcrPrompt(locale);
    expect(p).toContain('Traditional Chinese (zh-TW)');
    expect(p).toContain('TWD');
    expect(p).toContain('JSON ONLY');
  });

  it('OcrPayloadSchema parses a valid OCR sample (with coercion of quantity default)', () => {
    const out = OcrPayloadSchema.parse({
      items: [
        { name: '蘋果', unit_price: 30, quantity: 2, currency: 'TWD' },
        { name: '香蕉', unit_price: null, currency: 'TWD' },
      ],
      confidence: 0.9,
    });
    expect(out.items[1].quantity).toBe(1);
  });

  it('Receipt prompt embeds the cart JSON', () => {
    const p = buildReceiptPrompt(
      [{ name: '蘋果', unit_price: 30, quantity: 2, currency: 'TWD' }],
      locale,
    );
    expect(p).toContain('"name": "蘋果"');
    expect(p).toContain('matched');
    expect(p).toContain('extra_on_receipt');
  });

  it('ReceiptComparisonSchema parses a sample', () => {
    const out = ReceiptComparisonSchema.parse({
      matched: [],
      missing_from_receipt: [],
      extra_on_receipt: [],
      total_in_cart: 0,
      total_on_receipt: 0,
      difference: 0,
    });
    expect(out.difference).toBe(0);
  });
});

// VaultSageError wiring sanity
describe('VaultSageError', () => {
  it('preserves code and status', () => {
    const e = new VaultSageError('VS_HTTP_4XX', 'bad', { status: 422 });
    expect(e.name).toBe('VaultSageError');
    expect(e.code).toBe('VS_HTTP_4XX');
    expect(e.status).toBe(422);
  });
});

beforeEach(() => {
  // No global fetch needed — every test injects its own fetcher.
});

afterEach(() => {
  vi.restoreAllMocks();
});
