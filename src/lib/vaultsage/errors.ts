export type VaultSageErrorCode =
  | 'VS_NO_API_KEY'
  | 'VS_NETWORK'
  | 'VS_TIMEOUT'
  | 'VS_HTTP_4XX'
  | 'VS_HTTP_5XX'
  | 'VS_INVALID_RESPONSE'
  | 'VS_PROCESSING_TIMEOUT'
  | 'VS_PROCESSING_FAILED'
  | 'VS_LLM_INVALID_JSON'
  | 'VS_LLM_EMPTY';

export class VaultSageError extends Error {
  readonly code: VaultSageErrorCode;
  readonly status?: number;
  readonly detail?: unknown;

  constructor(code: VaultSageErrorCode, message: string, opts: { status?: number; detail?: unknown } = {}) {
    super(message);
    this.name = 'VaultSageError';
    this.code = code;
    this.status = opts.status;
    this.detail = opts.detail;
  }
}
