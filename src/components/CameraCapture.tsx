import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Status = 'idle' | 'requesting' | 'streaming' | 'denied' | 'unsupported';

interface Props {
  onCapture: (blob: Blob) => void;
  disabled?: boolean;
}

export function CameraCapture({ onCapture, disabled }: Props) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      const md = navigator.mediaDevices;
      if (!md || typeof md.getUserMedia !== 'function') {
        setStatus('unsupported');
        return;
      }
      setStatus('requesting');
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
  }, []);

  function handleShutter() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    canvas.toBlob(
      (blob) => {
        if (blob) onCapture(blob);
        else setErrorMsg(t('camera.error.captureFailed'));
      },
      'image/jpeg',
      0.85,
    );
  }

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onCapture(file);
    e.target.value = '';
  }

  return (
    <div className="relative h-full w-full bg-neutral-900 text-neutral-0">
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
          <p className="mb-3 text-sm">{t('camera.permission.denied')}</p>
          {errorMsg && (
            <p className="mb-3 text-2xs text-neutral-400">{errorMsg}</p>
          )}
          <button
            type="button"
            className="mb-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-bold text-neutral-0"
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
            className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-bold text-neutral-0"
            onClick={() => fileInputRef.current?.click()}
          >
            {t('camera.permission.fallbackInput')}
          </button>
        </Overlay>
      )}

      {status === 'streaming' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-56 w-56 rounded-2xl border-2 border-neutral-0/60" />
        </div>
      )}

      <div className="absolute inset-x-0 bottom-6 flex items-center justify-center">
        <button
          type="button"
          aria-label={t('camera.shutter.aria')}
          onClick={handleShutter}
          disabled={status !== 'streaming' || disabled}
          className="h-[72px] w-[72px] rounded-full border-4 border-neutral-0 bg-primary-500 shadow-lg transition active:scale-95 disabled:opacity-40"
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

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/85 p-6 text-center">
      {children}
    </div>
  );
}
