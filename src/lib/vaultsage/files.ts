import { VaultSageError } from './errors';
import { request, type HttpOptions } from './http';
import {
  FileProcessingStatusItemSchema,
  FileProcessingStatusResponseSchema,
  UploadSuccessSchema,
  type FileProcessingStatusItem,
  type UploadSuccess,
} from './schemas';

// "10s for non-chat" per spec. Live probe measured ~1.4s for a 340KB JPEG;
// 10s gives plenty of headroom even on 4G.
const UPLOAD_TIMEOUT_MS = 10_000;
const POLL_TIMEOUT_MS = 10_000;
const POLL_MAX_MS = 30_000;
const POLL_INTERVAL_MS = 750;
const TERMINAL_STATES = new Set(['completed', 'failed', 'skipped']);

export interface UploadOptions extends Pick<HttpOptions, 'fetcher' | 'config' | 'signal'> {
  filename?: string;
}

export async function uploadFile(blob: Blob, opts: UploadOptions = {}): Promise<UploadSuccess> {
  const filename = opts.filename ?? `capture-${Date.now()}.jpg`;
  const form = new FormData();
  form.append('files', blob, filename);

  const res = await request('/api/v1/files/', {
    method: 'POST',
    body: form,
    timeoutMs: UPLOAD_TIMEOUT_MS,
    fetcher: opts.fetcher,
    config: opts.config,
    signal: opts.signal,
  });

  const json = await res.json();
  // OpenAPI declares one UploadSuccess; some deployments may wrap in array.
  const candidate = Array.isArray(json) ? json[0] : json;
  const parsed = UploadSuccessSchema.safeParse(candidate);
  if (!parsed.success) {
    throw new VaultSageError('VS_INVALID_RESPONSE', `unexpected /files/ response: ${parsed.error.message}`, {
      detail: candidate,
    });
  }
  return parsed.data;
}

export interface PollOptions extends Pick<HttpOptions, 'fetcher' | 'config' | 'signal'> {
  maxMs?: number;
  intervalMs?: number;
  /**
   * Empirical: chat v2 with file_ids works once `task_snapshot_status` is terminal,
   * even if `task_summary_status` is still processing. Defaulting to `'snapshot'`
   * cuts the wait from ~15s to ~2.5s.
   */
  waitFor?: 'snapshot' | 'both';
}

export async function pollProcessing(
  fileId: string,
  opts: PollOptions = {},
): Promise<FileProcessingStatusItem> {
  const maxMs = opts.maxMs ?? POLL_MAX_MS;
  const intervalMs = opts.intervalMs ?? POLL_INTERVAL_MS;
  const waitFor = opts.waitFor ?? 'snapshot';
  const started = Date.now();
  let last: FileProcessingStatusItem | undefined;

  while (Date.now() - started < maxMs) {
    if (opts.signal?.aborted) throw new VaultSageError('VS_TIMEOUT', 'poll aborted by caller');
    const res = await request('/api/v1/files/processing-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_ids: [fileId] }),
      timeoutMs: POLL_TIMEOUT_MS,
      fetcher: opts.fetcher,
      config: opts.config,
      signal: opts.signal,
    });
    const body = FileProcessingStatusResponseSchema.parse(await res.json());
    last = body.result.find((r) => r.file_id === fileId);
    if (!last) {
      throw new VaultSageError('VS_INVALID_RESPONSE', `processing-status missing file_id ${fileId}`);
    }
    if (last.task_snapshot_status === 'failed') {
      throw new VaultSageError('VS_PROCESSING_FAILED', `snapshot processing failed for ${fileId}`);
    }
    const ready =
      waitFor === 'snapshot'
        ? TERMINAL_STATES.has(last.task_snapshot_status)
        : TERMINAL_STATES.has(last.task_snapshot_status) &&
          TERMINAL_STATES.has(last.task_summary_status);
    if (ready) return last;
    await sleep(intervalMs);
  }

  throw new VaultSageError(
    'VS_PROCESSING_TIMEOUT',
    `file ${fileId} did not reach terminal state in ${maxMs}ms`,
    { detail: last },
  );
}

export type { FileProcessingStatusItem };
export { FileProcessingStatusItemSchema };

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
