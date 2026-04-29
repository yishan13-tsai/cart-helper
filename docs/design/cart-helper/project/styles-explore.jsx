// Style explorations — 3 directions × 2 screens (Onboarding + Home)
const TS = window.CH_TOKENS;
const { CHIcon: SI, IOSDevice } = window;

// ════════════════════════════════════════════════════════════════
// STYLE A — Illustrative Crimson (reference-inspired)
// ════════════════════════════════════════════════════════════════
const A = {
  bg:      '#FFFFFF',
  page:    '#C73E5A',         // crimson
  pageDark:'#A02942',
  cream:   '#FBEFE5',
  ink:     '#1A1416',
  ink60:   '#7A6B72',
  ink30:   '#C9BEC4',
  card:    '#FFF9F4',
};

function CartIllus({ size = 200, color = A.page }) {
  // Flat 2-tone cartoon shopping bag/cart illustration
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      {/* drop shadow */}
      <ellipse cx="100" cy="180" rx="62" ry="6" fill="#000" opacity="0.08"/>
      {/* bag body */}
      <path d="M48 70 L60 175 Q60 178 64 178 L136 178 Q140 178 140 175 L152 70 Z" fill={color}/>
      {/* bag highlight */}
      <path d="M52 75 L62 160 Q63 163 67 162 L80 158 L70 75 Z" fill="#fff" opacity="0.18"/>
      {/* handles */}
      <path d="M70 70 Q70 30 100 30 Q130 30 130 70" fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"/>
      <path d="M70 70 Q70 30 100 30 Q130 30 130 70" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
      {/* fruits popping out */}
      <circle cx="86" cy="62" r="14" fill="#F7A23B"/>
      <path d="M86 50 Q88 44 92 46" stroke="#3B7A3F" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <circle cx="115" cy="58" r="11" fill="#7BC97A"/>
      <path d="M115 49 Q117 44 121 46" stroke="#3B7A3F" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      {/* receipt poking out */}
      <path d="M100 60 L108 64 L106 76 L98 74 Z" fill="#fff"/>
      <line x1="100" y1="66" x2="105" y2="68" stroke={A.ink30} strokeWidth="1"/>
      <line x1="100" y1="70" x2="104" y2="71" stroke={A.ink30} strokeWidth="1"/>
      {/* sparkles */}
      <g fill={color} opacity="0.5">
        <circle cx="40" cy="40" r="3"/>
        <circle cx="170" cy="50" r="2.5"/>
        <circle cx="35" cy="120" r="2"/>
        <circle cx="172" cy="130" r="3"/>
      </g>
      <g stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5">
        <line x1="30" y1="65" x2="30" y2="71"/>
        <line x1="27" y1="68" x2="33" y2="68"/>
        <line x1="175" y1="95" x2="175" y2="101"/>
        <line x1="172" y1="98" x2="178" y2="98"/>
      </g>
    </svg>
  );
}

