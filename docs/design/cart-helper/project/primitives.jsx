// Shared primitives for Cart Helper screens
const T = window.CH_TOKENS;

// SF-style outline icons drawn inline, single stroke
function Icon({ name, size = 22, color = T.ink, strokeWidth = 1.7 }) {
  const s = size;
  const c = { fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    scan:    <g {...c}><path d="M4 8V6a2 2 0 0 1 2-2h2"/><path d="M20 8V6a2 2 0 0 0-2-2h-2"/><path d="M4 16v2a2 2 0 0 0 2 2h2"/><path d="M20 16v2a2 2 0 0 1-2 2h-2"/><path d="M4 12h16"/></g>,
    cart:    <g {...c}><path d="M3 4h2l2.4 11.2A2 2 0 0 0 9.36 17H18a2 2 0 0 0 1.95-1.57L21.5 8H6"/><circle cx="10" cy="20" r="1.2" fill={color}/><circle cx="17" cy="20" r="1.2" fill={color}/></g>,
    receipt: <g {...c}><path d="M6 3h12v18l-2-1.5L14 21l-2-1.5L10 21l-2-1.5L6 21V3Z"/><path d="M9 8h6M9 12h6M9 16h4"/></g>,
    history: <g {...c}><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v4h4"/><path d="M12 7v5l3 2"/></g>,
    gear:    <g {...c}><circle cx="12" cy="12" r="3"/><path d="M19.4 14a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V20a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.4 16l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8L4.2 6a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V2a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1A2 2 0 1 1 19.7 6l-.1.1a1.7 1.7 0 0 0-.3 1.8V8a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></g>,
    plus:    <g {...c}><path d="M12 5v14M5 12h14"/></g>,
    minus:   <g {...c}><path d="M5 12h14"/></g>,
    check:   <g {...c}><path d="M5 12.5l4.5 4.5L19 7.5"/></g>,
    x:       <g {...c}><path d="M6 6l12 12M18 6L6 18"/></g>,
    chev:    <g {...c}><path d="M9 6l6 6-6 6"/></g>,
    chevD:   <g {...c}><path d="M6 9l6 6 6-6"/></g>,
    chevL:   <g {...c}><path d="M15 6l-6 6 6 6"/></g>,
    bolt:    <g {...c}><path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z"/></g>,
    sparkle: <g {...c}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></g>,
    flash:   <g {...c}><path d="M13 2 4 14h7l-1 8 10-12h-7l0-8Z"/></g>,
    flashOff:<g {...c}><path d="M13 2 4 14h4M11 22l9-12h-4M3 3l18 18"/></g>,
    edit:    <g {...c}><path d="M4 20h4L20 8l-4-4L4 16v4Z"/><path d="M14 6l4 4"/></g>,
    trash:   <g {...c}><path d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/></g>,
    camera:  <g {...c}><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13" r="3.5"/></g>,
    grid:    <g {...c}><rect x="4" y="4" width="7" height="7" rx="1.4"/><rect x="13" y="4" width="7" height="7" rx="1.4"/><rect x="4" y="13" width="7" height="7" rx="1.4"/><rect x="13" y="13" width="7" height="7" rx="1.4"/></g>,
    bell:    <g {...c}><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5L6 16Z"/><path d="M10 21a2 2 0 0 0 4 0"/></g>,
    arrow:   <g {...c}><path d="M5 12h14M13 6l6 6-6 6"/></g>,
    tag:     <g {...c}><path d="M3 12V4h8l10 10-8 8-10-10Z"/><circle cx="8" cy="8" r="1.5" fill={color}/></g>,
    list:    <g {...c}><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="5" cy="6" r="1.2" fill={color}/><circle cx="5" cy="12" r="1.2" fill={color}/><circle cx="5" cy="18" r="1.2" fill={color}/></g>,
    calendar:<g {...c}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></g>,
    swap:    <g {...c}><path d="M7 4 3 8l4 4M3 8h12a4 4 0 0 1 0 8h-2"/><path d="M17 20l4-4-4-4"/></g>,
    info:    <g {...c}><circle cx="12" cy="12" r="9"/><path d="M12 8v.5M12 11v6"/></g>,
    user:    <g {...c}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></g>,
    lang:    <g {...c}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></g>,
    cloud:   <g {...c}><path d="M7 18h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6 11.5 4 4 0 0 0 7 18Z"/></g>,
    moon:    <g {...c}><path d="M20 14a8 8 0 0 1-10-10 8 8 0 1 0 10 10Z"/></g>,
    eye:     <g {...c}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></g>,
  };
  return <svg width={s} height={s} viewBox="0 0 24 24" style={{ display: 'block' }}>{paths[name]}</svg>;
}

// Pill chip
function Chip({ children, bg = T.peachWash, color = T.peachDeep, size = 12, weight = 600, pad = '4px 10px' }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: bg, color, fontSize: size, fontWeight: weight,
      padding: pad, borderRadius: T.radius.pill, lineHeight: 1,
      letterSpacing: 0.1,
    }}>{children}</span>
  );
}

