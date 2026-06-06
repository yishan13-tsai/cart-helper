import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Status = 'idle' | 'requesting' | 'streaming' | 'denied' | 'unsupported';

interface Props {
  onCapture: (blob: Blob) => void;
  disabled?: boolean;
  /**
   * Fraction (0-1) of the shorter video dimension to keep when cropping.
   * Defaults to 0.70 — matches the on-screen focus frame size.
   */
  cropFraction?: number;
}

export function CameraCapture({ onCapture, disabled, cropFraction = 0.70 }: Props) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Incrementing this triggers a fresh getUserMedia attempt (used by "retry" button).
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      const md = navigator.mediaDevices;
      if (!md || typeof md.getUserMedia !== 'function') {
        setStatus('unsupported');
        return;
      }
      setStatus('requesting');
      setErrorMsg(null);
      try {
        const stream = await md.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        setStatus('streaming');
      } catch (err) {
        if (cancelled) return;
        setStatus('denied');
        setErrorMsg(err instanceof Error ? err.message : String(err));
      }
    }

    start();

    return () => {
      cancelled = true;
      const stream = streamRef.current;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [retryCount]);

  function handleShutter() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return;

    // The <video> is rendered with `object-cover`: it's scaled to fill the
    // element and the overflow is cropped, centered. So the video's intrinsic
    // pixels are NOT 1:1 with what's on screen — e.g. a landscape feed on a
    // portrait phone shows only a narrow center strip. We must map the
    // on-screen focus frame into source-video coordinates, or the capture
    // grabs content outside the visible brackets (looks like "the whole screen").
    const cw = video.clientWidth;
    const ch = video.clientHeight;
    if (!cw || !ch) return;

    // object-cover scale + the displayed video's offset within the element.
    const scale = Math.max(cw / vw, ch / vh);
    const offX = (cw - vw * scale) / 2; // <= 0 on the cropped axis
    const offY = (ch - vh * scale) / 2;

    // Focus frame: a centered square. Side must match <FocusFrame/> below
    // (70vmin, capped at 320 CSS px) so framing == capture.
    const frameCss = Math.min(Math.min(cw, ch) * cropFraction, 320);
    const frameLeft = (cw - frameCss) / 2;
    const frameTop = (ch - frameCss) / 2;

    // Element coords -> source-video coords, clamped to the source bounds.
    const cropX = Math.max(0, Math.round((frameLeft - offX) / scale));
    const cropY = Math.max(0, Math.round((frameTop - offY) / scale));
    const cropSize = Math.round(
      Math.min(frameCss / scale, vw - cropX, vh - cropY),
    );

    canvas.width = cropSize;
    canvas.height = cropSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, cropX, cropY, cropSize, cropSize, 0, 0, cropSize, cropSize);
    canvas.toBlob(
      (blob) => {
        if (blob) onCapture(blob);
        else setErrorMsg(t('camera.error.captureFailed'));
      },
      'image/jpeg',
      0.85,
    );
  }

  async function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    // For file picks we also center-crop to a square at cropFraction —
    // user usually frames the price tag in the middle of the photo, and the
    // tighter crop reduces context the OCR model can hallucinate from.
    const cropped = await centerCropImage(file, cropFraction).catch(() => null);
    onCapture(cropped ?? file);
  }

  return (
    <div className="relative h-full w-full bg-black text-white">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        playsInline
        muted
      />
      <canvas ref={canvasRef} className="hidden" />

      {status === 'requesting' && (
        <Overlay>{t('camera.permission.requesting')}</Overlay>
      )}

      {status === 'denied' && (
        <Overlay>
          <p className="mb-2 text-sm font-semibold">{t('camera.permission.denied')}</p>
          <p className="mb-4 text-xs text-white/60">
            {t('camera.permission.deniedHint')}
          </p>
          {errorMsg && (
            <p className="mb-3 text-[10px] text-white/40">{errorMsg}</p>
          )}
          <button
            type="button"
            className="mb-2 w-full rounded-full bg-page px-5 py-2.5 text-sm font-bold text-white shadow-cta active:brightness-95"
            onClick={() => setRetryCount((n) => n + 1)}
          >
            {t('camera.permission.retry')}
          </button>
          <button
            type="button"
            className="w-full rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white/80 active:bg-white/10"
            onClick={() => fileInputRef.current?.click()}
          >
            {t('camera.permission.cta')}
          </button>
        </Overlay>
      )}

      {status === 'unsupported' && (
        <Overlay>
          <p className="mb-3 text-sm">{t('camera.unsupported')}</p>
          <button
            type="button"
            className="rounded-full bg-page px-5 py-2 text-sm font-bold text-white shadow-cta"
            onClick={() => fileInputRef.current?.click()}
          >
            {t('camera.permission.fallbackInput')}
          </button>
        </Overlay>
      )}

      {status === 'streaming' && <FocusFrame />}

      <div className="absolute inset-x-0 bottom-24 flex items-center justify-center">
        <button
          type="button"
          aria-label={t('camera.shutter.aria')}
          onClick={handleShutter}
          disabled={status !== 'streaming' || disabled}
          className="h-[72px] w-[72px] rounded-full border-4 border-white bg-page shadow-cta transition active:scale-95 disabled:opacity-40"
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFilePick}
      />
    </div>
  );
}

function FocusFrame() {
  // Dim outside + crisp corner brackets to make the crop area unmistakable.
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* dim mask using clip-path: cuts a 70vmin square hole in the center */}
      <div
        className="absolute inset-0 bg-black/55"
        style={{
          WebkitMaskImage:
            'radial-gradient(circle at center, transparent 0, transparent 0), linear-gradient(#fff,#fff)',
          maskImage:
            'linear-gradient(#fff,#fff)',
          // Use a square hole via inset clip-path on a sibling
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(transparent 99%, transparent 99%)',
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
        style={{
          width: '70vmin',
          height: '70vmin',
          maxWidth: '320px',
          maxHeight: '320px',
        }}
      >
        {/* corner brackets */}
        <span className="absolute left-0 top-0 h-6 w-6 border-l-[3px] border-t-[3px] border-page rounded-tl-md" />
        <span className="absolute right-0 top-0 h-6 w-6 border-r-[3px] border-t-[3px] border-page rounded-tr-md" />
        <span className="absolute bottom-0 left-0 h-6 w-6 border-b-[3px] border-l-[3px] border-page rounded-bl-md" />
        <span className="absolute bottom-0 right-0 h-6 w-6 border-b-[3px] border-r-[3px] border-page rounded-br-md" />
        {/* subtle inner outline */}
        <span className="absolute inset-0 rounded-2xl border border-white/30" />
      </div>
    </div>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 p-6 text-center text-white">
      {children}
    </div>
  );
}

/**
 * Center-crop an image File to a square at `fraction` of its shorter side.
 * Returns a JPEG Blob (quality 0.85). On any failure resolves to null and
 * the caller falls back to the original file.
 */
async function centerCropImage(file: File, fraction: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const cropSize = Math.round(Math.min(w, h) * fraction);
        const sx = Math.round((w - cropSize) / 2);
        const sy = Math.round((h - cropSize) / 2);
        const canvas = document.createElement('canvas');
        canvas.width = cropSize;
        canvas.height = cropSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, cropSize, cropSize);
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.85);
      } catch {
        resolve(null);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}