function StyleA_Onboarding() {
  return (
    <div style={{
      width: '100%', height: '100%', background: A.bg,
      fontFamily: '"Noto Sans TC", -apple-system, system-ui',
      color: A.ink, position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* top status area */}
      <div style={{ height: 56 }}/>

      {/* Hero illustration card */}
      <div style={{
        margin: '12px 24px 0', flex: 1,
        background: A.cream, borderRadius: 28,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative dots */}
        <div style={{ position: 'absolute', top: 30, left: 30, width: 4, height: 4, borderRadius: 2, background: A.page }}/>
        <div style={{ position: 'absolute', top: 50, left: 24, width: 4, height: 4, borderRadius: 2, background: A.page, opacity: 0.5 }}/>
        <div style={{ position: 'absolute', top: 40, right: 30, width: 4, height: 4, borderRadius: 2, background: A.page }}/>
        <div style={{ position: 'absolute', bottom: 100, right: 24, width: 4, height: 4, borderRadius: 2, background: A.page, opacity: 0.5 }}/>
        <div style={{ position: 'absolute', bottom: 80, left: 28, width: 4, height: 4, borderRadius: 2, background: A.page }}/>

        <CartIllus size={200} color={A.page}/>

        <div style={{ marginTop: 36, textAlign: 'center' }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 4,
            color: A.page, marginBottom: 14,
          }}>CART HELPER</div>
          <div style={{
            fontSize: 26, fontWeight: 700, lineHeight: 1.35,
            color: A.ink, letterSpacing: -0.3,
          }}>
            掃一下標籤<br/>
            收據不踩雷
          </div>
        </div>

        {/* Page dots */}
        <div style={{ display: 'flex', gap: 6, marginTop: 32 }}>
          <div style={{ width: 16, height: 4, borderRadius: 2, background: A.page }}/>
          <div style={{ width: 4, height: 4, borderRadius: 2, background: A.page, opacity: 0.3 }}/>
          <div style={{ width: 4, height: 4, borderRadius: 2, background: A.page, opacity: 0.3 }}/>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '20px 24px 30px' }}>
        <button style={{
          width: '100%', height: 56, borderRadius: 28, border: 'none', cursor: 'pointer',
          background: A.page, color: '#fff', fontSize: 16, fontWeight: 700,
          fontFamily: '"Noto Sans TC", system-ui',
          boxShadow: `0 14px 24px -12px ${A.page}`,
        }}>開始</button>
      </div>
    </div>
  );
}

