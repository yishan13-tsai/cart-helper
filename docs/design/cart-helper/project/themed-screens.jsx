// All 10 themed screens in Style-A illustrative crimson, theme-driven
const useTheme = () => window.CH_USE_THEME();

// ─── shared icon (subset of primitives) ───
function TIcon({ name, size = 22, color, sw = 1.7 }) {
  const c = { fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const p = {
    scan:    <g {...c}><path d="M4 8V6a2 2 0 0 1 2-2h2"/><path d="M20 8V6a2 2 0 0 0-2-2h-2"/><path d="M4 16v2a2 2 0 0 0 2 2h2"/><path d="M20 16v2a2 2 0 0 1-2 2h-2"/><path d="M4 12h16"/></g>,
    cart:    <g {...c}><path d="M3 4h2l2.4 11.2A2 2 0 0 0 9.36 17H18a2 2 0 0 0 1.95-1.57L21.5 8H6"/><circle cx="10" cy="20" r="1.2" fill={color}/><circle cx="17" cy="20" r="1.2" fill={color}/></g>,
    receipt: <g {...c}><path d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21V3Z"/><path d="M9 8h6M9 12h6M9 16h4"/></g>,
    history: <g {...c}><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v4h4"/><path d="M12 7v5l3 2"/></g>,
    gear:    <g {...c}><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.4-2.4l2-1.5-2-3.4-2.3 1a7 7 0 0 0-4-2.3L11.7 1h-3.4l-.6 2.4a7 7 0 0 0-4 2.3l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 1 12c0 .8.1 1.6.4 2.4l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 4 2.3l.6 2.4h3.4l.6-2.4a7 7 0 0 0 4-2.3l2.3 1 2-3.4-2-1.5c.3-.8.4-1.6.4-2.4Z"/></g>,
    plus:    <g {...c}><path d="M12 5v14M5 12h14"/></g>,
    minus:   <g {...c}><path d="M5 12h14"/></g>,
    check:   <g {...c}><path d="M5 12.5l4.5 4.5L19 7.5"/></g>,
    x:       <g {...c}><path d="M6 6l12 12M18 6L6 18"/></g>,
    chev:    <g {...c}><path d="M9 6l6 6-6 6"/></g>,
    chevL:   <g {...c}><path d="M15 6l-6 6 6 6"/></g>,
    flash:   <g {...c}><path d="M13 2 4 14h7l-1 8 10-12h-7l0-8Z"/></g>,
    bell:    <g {...c}><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5L6 16Z"/><path d="M10 21a2 2 0 0 0 4 0"/></g>,
    user:    <g {...c}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></g>,
    arrow:   <g {...c}><path d="M5 12h14M13 6l6 6-6 6"/></g>,
    edit:    <g {...c}><path d="M4 20h4L20 8l-4-4L4 16v4Z"/><path d="M14 6l4 4"/></g>,
    sparkle: <g {...c}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></g>,
    info:    <g {...c}><circle cx="12" cy="12" r="9"/><path d="M12 8v.5M12 11v6"/></g>,
    swap:    <g {...c}><path d="M7 4 3 8l4 4M3 8h12a4 4 0 0 1 0 8h-2"/><path d="M17 20l4-4-4-4"/></g>,
    grid:    <g {...c}><rect x="4" y="4" width="7" height="7" rx="1.4"/><rect x="13" y="4" width="7" height="7" rx="1.4"/><rect x="4" y="13" width="7" height="7" rx="1.4"/><rect x="13" y="13" width="7" height="7" rx="1.4"/></g>,
    bolt:    <g {...c}><path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z"/></g>,
    list:    <g {...c}><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="5" cy="6" r="1.2" fill={color}/><circle cx="5" cy="12" r="1.2" fill={color}/><circle cx="5" cy="18" r="1.2" fill={color}/></g>,
    calendar:<g {...c}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></g>,
    tag:     <g {...c}><path d="M3 12V4h8l10 10-8 8-10-10Z"/><circle cx="8" cy="8" r="1.5" fill={color}/></g>,
    cloud:   <g {...c}><path d="M7 18h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6 11.5 4 4 0 0 0 7 18Z"/></g>,
    moon:    <g {...c}><path d="M20 14a8 8 0 0 1-10-10 8 8 0 1 0 10 10Z"/></g>,
    eye:     <g {...c}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></g>,
    lang:    <g {...c}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></g>,
    trash:   <g {...c}><path d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/></g>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>{p[name]}</svg>;
}

// Cartoon shopping bag illustration
function BagIllus({ size = 200, t }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <ellipse cx="100" cy="180" rx="62" ry="6" fill="#000" opacity="0.08"/>
      <path d="M48 70 L60 175 Q60 178 64 178 L136 178 Q140 178 140 175 L152 70 Z" fill={t.page}/>
      <path d="M52 75 L62 160 Q63 163 67 162 L80 158 L70 75 Z" fill="#fff" opacity="0.18"/>
      <path d="M70 70 Q70 30 100 30 Q130 30 130 70" fill="none" stroke={t.page} strokeWidth="9" strokeLinecap="round"/>
      <circle cx="86" cy="62" r="14" fill={t.chip1}/>
      <path d="M86 50 Q88 44 92 46" stroke="#3B7A3F" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <circle cx="115" cy="58" r="11" fill={t.chip2}/>
      <path d="M115 49 Q117 44 121 46" stroke="#3B7A3F" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <path d="M100 60 L108 64 L106 76 L98 74 Z" fill="#fff"/>
      <g fill={t.page} opacity="0.5">
        <circle cx="40" cy="40" r="3"/><circle cx="170" cy="50" r="2.5"/>
        <circle cx="35" cy="120" r="2"/><circle cx="172" cy="130" r="3"/>
      </g>
      <g stroke={t.page} strokeWidth="2" strokeLinecap="round" opacity="0.5">
        <line x1="30" y1="65" x2="30" y2="71"/><line x1="27" y1="68" x2="33" y2="68"/>
        <line x1="175" y1="95" x2="175" y2="101"/><line x1="172" y1="98" x2="178" y2="98"/>
      </g>
    </svg>
  );
}

// Receipt illustration for receipt-scan screens
function ReceiptIllus({ size = 140, t }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 140 180">
      <ellipse cx="70" cy="170" rx="44" ry="4" fill="#000" opacity="0.08"/>
      <path d="M30 14 H110 V158 L100 152 L92 158 L84 152 L76 158 L68 152 L60 158 L52 152 L44 158 L36 152 L30 158 Z" fill="#fff" stroke={t.ink} strokeWidth="2"/>
      <line x1="42" y1="40" x2="98" y2="40" stroke={t.page} strokeWidth="3" strokeLinecap="round"/>
      {[55, 70, 85, 100, 115].map((y, i) => (
        <g key={i}>
          <line x1="42" y1={y} x2={i % 2 ? 76 : 80} y2={y} stroke={t.ink60} strokeWidth="2" strokeLinecap="round"/>
          <line x1="86" y1={y} x2="98" y2={y} stroke={t.ink60} strokeWidth="2" strokeLinecap="round"/>
        </g>
      ))}
      <line x1="42" y1="130" x2="98" y2="130" stroke={t.ink} strokeWidth="2" strokeDasharray="3 3"/>
      <line x1="42" y1="142" x2="60" y2="142" stroke={t.ink} strokeWidth="3" strokeLinecap="round"/>
      <line x1="78" y1="142" x2="98" y2="142" stroke={t.page} strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

// Magnifier-on-tag illustration for scan screens
function ScanIllus({ size = 200, t }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <ellipse cx="100" cy="180" rx="60" ry="5" fill="#000" opacity="0.08"/>
      <rect x="36" y="50" width="80" height="100" rx="6" fill="#fff" stroke={t.ink} strokeWidth="2.5"/>
      <rect x="46" y="64" width="38" height="6" rx="3" fill={t.ink60}/>
      <rect x="46" y="76" width="50" height="4" rx="2" fill={t.ink30}/>
      <text x="46" y="120" fontFamily="Inter" fontWeight="800" fontSize="36" fill={t.page}>$55</text>
      <rect x="46" y="130" width="50" height="3" rx="1.5" fill={t.ink30}/>
      <circle cx="138" cy="100" r="40" fill="none" stroke={t.page} strokeWidth="6"/>
      <circle cx="138" cy="100" r="34" fill="#fff" opacity="0.4"/>
      <line x1="166" y1="128" x2="180" y2="142" stroke={t.page} strokeWidth="8" strokeLinecap="round"/>
      <g fill={t.page} opacity="0.6">
        <circle cx="22" cy="44" r="2.5"/><circle cx="180" cy="50" r="2"/>
        <circle cx="20" cy="110" r="2"/>
      </g>
    </svg>
  );
}

// History illustration: stack of receipts
function StackIllus({ size = 110, t }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <rect x="22" y="32" width="64" height="74" rx="4" fill="#fff" stroke={t.ink} strokeWidth="2" transform="rotate(-6 54 69)"/>
      <rect x="34" y="22" width="64" height="74" rx="4" fill={t.surface} stroke={t.ink} strokeWidth="2" transform="rotate(4 66 59)"/>
      <rect x="28" y="14" width="64" height="84" rx="4" fill="#fff" stroke={t.ink} strokeWidth="2.5"/>
      <line x1="38" y1="32" x2="82" y2="32" stroke={t.page} strokeWidth="3" strokeLinecap="round"/>
      <line x1="38" y1="44" x2="76" y2="44" stroke={t.ink60} strokeWidth="2" strokeLinecap="round"/>
      <line x1="38" y1="54" x2="80" y2="54" stroke={t.ink60} strokeWidth="2" strokeLinecap="round"/>
      <line x1="38" y1="64" x2="70" y2="64" stroke={t.ink60} strokeWidth="2" strokeLinecap="round"/>
      <line x1="38" y1="78" x2="60" y2="78" stroke={t.ink} strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

// Reusable
const Pill = ({ children, bg, color, size = 11 }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999,
    background: bg, color, fontSize: size, fontWeight: 700, lineHeight: 1 }}>{children}</span>
);

