// CSS var helpers — each returns an rgb(...) string usable in style={}
const v = {
  page: 'rgb(var(--ch-page))',
  surface: 'rgb(var(--ch-surface))',
  ink: 'rgb(var(--ch-ink))',
  ink60: 'rgb(var(--ch-ink60))',
  ink30: 'rgb(var(--ch-ink30))',
  chip1: 'rgb(var(--ch-chip1))',
  chip2: 'rgb(var(--ch-chip2))',
};

// ─── BagIllus ───────────────────────────────────────────────────
// Cartoon shopping bag. Default size=200.
interface BagIllusProps {
  size?: number;
}

export function BagIllus({ size = 200 }: BagIllusProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <ellipse cx="100" cy="180" rx="62" ry="6" fill="#000" opacity="0.08" />
      <path
        d="M48 70 L60 175 Q60 178 64 178 L136 178 Q140 178 140 175 L152 70 Z"
        style={{ fill: v.page }}
      />
      <path
        d="M52 75 L62 160 Q63 163 67 162 L80 158 L70 75 Z"
        fill="#fff"
        opacity="0.18"
      />
      <path
        d="M70 70 Q70 30 100 30 Q130 30 130 70"
        fill="none"
        style={{ stroke: v.page }}
        strokeWidth="9"
        strokeLinecap="round"
      />
      <circle cx="86" cy="62" r="14" style={{ fill: v.chip1 }} />
      <path
        d="M86 50 Q88 44 92 46"
        stroke="#3B7A3F"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="115" cy="58" r="11" style={{ fill: v.chip2 }} />
      <path
        d="M115 49 Q117 44 121 46"
        stroke="#3B7A3F"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M100 60 L108 64 L106 76 L98 74 Z" fill="#fff" />
      <g style={{ fill: v.page }} opacity="0.5">
        <circle cx="40" cy="40" r="3" />
        <circle cx="170" cy="50" r="2.5" />
        <circle cx="35" cy="120" r="2" />
        <circle cx="172" cy="130" r="3" />
      </g>
      <g style={{ stroke: v.page }} strokeWidth="2" strokeLinecap="round" opacity="0.5">
        <line x1="30" y1="65" x2="30" y2="71" />
        <line x1="27" y1="68" x2="33" y2="68" />
        <line x1="175" y1="95" x2="175" y2="101" />
        <line x1="172" y1="98" x2="178" y2="98" />
      </g>
    </svg>
  );
}

// ─── ScanIllus ──────────────────────────────────────────────────
// Magnifier-on-tag illustration for scan screens. Default size=200.
interface ScanIllusProps {
  size?: number;
}

export function ScanIllus({ size = 200 }: ScanIllusProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <ellipse cx="100" cy="180" rx="60" ry="5" fill="#000" opacity="0.08" />
      <rect
        x="36"
        y="50"
        width="80"
        height="100"
        rx="6"
        fill="#fff"
        style={{ stroke: v.ink }}
        strokeWidth="2.5"
      />
      <rect x="46" y="64" width="38" height="6" rx="3" style={{ fill: v.ink60 }} />
      <rect x="46" y="76" width="50" height="4" rx="2" style={{ fill: v.ink30 }} />
      <text
        x="46"
        y="120"
        fontFamily="Inter"
        fontWeight="800"
        fontSize="36"
        style={{ fill: v.page }}
      >
        $55
      </text>
      <rect x="46" y="130" width="50" height="3" rx="1.5" style={{ fill: v.ink30 }} />
      <circle
        cx="138"
        cy="100"
        r="40"
        fill="none"
        style={{ stroke: v.page }}
        strokeWidth="6"
      />
      <circle cx="138" cy="100" r="34" fill="#fff" opacity="0.4" />
      <line
        x1="166"
        y1="128"
        x2="180"
        y2="142"
        style={{ stroke: v.page }}
        strokeWidth="8"
        strokeLinecap="round"
      />
      <g style={{ fill: v.page }} opacity="0.6">
        <circle cx="22" cy="44" r="2.5" />
        <circle cx="180" cy="50" r="2" />
        <circle cx="20" cy="110" r="2" />
      </g>
    </svg>
  );
}

// ─── ReceiptIllus ───────────────────────────────────────────────
// Receipt illustration for receipt-scan screens. Default size=140.
interface ReceiptIllusProps {
  size?: number;
}

export function ReceiptIllus({ size = 140 }: ReceiptIllusProps) {
  const rows = [55, 70, 85, 100, 115];

  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 140 180">
      <ellipse cx="70" cy="170" rx="44" ry="4" fill="#000" opacity="0.08" />
      <path
        d="M30 14 H110 V158 L100 152 L92 158 L84 152 L76 158 L68 152 L60 158 L52 152 L44 158 L36 152 L30 158 Z"
        fill="#fff"
        style={{ stroke: v.ink }}
        strokeWidth="2"
      />
      <line
        x1="42"
        y1="40"
        x2="98"
        y2="40"
        style={{ stroke: v.page }}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {rows.map((y, i) => (
        <g key={i}>
          <line
            x1="42"
            y1={y}
            x2={i % 2 ? 76 : 80}
            y2={y}
            style={{ stroke: v.ink60 }}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="86"
            y1={y}
            x2="98"
            y2={y}
            style={{ stroke: v.ink60 }}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      ))}
      <line
        x1="42"
        y1="130"
        x2="98"
        y2="130"
        style={{ stroke: v.ink }}
        strokeWidth="2"
        strokeDasharray="3 3"
      />
      <line
        x1="42"
        y1="142"
        x2="60"
        y2="142"
        style={{ stroke: v.ink }}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="78"
        y1="142"
        x2="98"
        y2="142"
        style={{ stroke: v.page }}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── StackIllus ─────────────────────────────────────────────────
// History illustration: stack of receipts. Default size=110.
interface StackIllusProps {
  size?: number;
}

export function StackIllus({ size = 110 }: StackIllusProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <rect
        x="22"
        y="32"
        width="64"
        height="74"
        rx="4"
        fill="#fff"
        style={{ stroke: v.ink }}
        strokeWidth="2"
        transform="rotate(-6 54 69)"
      />
      <rect
        x="34"
        y="22"
        width="64"
        height="74"
        rx="4"
        style={{ fill: v.surface, stroke: v.ink }}
        strokeWidth="2"
        transform="rotate(4 66 59)"
      />
      <rect
        x="28"
        y="14"
        width="64"
        height="84"
        rx="4"
        fill="#fff"
        style={{ stroke: v.ink }}
        strokeWidth="2.5"
      />
      <line
        x1="38"
        y1="32"
        x2="82"
        y2="32"
        style={{ stroke: v.page }}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="38"
        y1="44"
        x2="76"
        y2="44"
        style={{ stroke: v.ink60 }}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="38"
        y1="54"
        x2="80"
        y2="54"
        style={{ stroke: v.ink60 }}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="38"
        y1="64"
        x2="70"
        y2="64"
        style={{ stroke: v.ink60 }}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="38"
        y1="78"
        x2="60"
        y2="78"
        style={{ stroke: v.ink }}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
