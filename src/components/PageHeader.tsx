import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RoundButton } from './RoundButton';
import { type TIconName } from './TIcon';

interface PageHeaderProps {
  /** Defaults to a back chevron that calls `navigate(-1)`. Pass `null` to omit. */
  left?: React.ReactNode | null;
  /** Defaults to an empty placeholder so the title stays centred. */
  right?: React.ReactNode | null;
  /** When `right` is omitted, render a `<RoundButton>` with this icon. */
  rightIcon?: TIconName;
  /** Optional onClick for the convenience right RoundButton. */
  onRightClick?: () => void;
  /** Override the centred letter-spaced label. */
  title?: string;
}

/**
 * Standard page header used by Cart / History / Comparison / TripGate /
 * Settings. Three-column layout: round button left, letter-spaced title
 * centred, round button right. Use `left={null}` to remove the back button
 * (e.g. on a top-level page where there's nowhere to go back to).
 */
export function PageHeader({
  left,
  right,
  rightIcon,
  onRightClick,
  title,
}: PageHeaderProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const leftEl =
    left === null
      ? <div className="h-9 w-9" aria-hidden />
      : (left ?? (
          <RoundButton
            icon="chevL"
            onClick={() => navigate(-1)}
            aria-label={t('common.back')}
          />
        ));

  const rightEl =
    right === null
      ? <div className="h-9 w-9" aria-hidden />
      : (right ?? (rightIcon
          ? <RoundButton icon={rightIcon} onClick={onRightClick} />
          : <div className="h-9 w-9" aria-hidden />));

  return (
    <div className="flex items-center justify-between px-5 pt-4 pb-2">
      {leftEl}
      <span className="text-[11px] font-bold tracking-[4px] text-ink-60 uppercase">
        {title ?? 'CART HELPER'}
      </span>
      {rightEl}
    </div>
  );
}