const Btn = ({ children, t, fill = true, size = 'lg', icon, onClick }) => {
  const h = size === 'lg' ? 56 : 48;
  return (
    <button onClick={onClick} style={{
      width: '100%', height: h, borderRadius: h/2, border: fill ? 'none' : `1.5px solid ${t.ink}22`,
      background: fill ? t.page : 'transparent',
      color: fill ? '#fff' : t.ink60,
      fontSize: size === 'lg' ? 16 : 14, fontWeight: 700,
      fontFamily: '"Noto Sans TC", system-ui', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      boxShadow: fill ? `0 14px 24px -12px ${t.page}` : 'none',
    }}>{icon && <TIcon name={icon} size={18} color={fill ? '#fff' : t.ink60}/>}{children}</button>
  );
};

const Header = ({ t, left, right, title, subtitle }) => (
  <div style={{ paddingTop: 56, padding: '56px 22px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    {left || <div style={{ width: 36 }}/>}
    <div style={{ textAlign: 'center', flex: 1, padding: '0 8px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 4, color: t.ink60 }}>CART HELPER</div>
      {subtitle && <div style={{ fontSize: 11, color: t.ink60, marginTop: 2 }}>{subtitle}</div>}
    </div>
    {right || <div style={{ width: 36 }}/>}
  </div>
);

const RB = ({ t, icon, bg, color, onClick }) => (
  <button onClick={onClick} style={{
    width: 36, height: 36, borderRadius: 18, border: 'none',
    background: bg || t.surface, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}><TIcon name={icon} size={16} color={color || t.page}/></button>
);

// ═══════════════════════════════════════════════════════════════
// 1. Onboarding
// ═══════════════════════════════════════════════════════════════
function S1_Onboarding() {
  const t = useTheme();
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.ink,
      fontFamily: '"Noto Sans TC", system-ui', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 56 }}/>
      <div style={{
        margin: '12px 24px 0', flex: 1, background: t.surface, borderRadius: 28,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '40px 20px', position: 'relative', overflow: 'hidden',
      }}>
        {[[30,30,1],[24,50,0.5],[170,40,1],[24,80,1],[170,160,0.5]].map(([l,top,o],i) => (
          <div key={i} style={{ position: 'absolute', top, left: l, width: 4, height: 4, borderRadius: 2, background: t.page, opacity: o }}/>
        ))}
        <BagIllus size={200} t={t}/>
        <div style={{ marginTop: 36, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, color: t.page, marginBottom: 14 }}>CART HELPER</div>
          <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.35, letterSpacing: -0.3 }}>
            掃一下標籤<br/>收據不踩雷
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 32 }}>
          <div style={{ width: 16, height: 4, borderRadius: 2, background: t.page }}/>
          <div style={{ width: 4, height: 4, borderRadius: 2, background: t.page, opacity: 0.3 }}/>
          <div style={{ width: 4, height: 4, borderRadius: 2, background: t.page, opacity: 0.3 }}/>
        </div>
      </div>
      <div style={{ padding: '20px 24px 30px' }}>
        <Btn t={t}>開始</Btn>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 2. Home