// NT$ formatted
function NT({ n, weight = 600 }) {
  const v = Math.round(n);
  const s = v.toLocaleString('en-US');
  return (
    <span style={{ fontFamily: 'Inter, system-ui', fontFeatureSettings: '"tnum"', fontWeight: weight }}>
      <span style={{ fontSize: '0.72em', opacity: 0.6, marginRight: 1 }}>NT$</span>{s}
    </span>
  );
}

// Soft card surface
function Card({ children, style = {}, pad = 16, bg = T.card, radius = T.radius.lg }) {
  return (
    <div style={{
      background: bg, borderRadius: radius, padding: pad,
      boxShadow: '0 1px 0 rgba(36,31,26,0.04), 0 8px 24px -16px rgba(36,31,26,0.18)',
      ...style,
    }}>{children}</div>
  );
}

// Bottom nav (5 items)
function BottomNav({ active = 'home', onChange = () => {} }) {
  const items = [
    { id: 'home',    icon: 'cart',    label: '購物車' },
    { id: 'history', icon: 'history', label: '紀錄' },
    { id: 'scan',    icon: 'scan',    label: '掃描', center: true },
    { id: 'compare', icon: 'receipt', label: '比對' },
    { id: 'me',      icon: 'gear',    label: '設定' },
  ];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      paddingBottom: 28, paddingTop: 8,
      background: 'linear-gradient(to top, rgba(251,246,238,0.96) 60%, rgba(251,246,238,0))',
      backdropFilter: 'blur(8px)',
      zIndex: 30,
    }}>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
        margin: '0 14px', alignItems: 'end',
      }}>
        {items.map(it => {
          if (it.center) {
            const isActive = active === it.id;
            return (
              <button key={it.id} onClick={() => onChange(it.id)} style={{
                border: 'none', background: 'none', padding: 0, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                marginBottom: 2,
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 28,
                  background: isActive
                    ? `linear-gradient(160deg, ${T.peach}, ${T.peachDeep})`
                    : `linear-gradient(160deg, ${T.peach}, ${T.peachDeep})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 10px 22px -10px rgba(227,107,69,0.55), inset 0 1px 0 rgba(255,255,255,0.4)',
                  marginTop: -22,
                }}>
                  <Icon name="scan" size={26} color="#fff" strokeWidth={2}/>
                </div>
              </button>
            );
          }
          const isActive = active === it.id;
          return (
            <button key={it.id} onClick={() => onChange(it.id)} style={{
              border: 'none', background: 'none', cursor: 'pointer', padding: '6px 0',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              color: isActive ? T.peachDeep : T.ink50,
            }}>
              <Icon name={it.icon} size={22} color={isActive ? T.peachDeep : T.ink50} strokeWidth={isActive ? 2 : 1.6}/>
              <span style={{ fontSize: 10.5, fontWeight: isActive ? 700 : 500, letterSpacing: 0.3 }}>
                {it.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Header bar (custom, replaces IOSNavBar)
function Header({ title, subtitle, left, right, bg = 'transparent' }) {
  return (
    <div style={{
      paddingTop: 56, paddingLeft: 20, paddingRight: 20, paddingBottom: 12,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      gap: 12, background: bg,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        {left}
        <div style={{ minWidth: 0 }}>
          {subtitle && <div style={{ fontSize: 12, color: T.ink50, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>{subtitle}</div>}
          <div style={{
            fontSize: 26, fontWeight: 800, color: T.ink, letterSpacing: -0.5,
            fontFamily: '"Noto Sans TC", -apple-system, system-ui',
          }}>{title}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{right}</div>
    </div>
  );
}

// Round icon button
function RoundBtn({ icon, onClick, bg = T.card, color = T.ink, size = 38 }) {
  return (
    <button onClick={onClick} style={{
      width: size, height: size, borderRadius: size / 2, border: 'none',
      background: bg, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 1px 0 rgba(36,31,26,0.04), 0 6px 16px -10px rgba(36,31,26,0.2)',
    }}>
      <Icon name={icon} size={18} color={color} strokeWidth={1.8}/>
    </button>
  );
}

// Section title
function SectionTitle({ children, action }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      margin: '4px 4px 8px',
    }}>
      <div style={{
        fontSize: 13, fontWeight: 700, color: T.ink70,
        letterSpacing: 0.4, textTransform: 'uppercase',
      }}>{children}</div>
      {action}
    </div>
  );
}

// Frame wrapper — applies app background, hides scrollbar
function ScreenBase({ children, bg = T.bg }) {
  return (
    <div style={{
      width: '100%', minHeight: '100%', background: bg,
      fontFamily: '"Noto Sans TC", -apple-system, system-ui, sans-serif',
      color: T.ink, position: 'relative',
    }}>
      {children}
    </div>
  );
}

Object.assign(window, { CHIcon: Icon, CHChip: Chip, CHNT: NT, CHCard: Card, CHBottomNav: BottomNav, CHHeader: Header, CHRoundBtn: RoundBtn, CHSectionTitle: SectionTitle, CHScreenBase: ScreenBase });
