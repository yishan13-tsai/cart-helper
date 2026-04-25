export type IsoCurrency = string;

export interface RateTable {
  base: IsoCurrency;
  date: string;
  rates: Record<IsoCurrency, number>;
  fetchedAt: number;
  stale: boolean;
}

export type FxErrorCode =
  | 'FX_NETWORK'
  | 'FX_INVALID_RESPONSE'
  | 'FX_UNKNOWN_CURRENCY'
  | 'FX_STALE';

export class FxError extends Error {
  readonly code: FxErrorCode;
  constructor(code: FxErrorCode, message: string) {
    super(message);
    this.name = 'FxError';
    this.code = code;
  }
}
