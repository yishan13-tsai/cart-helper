import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  mockRecognizer,
  realRecognizer,
  resolveRecognizer,
  type Recognizer,
} from './recognizer';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (typeof window !== 'undefined') {
    delete (window as unknown as { __MOCK_RECOGNIZE__?: unknown }).__MOCK_RECOGNIZE__;
  }
});

describe('mockRecognizer', () => {
  it('returns two seeded items conforming to CartItem shape', async () => {
    const items = await mockRecognizer(new Blob([]), 'zh-TW');
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      name: expect.any(String),
      unitPrice: expect.any(Number),
      quantity: expect.any(Number),
      currency: 'TWD',
      id: expect.any(String),
      createdAt: expect.any(Number),
    });
  });
});

describe('resolveRecognizer', () => {
  it('returns __MOCK_RECOGNIZE__ when injected on window', () => {
    const injected: Recognizer = vi.fn();
    vi.stubGlobal('window', { __MOCK_RECOGNIZE__: injected });
    expect(resolveRecognizer()).toBe(injected);
  });

  it('falls through to realRecognizer when no window mock is present', () => {
    expect(resolveRecognizer()).toBe(realRecognizer);
  });
});

describe('realRecognizer', () => {
  it('maps recognizeProducts output to CartItem[] with id+createdAt populated', async () => {
    const vsModule = await import('./vaultsage');
    const spy = vi.spyOn(vsModule, 'recognizeProducts').mockResolvedValue({
      fileId: 'file-xyz',
      confidence: 0.9,
      items: [
        {
          name: '蘋果',
          unitPrice: 30,
          quantity: 2,
          currency: 'TWD',
          sourceFileId: 'file-xyz',
          confidence: 0.9,
        },
      ],
    });

    const out = await realRecognizer(new Blob([]), 'zh-TW');

    expect(spy).toHaveBeenCalled();
    const passedLocale = spy.mock.calls[0][1];
    expect(passedLocale.code).toBe('zh-TW');
    expect(passedLocale.currency).toBe('TWD');
    expect(passedLocale.name).toContain('Traditional Chinese');

    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      name: '蘋果',
      unitPrice: 30,
      quantity: 2,
      currency: 'TWD',
      sourceFileId: 'file-xyz',
      confidence: 0.9,
    });
    expect(out[0].id).toBeTruthy();
    expect(out[0].createdAt).toBeGreaterThan(0);
  });

  it('normalizes BCP-47 locales (en-US -> en, ja-JP -> ja, zh-Hant -> zh-TW)', async () => {
    const vsModule = await import('./vaultsage');
    const spy = vi.spyOn(vsModule, 'recognizeProducts').mockResolvedValue({
      fileId: 'f',
      items: [],
      confidence: 0,
    });

    await realRecognizer(new Blob([]), 'en-US').catch(() => undefined);
    expect(spy.mock.calls[0][1].code).toBe('en');
    expect(spy.mock.calls[0][1].currency).toBe('USD');

    await realRecognizer(new Blob([]), 'ja-JP').catch(() => undefined);
    expect(spy.mock.calls[1][1].code).toBe('ja');
    expect(spy.mock.calls[1][1].currency).toBe('JPY');

    await realRecognizer(new Blob([]), 'zh-Hant').catch(() => undefined);
    expect(spy.mock.calls[2][1].code).toBe('zh-TW');
  });

  it('rewraps VaultSageError as Error with .code preserved', async () => {
    const vsModule = await import('./vaultsage');
    vi.spyOn(vsModule, 'recognizeProducts').mockRejectedValue(
      new vsModule.VaultSageError('VS_LLM_INVALID_JSON', 'bad'),
    );

    await expect(realRecognizer(new Blob([]), 'zh-TW')).rejects.toMatchObject({
      message: 'VS_LLM_INVALID_JSON',
      code: 'VS_LLM_INVALID_JSON',
    });
  });
});
