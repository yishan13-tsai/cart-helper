import {
  ArrowLeftRight,
  ArrowRight,
  Bell,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Eye,
  Flashlight,
  Globe,
  History,
  Info,
  LayoutGrid,
  List,
  Minus,
  Moon,
  Pencil,
  Plus,
  Receipt,
  ScanLine,
  Settings,
  ShoppingCart,
  Sparkles,
  Tag,
  Trash2,
  User,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export type TIconName =
  | 'scan'
  | 'cart'
  | 'receipt'
  | 'history'
  | 'gear'
  | 'plus'
  | 'minus'
  | 'check'
  | 'x'
  | 'chev'
  | 'chevL'
  | 'flash'
  | 'bell'
  | 'user'
  | 'arrow'
  | 'edit'
  | 'sparkle'
  | 'info'
  | 'swap'
  | 'grid'
  | 'bolt'
  | 'list'
  | 'calendar'
  | 'tag'
  | 'cloud'
  | 'moon'
  | 'eye'
  | 'lang'
  | 'trash';

const ICONS: Record<TIconName, LucideIcon> = {
  scan: ScanLine,
  cart: ShoppingCart,
  receipt: Receipt,
  history: History,
  gear: Settings,
  plus: Plus,
  minus: Minus,
  check: Check,
  x: X,
  chev: ChevronRight,
  chevL: ChevronLeft,
  flash: Flashlight,
  bell: Bell,
  user: User,
  arrow: ArrowRight,
  edit: Pencil,
  sparkle: Sparkles,
  info: Info,
  swap: ArrowLeftRight,
  grid: LayoutGrid,
  bolt: Zap,
  list: List,
  calendar: Calendar,
  tag: Tag,
  cloud: Cloud,
  moon: Moon,
  eye: Eye,
  lang: Globe,
  trash: Trash2,
};

interface TIconProps {
  name: TIconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

/**
 * Thin wrapper over lucide-react that preserves the design-handoff naming
 * (`scan`, `chev`, `flash` etc.) so screens read the same as the source
 * `themed-screens.jsx`. Color is inherited from `currentColor` — set via
 * Tailwind `text-*` classes on the parent.
 */
export function TIcon({ name, size = 22, className, strokeWidth = 1.7 }: TIconProps) {
  const Icon = ICONS[name];
  return <Icon size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" />;
}
