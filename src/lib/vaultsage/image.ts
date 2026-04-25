const MAX_LONG_EDGE = 1280;
const JPEG_QUALITY = 0.85;

export interface PreprocessResult {
  blob: Blob;
  width: number;
  height: number;
  bytes: number;
}

export async function preprocessImage(
  input: Blob,
  opts: { maxLongEdge?: number; quality?: number } = {},
): Promise<PreprocessResult> {
  const maxEdge = opts.maxLongEdge ?? MAX_LONG_EDGE;
  const quality = opts.quality ?? JPEG_QUALITY;

  if (typeof document === 'undefined' || typeof createImageBitmap !== 'function') {
    return { blob: input, width: 0, height: 0, bytes: input.size };
  }

  const bitmap = await createImageBitmap(input);
  try {
    const longEdge = Math.max(bitmap.width, bitmap.height);
    const scale = longEdge > maxEdge ? maxEdge / longEdge : 1;
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return { blob: input, width: bitmap.width, height: bitmap.height, bytes: input.size };
    }
    ctx.drawImage(bitmap, 0, 0, width, height);

    const out = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', quality),
    );
    if (!out) {
      return { blob: input, width, height, bytes: input.size };
    }
    return { blob: out, width, height, bytes: out.size };
  } finally {
    bitmap.close();
  }
}