// ═══════════════════════════════════════════════════════════════
function S2_Home() {
  const t = useTheme();
  const items = [
    { name: '統一鮮乳',   qty: 2, price: 178, color: '#EAF1FB', emoji: '🥛' },
    { name: '愛文芒果',   qty: 1, price: 159, color: '#FFEBD8', emoji: '🥭' },
    { name: '舒潔衛生紙', qty: 1, price: 249, color: t.surface, emoji: '🧻' },
  ];
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.ink, fontFamily: '"Noto Sans TC", system-ui', position: 'relative', overflow: 'hidden' }}>
      <div style={{ paddingTop: 56, padding: '56px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button style={{ width: 36, height: 36, borderRadius: 12, border: `1.5px solid ${t.ink}22`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TIcon name="chevL" size={18} color={t.ink}/>
          </button>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, color: t.ink60 }}>CART HELPER</div>
          <button style={{ width: 36, height: 36, borderRadius: 18, background: t.surface, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TIcon name="user" size={16} color={t.page}/>
          </button>
        </div>

        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.2, letterSpacing: -0.5 }}>
            本次購物<br/>合計 <span style={{ color: t.page }}>$1,112</span>
          </div>
          <div style={{ fontSize: 13, color: t.ink60, marginTop: 8 }}>家樂福 內湖店 · 9 件商品</div>
        </div>

        <div style={{ marginTop: 24, background: t.surface, borderRadius: 24, padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: 28, background: t.page, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 10px 18px -8px ${t.page}80` }}>
            <TIcon name="scan" size={26} color="#fff" sw={2}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>掃描下一個商品</div>
            <div style={{ fontSize: 12, color: t.ink60, marginTop: 2 }}>對準價格標即可</div>
          </div>
          <TIcon name="arrow" size={20} color={t.ink}/>
        </div>

        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>購物明細</span>
            <span style={{ fontSize: 12, color: t.page, fontWeight: 700 }}>查看全部 →</span>
          </div>
          {items.map((it, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 4px', borderTop: i === 0 ? 'none' : `1px solid ${t.ink}10` }}>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: it.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{it.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{it.name}</div>
                <div style={{ fontSize: 11, color: t.ink60 }}>×{it.qty}</div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Inter, system-ui' }}>${it.price}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 28, left: 24, right: 24 }}>
        <button style={{ width: '100%', height: 56, borderRadius: 28, border: 'none', cursor: 'pointer',
          background: t.page, color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: '"Noto Sans TC", system-ui',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px 0 24px',
          boxShadow: `0 14px 28px -12px ${t.page}` }}>
          <span>結帳後掃發票比對</span>
          <span style={{ width: 40, height: 40, borderRadius: 20, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TIcon name="receipt" size={18} color={t.page}/>
          </span>
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 3. Scan tag
// ═══════════════════════════════════════════════════════════════
function S3_Scan() {
  const t = useTheme();
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.ink, fontFamily: '"Noto Sans TC", system-ui', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 56 }}/>
      <div style={{ padding: '0 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <RB t={t} icon="x" bg="#fff" color={t.ink}/>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, color: t.ink60 }}>SCAN TAG</div>
        <RB t={t} icon="flash"/>
      </div>

      <div style={{ margin: '20px 22px 0', flex: 1, background: t.surface, borderRadius: 28,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '32px 20px', position: 'relative', overflow: 'hidden' }}>
        {[[24,30,1],[170,40,0.5],[28,200,1],[174,260,1]].map(([l,top,o],i) => (
          <div key={i} style={{ position: 'absolute', top, left: l, width: 4, height: 4, borderRadius: 2, background: t.page, opacity: o }}/>
        ))}
        <ScanIllus size={200} t={t}/>
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3, letterSpacing: -0.3 }}>對準價格標</div>
          <div style={{ fontSize: 13, color: t.ink60, marginTop: 8, lineHeight: 1.5 }}>
            把商品價格標放在中間<br/>App 會自動辨識
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: 6, padding: 4, background: '#fff', borderRadius: 999 }}>
          {['價格標','條碼','手動'].map((m, i) => (
            <div key={m} style={{ padding: '8px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700,
              background: i === 0 ? t.page : 'transparent',
              color: i === 0 ? '#fff' : t.ink60 }}>{m}</div>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 22px 30px' }}>
        <div style={{ marginBottom: 12, padding: '12px 14px', background: '#fff', borderRadius: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: t.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TIcon name="cart" size={18} color="#fff" sw={2}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: t.ink60 }}>已加入購物車</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>9 件 · NT$ 1,025</div>
          </div>
          <TIcon name="chev" size={16} color={t.ink60}/>
        </div>
        <Btn t={t} icon="scan">啟動相機掃描</Btn>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 4. Confirm
// ═══════════════════════════════════════════════════════════════
function S4_Confirm() {
  const t = useTheme();
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.ink, fontFamily: '"Noto Sans TC", system-ui' }}>
      <Header t={t} left={<RB t={t} icon="chevL"/>} right={<RB t={t} icon="x"/>}/>

      <div style={{ padding: '0 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <div style={{ width: 76, height: 76, borderRadius: 38, background: t.successWash, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 8px ${t.successWash}55` }}>
            <div style={{ width: 56, height: 56, borderRadius: 28, background: t.success, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TIcon name="check" size={30} color="#fff" sw={2.6}/>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}>已加入購物車</div>
          <div style={{ fontSize: 12, color: t.ink60, marginTop: 4 }}>辨識成功 · 信心度 98%</div>
        </div>

        <div style={{ background: t.surface, borderRadius: 24, padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🍵</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: t.ink60 }}>義美 · 飲料</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>義美厚奶茶 950ml</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: t.page, fontFamily: 'Inter, system-ui' }}>$55</span>
                <span style={{ fontSize: 11, color: t.ink60, textDecoration: 'line-through' }}>$65</span>
                <Pill bg={t.alertWash} color={t.alert}>特價</Pill>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 14, padding: '10px 14px', background: '#fff', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: t.ink60 }}>數量</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button style={{ width: 32, height: 32, borderRadius: 16, border: 'none', background: t.surface, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TIcon name="minus" size={16} color={t.ink}/>
              </button>
              <span style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Inter, system-ui', minWidth: 24, textAlign: 'center' }}>2</span>
              <button style={{ width: 32, height: 32, borderRadius: 16, border: 'none', background: t.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TIcon name="plus" size={16} color="#fff" sw={2.4}/>
              </button>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: 12, color: t.ink60, margin: '16px 0' }}>
          辨識錯誤？<span style={{ color: t.page, fontWeight: 700 }}>手動修改</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn t={t} icon="scan">繼續掃描下一件</Btn>
          <Btn t={t} fill={false} size="md">前往購物車</Btn>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 5. Cart edit
// ═══════════════════════════════════════════════════════════════
function S5_Cart() {
  const t = useTheme();
  const items = [
    { name: '統一鮮乳 936ml', sub: '冷藏', qty: 2, price: 89, color: '#EAF1FB', emoji: '🥛' },
    { name: '台灣土雞蛋 10入', sub: '蛋豆', qty: 1, price: 95, color: '#FCEFD8', emoji: '🥚' },
    { name: '愛文芒果 1袋', sub: '生鮮', qty: 1, price: 159, color: '#FFEBD8', emoji: '🥭' },
    { name: '可口可樂 2L', sub: '飲料', qty: 3, price: 65, color: '#F8DEDE', emoji: '🥤' },
    { name: '舒潔抽取式衛生紙', sub: '日用品', qty: 1, price: 249, color: t.surface, emoji: '🧻' },
    { name: '義美厚奶茶', sub: '飲料', qty: 2, price: 55, color: '#E8E2D0', emoji: '🍵' },
  ];
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.ink, fontFamily: '"Noto Sans TC", system-ui', position: 'relative', overflow: 'hidden' }}>
      <Header t={t} left={<RB t={t} icon="chevL"/>} right={<RB t={t} icon="edit"/>}/>

      <div style={{ padding: '0 22px 8px' }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.3 }}>購物車</div>
        <div style={{ fontSize: 12, color: t.ink60 }}>9 件 · 內湖店</div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '12px 22px', overflowX: 'auto' }}>
        {[{l:'全部 6',a:1},{l:'生鮮 2'},{l:'飲料 2'},{l:'日用品 1'}].map((f, i) => (
          <div key={i} style={{ padding: '7px 14px', borderRadius: 999,
            background: f.a ? t.ink : '#fff', color: f.a ? '#fff' : t.ink60,
            fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>{f.l}</div>
        ))}
      </div>

      <div style={{ padding: '0 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((it, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 18, padding: 12,
            display: 'flex', alignItems: 'center', gap: 12,
            ...(i === 1 ? { borderRight: `4px solid ${t.page}` } : {}) }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: it.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{it.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{it.name}</div>
              <div style={{ fontSize: 11, color: t.ink60, marginTop: 2 }}>{it.sub} · NT${it.price}/件</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button style={{ width: 26, height: 26, borderRadius: 13, border: 'none', background: t.surface, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TIcon name="minus" size={12} color={t.ink60}/></button>
              <span style={{ fontSize: 14, fontWeight: 800, fontFamily: 'Inter, system-ui', minWidth: 16, textAlign: 'center' }}>{it.qty}</span>
              <button style={{ width: 26, height: 26, borderRadius: 13, border: 'none', background: t.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TIcon name="plus" size={12} color="#fff" sw={2.4}/></button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: 130 }}/>
      <div style={{ position: 'absolute', bottom: 28, left: 16, right: 16, background: '#fff',
        borderRadius: 24, padding: 16, boxShadow: '0 -8px 30px -10px rgba(0,0,0,0.18)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <span style={{ fontSize: 26, fontWeight: 800, fontFamily: 'Inter, system-ui', letterSpacing: -0.5 }}>
            <span style={{ fontSize: 14, opacity: 0.6, marginRight: 4 }}>NT$</span>{subtotal.toLocaleString()}
          </span>
          <span style={{ fontSize: 12, color: t.success, fontWeight: 700 }}>已省 NT$ 87</span>
        </div>
        <Btn t={t} icon="receipt">結帳後掃發票比對</Btn>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 6. Receipt scan
// ═══════════════════════════════════════════════════════════════
function S6_ReceiptScan() {
  const t = useTheme();
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.ink, fontFamily: '"Noto Sans TC", system-ui', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 56 }}/>
      <div style={{ padding: '0 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <RB t={t} icon="x" bg="#fff" color={t.ink}/>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, color: t.ink60 }}>SCAN RECEIPT</div>
        <RB t={t} icon="grid"/>
      </div>

      <div style={{ margin: '20px 22px 0', flex: 1, background: t.surface, borderRadius: 28,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '24px 20px', position: 'relative', overflow: 'hidden' }}>
        {[[26,40,1],[170,50,0.5],[24,260,1]].map(([l,top,o],i) => (
          <div key={i} style={{ position: 'absolute', top, left: l, width: 4, height: 4, borderRadius: 2, background: t.page, opacity: o }}/>
        ))}
        <ReceiptIllus size={150} t={t}/>
        <div style={{ marginTop: 18, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}>對齊發票四角</div>
          <div style={{ fontSize: 13, color: t.ink60, marginTop: 8, lineHeight: 1.5 }}>
            放在平面上，App 會<br/>自動辨識每一筆品項
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 22px 30px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Btn t={t} icon="camera">拍攝發票</Btn>
        <Btn t={t} fill={false} size="md">從相簿選擇</Btn>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 7. Compare side-by-side
// ═══════════════════════════════════════════════════════════════
function S7_Compare() {
  const t = useTheme();
  const cart = [
    { n: '統一鮮乳', q: 2, p: 178, s: 'ok' },
    { n: '土雞蛋',   q: 1, p: 95,  s: 'ok' },
    { n: '愛文芒果', q: 1, p: 159, s: 'over' },
    { n: '可口可樂', q: 3, p: 195, s: 'miss' },
    { n: '舒潔衛生紙', q: 1, p: 249, s: 'ok' },
  ];
  const rec = [
    { n: '統一鮮乳', q: 2, p: 178, s: 'ok' },
    { n: '土雞蛋',   q: 1, p: 95,  s: 'ok' },
    { n: '愛文芒果', q: 1, p: 199, s: 'over' },
    { n: '舒潔衛生紙', q: 1, p: 249, s: 'ok' },
    { n: '黑松沙士', q: 1, p: 35,  s: 'extra' },
  ];
  const dot = { ok: t.success, over: t.alert, miss: t.warn, extra: t.chip2 };

  const Col = ({ title, sub, total, items, accent }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
      <div style={{ background: '#fff', borderRadius: 18, padding: '12px 14px', borderTop: `3px solid ${accent}` }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: t.ink60, letterSpacing: 0.4 }}>{sub}</div>
        <div style={{ fontSize: 14, fontWeight: 800, marginTop: 2 }}>{title}</div>
        <div style={{ fontSize: 16, fontWeight: 800, marginTop: 4, fontFamily: 'Inter, system-ui' }}>
          <span style={{ fontSize: 11, opacity: 0.6 }}>NT$</span>{total.toLocaleString()}
        </div>
      </div>
      {items.map((it, i) => (
        <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '8px 10px', position: 'relative' }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.n}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: t.ink60 }}>×{it.q}</span>
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'Inter, system-ui' }}>${it.p}</span>
          </div>
          <div style={{ position: 'absolute', top: -1, right: -1, width: 8, height: 8, borderRadius: 4, background: dot[it.s], border: `1.5px solid ${t.bg}` }}/>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.ink, fontFamily: '"Noto Sans TC", system-ui' }}>
      <Header t={t} left={<RB t={t} icon="chevL"/>} right={<RB t={t} icon="info"/>}/>
      <div style={{ padding: '0 22px 12px', textAlign: 'center' }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.3 }}>比對結果</div>
        <div style={{ fontSize: 12, color: t.ink60, marginTop: 2 }}>家樂福 內湖店 · 04/25</div>
      </div>

      <div style={{ padding: '0 22px 12px' }}>
        <div style={{ background: t.surface, borderRadius: 20, padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: t.ink60, fontWeight: 600 }}>總差額</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: t.alert, fontFamily: 'Inter, system-ui', letterSpacing: -0.5 }}>+NT$ 40</div>
            </div>
            <Pill bg="#fff" color={t.alert}>3 處差異</Pill>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
            {[{l:'相符',n:4,c:t.success},{l:'價差',n:1,c:t.alert},{l:'漏結',n:1,c:t.warn},{l:'多結',n:1,c:t.chip2}].map((s,i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '8px 6px', textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: s.c, fontFamily: 'Inter, system-ui' }}>{s.n}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: s.c }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', gap: 8 }}>
        <Col title="購物車" sub="自己掃的" total={1112} items={cart} accent={t.page}/>
        <Col title="發票" sub="店家結帳" total={1061} items={rec} accent={t.chip2}/>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 8. Discrepancy
// ═══════════════════════════════════════════════════════════════
function S8_Discrep() {
  const t = useTheme();
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.ink, fontFamily: '"Noto Sans TC", system-ui' }}>
      <Header t={t} left={<RB t={t} icon="chevL"/>} subtitle="2 / 3"/>

      <div style={{ display: 'flex', gap: 6, padding: '0 22px 16px' }}>
        <div style={{ flex: 1, height: 5, borderRadius: 3, background: t.success }}/>
        <div style={{ flex: 1, height: 5, borderRadius: 3, background: t.page }}/>
        <div style={{ flex: 1, height: 5, borderRadius: 3, background: t.ink10 }}/>
      </div>

      <div style={{ padding: '0 22px' }}>
        <Pill bg={t.alertWash} color={t.alert}>價差 · 多收 NT$ 40</Pill>
        <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3, letterSpacing: -0.3, marginTop: 10 }}>
          這項商品的價格<br/>跟你掃的不一樣
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
          <div style={{ background: t.surface, borderRadius: 18, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: t.page, letterSpacing: 0.4, marginBottom: 8 }}>你掃到的</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: '#FFEBD8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🥭</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>玉井愛文芒果 1袋</div>
                <div style={{ fontSize: 11, color: t.ink60, marginTop: 2 }}>當日特價標</div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: t.page, fontFamily: 'Inter, system-ui' }}>$159</div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 18, padding: 16, borderRight: `4px solid ${t.alert}` }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: t.alert, letterSpacing: 0.4, marginBottom: 8 }}>發票顯示</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: t.surface, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TIcon name="receipt" size={24} color={t.ink60}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>愛文芒果</div>
                <div style={{ fontSize: 11, color: t.ink60, marginTop: 2 }}>原價 · 未套用特價</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: t.alert, fontFamily: 'Inter, system-ui' }}>$199</div>
                <div style={{ fontSize: 11, color: t.alert, fontWeight: 700 }}>+NT$ 40</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: t.ink60, margin: '18px 0 8px' }}>你想怎麼處理？</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { i:'bell',  l:'回客服中心反映',     s:'帶著發票去客服',      c:t.alert },
            { i:'check', l:'接受發票價格',         s:'特價可能已結束',      c:t.success },
            { i:'edit',  l:'我掃錯了 · 修正購物車', s:'把芒果改成 NT$ 199', c:t.chip2 },
          ].map((a,i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 16, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: a.c+'22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TIcon name={a.i} size={18} color={a.c} sw={2}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{a.l}</div>
                <div style={{ fontSize: 11, color: t.ink60, marginTop: 1 }}>{a.s}</div>
              </div>
              <TIcon name="chev" size={16} color={t.ink30}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 9. History
// ═══════════════════════════════════════════════════════════════
function S9_History() {
  const t = useTheme();
  const trips = [
    { d: '今天', store: '家樂福 · 內湖店', total: 1112, items: 9, diff: 40, st: 'pending' },
    { d: '昨天', store: '全聯 · 民權店',   total: 528,  items: 5, diff: 0,  st: 'clean' },
    { d: '04/22', store: '美廉社 · 行愛店', total: 215, items: 3, diff: -8, st: 'saved' },
    { d: '04/19', store: '家樂福 · 內湖店', total: 980, items: 7, diff: 0,  st: 'clean' },
    { d: '04/15', store: '頂好 · 港墘店',   total: 432, items: 6, diff: 25, st: 'ok' },
  ];
  const stMeta = {
    pending: { l: '待處理', bg: t.alertWash, fg: t.alert },
    clean:   { l: '無差異', bg: t.successWash, fg: t.success },
    saved:   { l: '省錢',   bg: t.successWash, fg: t.success },
    ok:      { l: '已解決', bg: t.surface, fg: t.page },
  };
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.ink, fontFamily: '"Noto Sans TC", system-ui' }}>
      <Header t={t} left={<RB t={t} icon="chevL"/>} right={<RB t={t} icon="calendar"/>}/>

      <div style={{ padding: '0 22px 14px' }}>
        <div style={{ background: t.surface, borderRadius: 24, padding: 18,
          display: 'flex', alignItems: 'center', gap: 14, position: 'relative', overflow: 'hidden' }}>
          <StackIllus size={88} t={t}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: t.ink60 }}>本月省下</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: t.page, fontFamily: 'Inter, system-ui', letterSpacing: -0.5 }}>
              <span style={{ fontSize: 14, opacity: 0.7 }}>NT$</span> 342
            </div>
            <div style={{ fontSize: 11, color: t.ink60, marginTop: 4 }}>本月 12 趟 · 6 處差異</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: t.ink60, letterSpacing: 0.4, marginBottom: 4 }}>歷史購物</div>
        {trips.map((tr, i) => {
          const m = stMeta[tr.st];
          return (
            <div key={i} style={{ background: '#fff', borderRadius: 18, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: t.surface,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 9, color: t.ink60, fontWeight: 700 }}>{tr.d.includes('/') ? tr.d.split('/')[0] : ''}</div>
                <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'Inter, system-ui', lineHeight: 1 }}>
                  {tr.d.includes('/') ? tr.d.split('/')[1] : tr.d}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{tr.store}</div>
                <div style={{ fontSize: 11, color: t.ink60, marginTop: 2 }}>{tr.items} 件 · NT$ {tr.total.toLocaleString()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'inline-block', padding: '3px 8px', borderRadius: 999, background: m.bg, color: m.fg, fontSize: 10, fontWeight: 700, marginBottom: 4 }}>{m.l}</div>
                {tr.diff !== 0 && (
                  <div style={{ fontSize: 12, fontWeight: 700, color: tr.diff > 0 ? t.alert : t.success, fontFamily: 'Inter, system-ui' }}>
                    {tr.diff > 0 ? '+' : ''}NT$ {Math.abs(tr.diff)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 10. Settings
// ═══════════════════════════════════════════════════════════════
function S10_Settings() {
  const t = useTheme();
  const Row = ({ icon, label, sub, value, toggle, last }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
      borderTop: last === 'first' ? 'none' : `1px solid ${t.ink}10` }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: t.surface, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <TIcon name={icon} size={16} color={t.page} sw={1.8}/>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: t.ink60, marginTop: 1 }}>{sub}</div>}
      </div>
      {toggle !== undefined && (
        <div style={{ width: 42, height: 24, borderRadius: 12, background: toggle ? t.page : t.ink10,
          display: 'flex', padding: 2, justifyContent: toggle ? 'flex-end' : 'flex-start' }}>
          <div style={{ width: 20, height: 20, borderRadius: 10, background: '#fff' }}/>
        </div>
      )}
      {value && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: t.ink60 }}>
          {value} <TIcon name="chev" size={12} color={t.ink30}/>
        </div>
      )}
    </div>
  );
  return (
    <div style={{ width: '100%', height: '100%', background: t.bg, color: t.ink, fontFamily: '"Noto Sans TC", system-ui' }}>
      <Header t={t} left={<RB t={t} icon="chevL"/>}/>
      <div style={{ padding: '0 22px 14px' }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.3, marginBottom: 14 }}>設定</div>
        <div style={{ background: t.surface, borderRadius: 24, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 52, height: 52, borderRadius: 26, background: t.page, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff' }}>陳</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>陳小美</div>
            <div style={{ fontSize: 11, color: t.ink60, marginTop: 1 }}>已連結手機條碼 /AB.CD12</div>
          </div>
          <TIcon name="chev" size={16} color={t.ink60}/>
        </div>
      </div>

      <div style={{ padding: '0 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.ink60, letterSpacing: 0.5, padding: '0 6px 6px' }}>掃描偏好</div>
          <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden' }}>
            <Row icon="tag" label="預設掃描模式" value="價格標" last="first"/>
            <Row icon="bolt" label="自動連續掃描" sub="掃完一張立刻打開下一張" toggle={true}/>
            <Row icon="bell" label="發票差異提醒" sub="超過 NT$ 10 時通知" toggle={true}/>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.ink60, letterSpacing: 0.5, padding: '0 6px 6px' }}>購物</div>
          <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden' }}>
            <Row icon="cart" label="預算提醒" value="NT$ 1,500" last="first"/>
            <Row icon="lang" label="語言" value="繁體中文"/>
            <Row icon="cloud" label="雲端備份" sub="iCloud · 已同步" toggle={true}/>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.ink60, letterSpacing: 0.5, padding: '0 6px 6px' }}>關於</div>
          <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden' }}>
            <Row icon="info" label="使用說明" last="first"/>
            <Row icon="eye" label="隱私權"/>
            <Row icon="user" label="登出"/>
          </div>
        </div>
        <div style={{ textAlign: 'center', fontSize: 11, color: t.ink30, padding: '8px 0', fontFamily: 'Inter, system-ui' }}>
          Cart Helper · v1.0.0
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  CH_Screens: { S1_Onboarding, S2_Home, S3_Scan, S4_Confirm, S5_Cart, S6_ReceiptScan, S7_Compare, S8_Discrep, S9_History, S10_Settings }
});