function StyleA_Home() {
  const items = [
    { name: '統一鮮乳',  qty: 2, price: 178, color: '#EAF1FB', emoji: '🥛' },
    { name: '愛文芒果',  qty: 1, price: 159, color: '#FFEBD8', emoji: '🥭' },
    { name: '舒潔衛生紙', qty: 1, price: 249, color: A.cream,  emoji: '🧻' },
  ];
  return (
    <div style={{
      width: '100%', height: '100%', background: A.bg,
      fontFamily: '"Noto Sans TC", -apple-system, system-ui',
      color: A.ink, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ paddingTop: 56, padding: '56px 24px 0' }}>
        {/* Top */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button style={{ width: 36, height: 36, borderRadius: 12, border: `1.5px solid ${A.ink}22`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SI name="chevL" size={18} color={A.ink}/>
          </button>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, color: A.ink60 }}>CART HELPER</div>
          <button style={{ width: 36, height: 36, borderRadius: 18, background: A.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
            <SI name="user" size={16} color={A.page}/>
          </button>
        </div>

        {/* Hero */}
        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.2, letterSpacing: -0.5 }}>
            本次購物<br/>合計 <span style={{ color: A.page }}>$1,112</span>
          </div>
          <div style={{ fontSize: 13, color: A.ink60, marginTop: 8 }}>家樂福 內湖店 · 9 件商品</div>
        </div>

        {/* Quick scan card */}
        <div style={{
          marginTop: 24, background: A.cream, borderRadius: 24, padding: 18,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 28, background: A.page,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 10px 18px -8px ${A.page}80`,
          }}>
            <SI name="scan" size={26} color="#fff" strokeWidth={2}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>掃描下一個商品</div>
            <div style={{ fontSize: 12, color: A.ink60, marginTop: 2 }}>對準價格標即可</div>
          </div>
          <SI name="arrow" size={20} color={A.ink}/>
        </div>

        {/* Items */}
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>購物明細</span>
            <span style={{ fontSize: 12, color: A.page, fontWeight: 700 }}>查看全部 →</span>
          </div>

          {items.map((it, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 4px', borderTop: i === 0 ? 'none' : `1px solid ${A.ink}10`,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 16, background: it.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
              }}>{it.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{it.name}</div>
                <div style={{ fontSize: 11, color: A.ink60 }}>×{it.qty}</div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Inter, system-ui' }}>${it.price}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating CTA */}
      <div style={{
        position: 'absolute', bottom: 28, left: 24, right: 24,
      }}>
        <button style={{
          width: '100%', height: 56, borderRadius: 28, border: 'none', cursor: 'pointer',
          background: A.page, color: '#fff', fontSize: 15, fontWeight: 700,
          fontFamily: '"Noto Sans TC", system-ui',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 8px 0 24px',
          boxShadow: `0 14px 28px -12px ${A.page}`,
        }}>
          <span>結帳後掃發票比對</span>
          <span style={{
            width: 40, height: 40, borderRadius: 20, background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <SI name="receipt" size={18} color={A.page}/>
          </span>
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// STYLE B — Editorial Mono (newspaper / serif numerics)
// ════════════════════════════════════════════════════════════════
const B = {
  bg:    '#F5F1E8',
  paper: '#FBF7EE',
  ink:   '#0E0E0E',
  ink60: '#4A4742',
  ink30: '#A8A095',
  rule:  '#0E0E0E',
  accent:'#D4451F',
};

function StyleB_Onboarding() {
  return (
    <div style={{
      width: '100%', height: '100%', background: B.bg,
      fontFamily: '"Noto Sans TC", -apple-system, system-ui',
      color: B.ink, position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Masthead */}
      <div style={{
        paddingTop: 60, padding: '60px 22px 14px',
        borderBottom: `2px solid ${B.rule}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      }}>
        <div style={{
          fontFamily: '"Times New Roman", Georgia, serif',
          fontSize: 22, fontWeight: 700, letterSpacing: -0.3, fontStyle: 'italic',
        }}>The Cart Helper</div>
        <div style={{ fontSize: 9, fontFamily: 'Inter, system-ui', color: B.ink60, fontWeight: 600, letterSpacing: 0.5 }}>
          VOL.01 · 2026
        </div>
      </div>
      <div style={{ height: 4, borderBottom: `1px solid ${B.rule}`, margin: '2px 22px 0' }}/>

      {/* Headline */}
      <div style={{ padding: '24px 22px 16px' }}>
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: 3,
          color: B.accent, marginBottom: 12,
        }}>— 入門指南 INTRO —</div>
        <div style={{
          fontFamily: '"Times New Roman", Georgia, serif',
          fontSize: 38, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1,
          color: B.ink,
        }}>
          掃一下，<br/>
          <span style={{ fontStyle: 'italic', color: B.accent }}>看穿</span>整張<br/>發票。
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${B.rule}`, margin: '0 22px' }}/>

      {/* Hero number block */}
      <div style={{ padding: '22px 22px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          background: B.paper,
          padding: '24px 18px',
          border: `1px solid ${B.ink}`,
          position: 'relative',
        }}>
          {/* corner numerics */}
          <div style={{ position: 'absolute', top: 8, left: 12, fontSize: 10, fontFamily: 'Inter, system-ui', fontWeight: 700, color: B.accent }}>NO. 01</div>
          <div style={{ position: 'absolute', top: 8, right: 12, fontSize: 10, fontFamily: 'Inter, system-ui', fontWeight: 700, color: B.ink60 }}>FIG.</div>

          <div style={{
            textAlign: 'center', padding: '16px 0',
            fontFamily: '"Times New Roman", Georgia, serif',
            fontSize: 110, fontWeight: 400, lineHeight: 1, color: B.ink, fontStyle: 'italic',
          }}>$0</div>
          <div style={{ textAlign: 'center', fontSize: 11, color: B.ink60, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
            錯失的價差，從今天起
          </div>
        </div>

        {/* Three column features */}
        <div style={{
          marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12,
          paddingBottom: 16,
        }}>
          {[
            { n: '01', t: '掃描',  d: '對準價格標一拍即得' },
            { n: '02', t: '記錄',  d: '自動寫入購物車' },
            { n: '03', t: '比對',  d: '結帳後掃發票核對' },
          ].map((x, i) => (
            <div key={i}>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
                color: B.accent, fontFamily: 'Inter, system-ui',
              }}>{x.n}</div>
              <div style={{
                fontFamily: '"Times New Roman", Georgia, serif',
                fontSize: 18, fontWeight: 700, marginTop: 4,
              }}>{x.t}</div>
              <div style={{ fontSize: 10, color: B.ink60, marginTop: 4, lineHeight: 1.45 }}>
                {x.d}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer rule + CTA */}
      <div style={{ borderTop: `2px solid ${B.rule}`, padding: '18px 22px 30px' }}>
        <button style={{
          width: '100%', height: 52, border: `1.5px solid ${B.ink}`, cursor: 'pointer',
          background: B.ink, color: B.bg, fontSize: 14, fontWeight: 700,
          fontFamily: '"Noto Sans TC", system-ui', letterSpacing: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px',
        }}>
          <span>BEGIN  /  開始閱讀</span>
          <SI name="arrow" size={18} color={B.bg}/>
        </button>
      </div>
    </div>
  );
}

function StyleB_Home() {
  const items = [
    { idx: '01', name: '統一鮮乳 936ml',  qty: 2, price: 178 },
    { idx: '02', name: '台灣土雞蛋',       qty: 1, price: 95 },
    { idx: '03', name: '玉井愛文芒果',     qty: 1, price: 159 },
    { idx: '04', name: '可口可樂 2L',       qty: 3, price: 195 },
    { idx: '05', name: '舒潔抽取式衛生紙', qty: 1, price: 249 },
  ];
  return (
    <div style={{
      width: '100%', height: '100%', background: B.bg,
      fontFamily: '"Noto Sans TC", -apple-system, system-ui',
      color: B.ink, position: 'relative', overflow: 'hidden',
    }}>
      {/* Masthead */}
      <div style={{
        paddingTop: 60, padding: '60px 22px 12px',
        borderBottom: `2px solid ${B.rule}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      }}>
        <div style={{ fontSize: 9, fontFamily: 'Inter, system-ui', fontWeight: 700, color: B.ink60, letterSpacing: 1.5 }}>
          04.28.2026 · MON
        </div>
        <div style={{
          fontFamily: '"Times New Roman", Georgia, serif',
          fontSize: 18, fontWeight: 700, fontStyle: 'italic',
        }}>The Cart Helper</div>
        <div style={{ fontSize: 9, fontFamily: 'Inter, system-ui', fontWeight: 700, color: B.ink60, letterSpacing: 1 }}>
          內湖店
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${B.rule}`, margin: '2px 22px 0' }}/>

      {/* Big number hero */}
      <div style={{ padding: '20px 22px 14px', textAlign: 'center', position: 'relative' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, color: B.accent, marginBottom: 4 }}>
          — TODAY'S BASKET —
        </div>
        <div style={{
          fontFamily: '"Times New Roman", Georgia, serif',
          fontSize: 86, fontWeight: 400, lineHeight: 1, fontStyle: 'italic',
          letterSpacing: -2, color: B.ink,
        }}>
          $1,112
        </div>
        <div style={{ fontSize: 11, color: B.ink60, marginTop: 6, fontWeight: 600, letterSpacing: 0.5 }}>
          九件商品  ·  預算剩餘 $388
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${B.rule}`, borderBottom: `1px solid ${B.rule}`, margin: '0 22px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', alignItems: 'center', padding: '10px 0' }}>
          <button style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            color: B.ink, fontSize: 13, fontWeight: 700, fontFamily: '"Noto Sans TC"',
          }}>
            <SI name="scan" size={16} color={B.ink}/>掃描標籤
          </button>
          <div style={{ width: 1, height: 22, background: B.rule }}/>
          <button style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            color: B.ink, fontSize: 13, fontWeight: 700, fontFamily: '"Noto Sans TC"',
          }}>
            <SI name="receipt" size={16} color={B.ink}/>掃發票
          </button>
        </div>
      </div>

      {/* Article-style list */}
      <div style={{ padding: '14px 22px 0' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          marginBottom: 8,
        }}>
          <div style={{
            fontFamily: '"Times New Roman", Georgia, serif',
            fontSize: 18, fontWeight: 700, fontStyle: 'italic',
          }}>明細  /  Manifest</div>
          <div style={{ fontSize: 10, color: B.ink60, fontFamily: 'Inter, system-ui', fontWeight: 600 }}>
            P. 01
          </div>
        </div>

        {items.map((it, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '24px 1fr auto auto',
            alignItems: 'baseline', gap: 12,
            padding: '10px 0',
            borderTop: `1px dotted ${B.ink}40`,
          }}>
            <span style={{ fontSize: 10, color: B.accent, fontWeight: 700, fontFamily: 'Inter, system-ui' }}>
              {it.idx}
            </span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{it.name}</span>
            <span style={{ fontSize: 11, color: B.ink60, fontFamily: 'Inter, system-ui' }}>×{it.qty}</span>
            <span style={{
              fontFamily: '"Times New Roman", Georgia, serif',
              fontSize: 18, fontWeight: 700, fontStyle: 'italic', minWidth: 60, textAlign: 'right',
            }}>${it.price}</span>
          </div>
        ))}
      </div>

      <div style={{
        position: 'absolute', bottom: 28, left: 22, right: 22,
        borderTop: `2px solid ${B.rule}`, paddingTop: 14,
      }}>
        <button style={{
          width: '100%', height: 50, border: `1.5px solid ${B.ink}`, cursor: 'pointer',
          background: B.accent, color: '#fff', fontSize: 13, fontWeight: 700,
          fontFamily: '"Noto Sans TC", system-ui', letterSpacing: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px',
        }}>
          <span>CONTINUE  /  繼續</span>
          <SI name="arrow" size={18} color="#fff"/>
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// STYLE C — Glass Dark (deep night, frosted glass, neon)
// ════════════════════════════════════════════════════════════════
const G = {
  bg:      '#0A0F1F',
  bgDeep:  '#050813',
  card:    'rgba(255,255,255,0.06)',
  cardHi:  'rgba(255,255,255,0.10)',
  border:  'rgba(255,255,255,0.10)',
  ink:     '#F2F4F8',
  ink70:   'rgba(242,244,248,0.7)',
  ink40:   'rgba(242,244,248,0.4)',
  neon:    '#7CFFB2',
  neonDim: '#2EE89B',
  violet:  '#A06BFF',
  cyan:    '#5BC0FF',
};

