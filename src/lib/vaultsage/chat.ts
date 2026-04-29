import { z } from 'zod';
import { VaultSageError } from './errors';
import { request, type HttpOptions } from './http';
import { extractJson } from './json';
import { ChatV2ResultSchema } from './schemas';

export interface ChatMessage {
  actor: 'user' | 'assistant';
  content: string;
  fileIds?: string[];
}

export interface ChatOptions
  extends Pick<HttpOptions, 'fetcher' | 'config' | 'signal' | 'timeoutMs' | 'retries'> {
  persist?: boolean;
  contextualFileIds?: string[];
  chatId?: string;
}

/**
 * Returns ONLY the model's reply text. We deliberately drop
 * `suggested_files` and `suggested_questions` — those fields can leak the
 * filenames of unrelated documents from the API key holder's VaultSage account
 * (observed during smoke testing). Callers must never see them.
 */
export async function chatV2(messages: ChatMessage[], opts: ChatOptions = {}): Promise<string> {
  // Default contextual_file_ids to [] (or the message's own fileIds when present).
  // Empirically: passing null/undefined causes the server to auto-pull
  // suggested_files from elsewhere in the account, which contaminates OCR
  // output (see docs/CRITICAL_ISSUES.md). Passing an explicit empty array
  // disables retrieval; passing the just-uploaded id constrains it to only
  // that file.
  const explicitContext =
    opts.contextualFileIds ??
    messages.flatMap((m) => m.fileIds ?? []);
  const body = {
    messages: messages.map((m) => ({
      actor: m.actor,
      content: m.content,
      file_ids: m.fileIds,
    })),
    persist: opts.persist ?? false,
    contextual_file_ids: explicitContext,
    chat_id: opts.chatId,
  };
  const res = await request('/api/v1/chat/message/v2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    // RAG mode (contextual_file_ids) does retrieve + LLM and routinely
    // exceeds the original 45s on slow upstream load — bumped to 90s.
    // BFF proxy is set to 180s so we can also retry once before it gives up.
    timeoutMs: opts.timeoutMs ?? 90_000,
    retries: opts.retries,
    fetcher: opts.fetcher,
    config: opts.config,
    signal: opts.signal,
  });
  const parsed = ChatV2ResultSchema.parse(await res.json());
  return parsed.result;
}

export interface AskJsonOptions<S extends z.ZodTypeAny> extends ChatOptions {
  schema: S;
  /** Set to false to skip the "reply JSON only" retry. Default true. */
  retryOnInvalidJson?: boolean;
}

export async function askJson<S extends z.ZodTypeAny>(
  prompt: string,
  fileIds: string[] | undefined,
  opts: AskJsonOptions<S>,
): Promise<{ data: z.infer<S>; raw: string; retried: boolean }> {
  const messages: ChatMessage[] = [{ actor: 'user', content: prompt, fileIds }];
  const first = await chatV2(messages, opts);
  const firstAttempt = tryParse(first, opts.schema);
  if (firstAttempt.ok) {
    return { data: firstAttempt.value, raw: first, retried: false };
  }

  if (opts.retryOnInvalidJson === false) {
    throw new VaultSageError('VS_LLM_INVALID_JSON', firstAttempt.reason, { detail: first });
  }

  const retryMessages: ChatMessage[] = [
    ...messages,
    { actor: 'assistant', content: first },
    {
      actor: 'user',
      content:
        'Your previous reply was not valid JSON or did not match the required schema. ' +
        'Reply again with JSON ONLY — no prose, no code fence, no markdown. ' +
        'Match the schema described in my first message exactly.',
    },
  ];
  const second = await chatV2(retryMessages, opts);
  const secondAttempt = tryParse(second, opts.schema);
  if (!secondAttempt.ok) {
    throw new VaultSageError('VS_LLM_INVALID_JSON', secondAttempt.reason, { detail: second });
  }
  return { data: secondAttempt.value, raw: second, retried: true };
}

function tryParse<S extends z.ZodTypeAny>(
  text: string,
  schema: S,
): { ok: true; value: z.infer<S> } | { ok: false; reason: string } {
  if (!text || !text.trim()) return { ok: false, reason: 'LLM returned empty string' };
  const extracted = extractJson(text);
  if (extracted == null) return { ok: false, reason: 'no JSON object found in LLM output' };
  const parsed = schema.safeParse(extracted);
  if (!parsed.success) return { ok: false, reason: parsed.error.message };
  return { ok: true, value: parsed.data };
}