function StyleC_Onboarding() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: `
        radial-gradient(ellipse 600px 400px at 30% 10%, ${G.violet}30, transparent 60%),
        radial-gradient(ellipse 500px 500px at 80% 70%, ${G.neon}25, transparent 60%),
        ${G.bg}
      `,
      fontFamily: '"Noto Sans TC", -apple-system, system-ui',
      color: G.ink, position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* grid texture */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
        `,
        backgroundSize: '36px 36px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)',
      }}/>

      <div style={{ height: 56 }}/>

      {/* Logo bar */}
      <div style={{
        margin: '0 22px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 14px',
        background: G.card, borderRadius: 18,
        border: `1px solid ${G.border}`,
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 7,
            background: `linear-gradient(135deg, ${G.neon}, ${G.cyan})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <SI name="cart" size={14} color={G.bg} strokeWidth={2.4}/>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>CART/HELPER</span>
        </div>
        <div style={{
          fontSize: 9, fontFamily: 'Inter, monospace', color: G.neon, fontWeight: 700,
          padding: '4px 8px', borderRadius: 999, border: `1px solid ${G.neon}40`,
        }}>v1.0 · BETA</div>
      </div>

      {/* Hero */}
      <div style={{ padding: '36px 22px 24px', position: 'relative' }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: 4,
          color: G.neon, marginBottom: 16,
          fontFamily: 'Inter, monospace',
        }}>{`> WELCOME_BACK`}</div>
        <div style={{
          fontSize: 38, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1.2,
        }}>
          掃一下標籤，<br/>
          <span style={{
            background: `linear-gradient(90deg, ${G.neon}, ${G.cyan}, ${G.violet})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>逛一圈不踩雷</span>
        </div>
        <div style={{ fontSize: 13, color: G.ink70, marginTop: 14, lineHeight: 1.55 }}>
          結帳後再掃一次發票，立刻知道有沒有刷錯價、漏結或多結。
        </div>
      </div>

      {/* Glass feature stack */}
      <div style={{ padding: '0 22px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10, position: 'relative' }}>
        {[
          { i: 'tag',     l: '掃描',     d: 'OCR 辨識價格標', c: G.neon },
          { i: 'cart',    l: '記錄',     d: '即時更新購物車', c: G.cyan },
          { i: 'receipt', l: '比對',     d: '結帳後一鍵核對', c: G.violet },
        ].map((f, i) => (
          <div key={i} style={{
            background: G.card, borderRadius: 20,
            border: `1px solid ${G.border}`,
            backdropFilter: 'blur(20px)',
            padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 14,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, width: 1, height: '100%',
              background: `linear-gradient(180deg, transparent, ${f.c}, transparent)`,
            }}/>
            <div style={{
              width: 42, height: 42, borderRadius: 14,
              background: `${f.c}18`, border: `1px solid ${f.c}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <SI name={f.i} size={20} color={f.c} strokeWidth={2}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{f.l}</div>
              <div style={{ fontSize: 11, color: G.ink40, marginTop: 1 }}>{f.d}</div>
            </div>
            <div style={{ fontSize: 10, color: f.c, fontFamily: 'Inter, monospace', fontWeight: 700 }}>
              0{i+1}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ padding: '20px 22px 30px' }}>
        <button style={{
          width: '100%', height: 56, borderRadius: 28, border: 'none', cursor: 'pointer',
          background: `linear-gradient(135deg, ${G.neon} 0%, ${G.cyan} 100%)`,
          color: G.bg, fontSize: 15, fontWeight: 800, letterSpacing: 0.3,
          fontFamily: '"Noto Sans TC", system-ui',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: `0 14px 40px -10px ${G.neon}60, inset 0 1px 0 rgba(255,255,255,0.4)`,
        }}>
          開始第一次購物
          <SI name="arrow" size={18} color={G.bg} strokeWidth={2.4}/>
        </button>
      </div>
    </div>
  );
}

function StyleC_Home() {
  const items = [
    { name: '統一鮮乳 936ml', qty: 2, price: 178, dot: G.cyan },
    { name: '愛文芒果 1袋',   qty: 1, price: 159, dot: G.neon },
    { name: '可口可樂 2L',     qty: 3, price: 195, dot: G.violet },
    { name: '舒潔衛生紙',      qty: 1, price: 249, dot: G.cyan },
  ];
  return (
    <div style={{
      width: '100%', height: '100%',
      background: `
        radial-gradient(ellipse 700px 500px at 80% 0%, ${G.violet}30, transparent 60%),
        radial-gradient(ellipse 600px 400px at 0% 60%, ${G.cyan}20, transparent 60%),
        ${G.bg}
      `,
      fontFamily: '"Noto Sans TC", -apple-system, system-ui',
      color: G.ink, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
        `,
        backgroundSize: '36px 36px',
      }}/>

      {/* Header */}
      <div style={{ padding: '60px 20px 0', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, color: G.neon, fontFamily: 'Inter, monospace', fontWeight: 700, letterSpacing: 2 }}>
              ◉ ACTIVE · 內湖店
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.4, marginTop: 4 }}>
              本次購物
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{
              width: 38, height: 38, borderRadius: 14,
              background: G.card, border: `1px solid ${G.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(16px)',
            }}>
              <SI name="bell" size={16} color={G.ink}/>
            </button>
            <button style={{
              width: 38, height: 38, borderRadius: 14,
              background: G.card, border: `1px solid ${G.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(16px)',
            }}>
              <SI name="user" size={16} color={G.ink}/>
            </button>
          </div>
        </div>
      </div>

      {/* Glass hero card */}
      <div style={{ padding: '20px 16px 0', position: 'relative' }}>
        <div style={{
          background: G.card, borderRadius: 24,
          border: `1px solid ${G.border}`,
          backdropFilter: 'blur(24px)',
          padding: 20, position: 'relative', overflow: 'hidden',
        }}>
          {/* glow */}
          <div style={{
            position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%',
            background: `radial-gradient(circle, ${G.neon}40, transparent 70%)`,
          }}/>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
            <div>
              <div style={{ fontSize: 11, color: G.ink40, fontFamily: 'Inter, monospace', fontWeight: 600 }}>
                CURRENT_TOTAL
              </div>
              <div style={{
                fontSize: 42, fontWeight: 800, letterSpacing: -1.5, marginTop: 4,
                fontFamily: 'Inter, system-ui', fontFeatureSettings: '"tnum"',
                background: `linear-gradient(135deg, #fff 0%, ${G.neon} 100%)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                $1,112
              </div>
            </div>
            <div style={{
              padding: '5px 10px', borderRadius: 999,
              background: `${G.neon}18`, border: `1px solid ${G.neon}40`,
              fontSize: 10, fontWeight: 700, color: G.neon,
              fontFamily: 'Inter, monospace',
            }}>9 ITEMS</div>
          </div>

          {/* progress */}
          <div style={{ marginTop: 16, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: G.ink40, marginBottom: 5, fontFamily: 'Inter, monospace' }}>
              <span>BUDGET / $1,500</span><span>74%</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: '74%',
                background: `linear-gradient(90deg, ${G.cyan}, ${G.neon})`,
                boxShadow: `0 0 12px ${G.neon}80`,
              }}/>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ padding: '14px 16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, position: 'relative' }}>
        {[
          { i: 'tag',     l: '掃標籤',  c: G.neon },
          { i: 'receipt', l: '掃發票',  c: G.violet },
        ].map((q, i) => (
          <div key={i} style={{
            background: G.card, borderRadius: 18,
            border: `1px solid ${G.border}`, backdropFilter: 'blur(20px)',
            padding: 14, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 12,
              background: `${q.c}20`, border: `1px solid ${q.c}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <SI name={q.i} size={18} color={q.c}/>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{q.l}</span>
          </div>
        ))}
      </div>

      {/* Items */}
      <div style={{ padding: '20px 16px 0', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: G.ink40, fontFamily: 'Inter, monospace' }}>
            ITEMS  /  09
          </span>
          <span style={{ fontSize: 11, color: G.neon, fontFamily: 'Inter, monospace', fontWeight: 700 }}>
            VIEW_ALL →
          </span>
        </div>

        <div style={{
          background: G.card, borderRadius: 20,
          border: `1px solid ${G.border}`, backdropFilter: 'blur(20px)',
          overflow: 'hidden',
        }}>
          {items.map((it, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
              borderTop: i === 0 ? 'none' : `1px solid ${G.border}`,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: 4, background: it.dot,
                boxShadow: `0 0 8px ${it.dot}`,
              }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {it.name}
                </div>
                <div style={{ fontSize: 10, color: G.ink40, fontFamily: 'Inter, monospace', marginTop: 2 }}>
                  ×{it.qty}
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Inter, system-ui' }}>
                ${it.price}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{
        position: 'absolute', bottom: 26, left: 16, right: 16,
      }}>
        <button style={{
          width: '100%', height: 54, borderRadius: 27, border: 'none', cursor: 'pointer',
          background: `linear-gradient(135deg, ${G.neon}, ${G.cyan})`,
          color: G.bg, fontSize: 14, fontWeight: 800,
          fontFamily: '"Noto Sans TC", system-ui',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: `0 14px 32px -10px ${G.neon}70, inset 0 1px 0 rgba(255,255,255,0.4)`,
        }}>
          結帳後掃發票比對
          <SI name="arrow" size={18} color={G.bg} strokeWidth={2.4}/>
        </button>
      </div>
    </div>
  );
}

Object.assign(window, {
  StyleA_Onboarding, StyleA_Home,
  StyleB_Onboarding, StyleB_Home,
  StyleC_Onboarding, StyleC_Home,
});
