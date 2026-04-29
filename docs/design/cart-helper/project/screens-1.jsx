// Screens 1–5: Onboarding, Home, Scan, Scan Confirm, Cart Edit
const T2 = window.CH_TOKENS;
const { CHIcon: I2, CHChip: C2, CHNT: NT2, CHCard: K2, CHBottomNav: BN2, CHHeader: H2, CHRoundBtn: RB2, CHSectionTitle: ST2, CHScreenBase: SB2 } = window;

// Sample data shared across screens
window.CH_DATA = {
  cart: [
    { id: 'i1', name: '統一鮮乳 936ml', sub: '冷藏 · 乳製品', price: 89, qty: 2, emoji: '🥛', color: '#EAF1FB' },
    { id: 'i2', name: '台灣土雞蛋 10入', sub: '蛋豆製品', price: 95, qty: 1, emoji: '🥚', color: '#FCEFD8' },
    { id: 'i3', name: '玉井愛文芒果 1袋', sub: '生鮮蔬果', price: 159, qty: 1, emoji: '🥭', color: '#FFEBD8' },
    { id: 'i4', name: '可口可樂 2L', sub: '飲料 · 含糖', price: 65, qty: 3, emoji: '🥤', color: '#F8DEDE' },
    { id: 'i5', name: '舒潔抽取式衛生紙', sub: '日用品 · 12包入', price: 249, qty: 1, emoji: '🧻', color: '#F1ECE3' },
    { id: 'i6', name: '義美厚奶茶 950ml', sub: '飲料 · 冷藏', price: 55, qty: 2, emoji: '🍵', color: '#E8E2D0' },
  ],
};

// ───────────────────── 1. Onboarding ─────────────────────
function ScreenOnboarding() {
  return (
    <SB2>
      {/* Backdrop blobs */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        <div style={{ position: 'absolute', top: -80, right: -60, width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, ' + T2.peachSoft + ' 0%, transparent 70%)' }}/>
        <div style={{ position: 'absolute', top: 180, left: -100, width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, ' + T2.lavWash + ' 0%, transparent 70%)' }}/>
        <div style={{ position: 'absolute', bottom: 200, right: -80, width: 260, height: 260, borderRadius: '50%',
          background: 'radial-gradient(circle, ' + T2.mintWash + ' 0%, transparent 70%)' }}/>
      </div>

      <div style={{ position: 'relative', padding: '80px 24px 40px', display: 'flex', flexDirection: 'column', minHeight: 874, gap: 24 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            background: `linear-gradient(140deg, ${T2.peach}, ${T2.peachDeep})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 20px -10px rgba(227,107,69,0.5)',
          }}>
            <I2 name="cart" size={20} color="#fff" strokeWidth={2.2}/>
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: -0.3 }}>購物小幫手</span>
        </div>

        {/* Hero illustration — abstract receipt + cart */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: 320 }}>
          <div style={{
            width: 240, height: 300, background: T2.card, borderRadius: 28,
            boxShadow: '0 30px 60px -30px rgba(36,31,26,0.25)',
            transform: 'rotate(-6deg)', position: 'absolute', left: 30,
            padding: 20, display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ width: 70, height: 8, borderRadius: 4, background: T2.ink10 }}/>
              <div style={{ width: 30, height: 8, borderRadius: 4, background: T2.peachSoft }}/>
            </div>
            {[80, 65, 90, 55, 70].map((w, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginTop: i === 0 ? 8 : 0 }}>
                <div style={{ width: w + 30, height: 6, borderRadius: 3, background: T2.ink10 }}/>
                <div style={{ width: 24, height: 6, borderRadius: 3, background: T2.ink10 }}/>
              </div>
            ))}
            <div style={{ borderTop: `1px dashed ${T2.ink30}`, margin: '8px 0' }}/>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ width: 50, height: 10, borderRadius: 4, background: T2.ink70 }}/>
              <div style={{ width: 60, height: 10, borderRadius: 4, background: T2.peachDeep }}/>
            </div>
          </div>
          <div style={{
            width: 220, height: 220, background: `linear-gradient(150deg, ${T2.peach}, ${T2.peachDeep})`,
            borderRadius: 32, transform: 'rotate(8deg)', position: 'absolute', right: 18, top: 60,
            boxShadow: '0 30px 60px -25px rgba(227,107,69,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <I2 name="scan" size={92} color="#fff" strokeWidth={1.4}/>
          </div>
        </div>

        {/* Copy */}
        <div>
          <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.18, letterSpacing: -0.8, color: T2.ink }}>
            掃一下標籤，<br/>逛一圈不踩雷。
          </div>
          <div style={{ fontSize: 15, color: T2.ink70, marginTop: 12, lineHeight: 1.55 }}>
            邊逛邊掃商品價格標，自動加入購物車。<br/>結帳後再掃一次發票，立刻知道有沒有刷錯價、漏結或多結。
          </div>
        </div>

        {/* Page dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
          <div style={{ width: 22, height: 6, borderRadius: 3, background: T2.peachDeep }}/>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: T2.ink30 }}/>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: T2.ink30 }}/>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button style={{
            height: 54, borderRadius: 27, border: 'none', cursor: 'pointer',
            background: `linear-gradient(160deg, ${T2.peach}, ${T2.peachDeep})`,
            color: '#fff', fontSize: 16, fontWeight: 700, letterSpacing: 0.2,
            fontFamily: '"Noto Sans TC", system-ui',
            boxShadow: '0 14px 28px -14px rgba(227,107,69,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            開始我的第一次購物 <I2 name="arrow" size={18} color="#fff" strokeWidth={2.2}/>
          </button>
          <button style={{
            height: 48, borderRadius: 24, border: 'none', cursor: 'pointer',
            background: 'transparent', color: T2.ink70, fontSize: 14, fontWeight: 600,
            fontFamily: '"Noto Sans TC", system-ui',
          }}>
            已經有帳號？登入
          </button>
        </div>
      </div>
    </SB2>
  );
}

// ───────────────────── 2. Home / Cart Overview ─────────────────────
function ScreenHome() {
  const data = window.CH_DATA.cart;
  const subtotal = data.reduce((s, it) => s + it.price * it.qty, 0);
  const itemCount = data.reduce((s, it) => s + it.qty, 0);
  const budget = 1500;

  return (
    <SB2>
      <H2
        subtitle="家樂福 · 內湖店"
        title="本次購物"
        right={<>
          <RB2 icon="bell"/>
          <RB2 icon="user"/>
        </>}
      />

      {/* Hero budget card */}
      <div style={{ padding: '4px 16px 0' }}>
        <div style={{
          background: `linear-gradient(145deg, ${T2.peach} 0%, ${T2.peachDeep} 100%)`,
          borderRadius: T2.radius.xl, padding: '20px 22px',
          color: '#fff', position: 'relative', overflow: 'hidden',
          boxShadow: '0 18px 40px -22px rgba(227,107,69,0.7)',
        }}>
          <div style={{ position: 'absolute', right: -40, top: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }}/>
          <div style={{ position: 'absolute', right: 30, bottom: -50, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }}/>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.85, letterSpacing: 0.3 }}>目前小計</div>
              <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: -1, marginTop: 2, fontFamily: 'Inter, system-ui', fontFeatureSettings: '"tnum"' }}>
                <span style={{ fontSize: 20, opacity: 0.85, marginRight: 4 }}>NT$</span>
                {subtotal.toLocaleString()}
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.22)', borderRadius: 14, padding: '6px 12px',
              fontSize: 12, fontWeight: 700, letterSpacing: 0.3, backdropFilter: 'blur(4px)',
            }}>{itemCount} 件商品</div>
          </div>

          <div style={{ marginTop: 16, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, opacity: 0.85, marginBottom: 4 }}>
              <span>預算 NT$ {budget.toLocaleString()}</span>
              <span>剩餘 NT$ {(budget - subtotal).toLocaleString()}</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.25)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, subtotal/budget*100)}%`, background: '#fff', borderRadius: 3 }}/>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '14px 16px 4px' }}>
        <K2 pad={14} bg={T2.cardSoft} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: T2.peachWash, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <I2 name="tag" size={20} color={T2.peachDeep}/>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>掃描標籤</div>
            <div style={{ fontSize: 11, color: T2.ink50 }}>價格 · 商品名</div>
          </div>
        </K2>
        <K2 pad={14} bg={T2.cardSoft} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: T2.lavWash, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <I2 name="receipt" size={20} color={T2.lav}/>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>掃描發票</div>
            <div style={{ fontSize: 11, color: T2.ink50 }}>結帳後比對</div>
          </div>
        </K2>
      </div>

      {/* Cart list */}
      <div style={{ padding: '12px 16px 0' }}>
        <ST2 action={<span style={{ fontSize: 12, color: T2.peachDeep, fontWeight: 700 }}>編輯</span>}>
          購物車明細
        </ST2>

        <K2 pad={0} style={{ overflow: 'hidden' }}>
          {data.slice(0, 4).map((it, i) => (
            <div key={it.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
              borderTop: i === 0 ? 'none' : `1px solid ${T2.hairline}`,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14, background: it.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                flexShrink: 0,
              }}>{it.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T2.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {it.name}
                </div>
                <div style={{ fontSize: 11, color: T2.ink50, marginTop: 2, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span>{it.sub}</span>
                  <span style={{ width: 2, height: 2, borderRadius: 1, background: T2.ink30 }}/>
                  <span>×{it.qty}</span>
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>
                <NT2 n={it.price * it.qty}/>
              </div>
            </div>
          ))}
          <div style={{
            padding: '10px 14px', borderTop: `1px solid ${T2.hairline}`,
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6,
            color: T2.peachDeep, fontSize: 13, fontWeight: 700,
          }}>
            還有 {data.length - 4} 項　<I2 name="chev" size={14} color={T2.peachDeep}/>
          </div>
        </K2>
      </div>

      <div style={{ height: 130 }}/>
      <BN2 active="home"/>
    </SB2>
  );
}

// ───────────────────── 3. Scan viewfinder ─────────────────────
function ScreenScan() {
  return (
    <div style={{
      width: '100%', minHeight: '100%', background: '#0F0B07', position: 'relative',
      fontFamily: '"Noto Sans TC", -apple-system, system-ui',
      color: '#fff', overflow: 'hidden',
    }}>
      {/* Camera "feed" — diagonal stripes & a faux price tag */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse at 30% 20%, rgba(255,180,140,0.18), transparent 50%),
          radial-gradient(ellipse at 70% 80%, rgba(120,90,60,0.25), transparent 50%),
          repeating-linear-gradient(115deg, #1a1410 0 8px, #1f1813 8px 16px)
        `,
      }}/>

      {/* Faux shelf scene with a price tag */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 280, transform: 'rotate(-3deg)', position: 'relative',
        }}>
          {/* Product card behind */}
          <div style={{
            position: 'absolute', top: -120, left: -20, width: 200, height: 140,
            background: '#D9C8AA', borderRadius: 8, opacity: 0.55,
            boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
          }}/>
          {/* Price tag */}
          <div style={{
            background: '#FFFCF5', borderRadius: 6, padding: '14px 16px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            color: '#1a1410',
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#7a6a52', letterSpacing: 0.5 }}>家樂福 內湖店</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4, fontFamily: '"Noto Sans TC"' }}>義美厚奶茶</div>
            <div style={{ fontSize: 11, color: '#9b8a72' }}>950ml · 冷藏</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#E36B45', fontFamily: 'Inter, system-ui' }}>$55</span>
              <span style={{ fontSize: 11, color: '#9b8a72', textDecoration: 'line-through' }}>$65</span>
            </div>
            <div style={{ fontSize: 9, color: '#9b8a72', marginTop: 4, fontFamily: 'Inter, monospace' }}>4710085 120013</div>
          </div>
        </div>
      </div>

      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, padding: '60px 18px 14px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)',
        zIndex: 10,
      }}>
        <button style={{
          width: 38, height: 38, borderRadius: 19, border: 'none', cursor: 'pointer',
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <I2 name="x" size={20} color="#fff" strokeWidth={2}/>
        </button>
        <div style={{
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)',
          padding: '7px 14px', borderRadius: 18, fontSize: 12, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: T2.peach, boxShadow: `0 0 8px ${T2.peach}` }}/>
          掃描中 · 請對準價格標
        </div>
        <button style={{
          width: 38, height: 38, borderRadius: 19, border: 'none', cursor: 'pointer',
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <I2 name="flash" size={20} color="#fff" strokeWidth={1.8}/>
        </button>
      </div>

      {/* Scan frame */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 290, height: 200,
        borderRadius: 24, zIndex: 5,
      }}>
        {/* Corners */}
        {[
          { top: 0, left: 0, br: '24px 0 0 0', borders: 'top left' },
          { top: 0, right: 0, br: '0 24px 0 0', borders: 'top right' },
          { bottom: 0, left: 0, br: '0 0 0 24px', borders: 'bottom left' },
          { bottom: 0, right: 0, br: '0 0 24px 0', borders: 'bottom right' },
        ].map((p, i) => {
          const sides = p.borders.split(' ');
          const style = {
            position: 'absolute', width: 36, height: 36,
            borderTop: sides.includes('top') ? `3px solid ${T2.peach}` : 'none',
            borderBottom: sides.includes('bottom') ? `3px solid ${T2.peach}` : 'none',
            borderLeft: sides.includes('left') ? `3px solid ${T2.peach}` : 'none',
            borderRight: sides.includes('right') ? `3px solid ${T2.peach}` : 'none',
            borderRadius: p.br,
            top: p.top, left: p.left, right: p.right, bottom: p.bottom,
          };
          return <div key={i} style={style}/>;
        })}
        {/* Scanning line */}
        <div style={{
          position: 'absolute', left: 12, right: 12, top: '50%',
          height: 2, background: `linear-gradient(90deg, transparent, ${T2.peach}, transparent)`,
          boxShadow: `0 0 18px ${T2.peach}`,
        }}/>
        {/* Live OCR detected highlights */}
        <div style={{
          position: 'absolute', left: 80, top: 80, padding: '2px 6px',
          background: 'rgba(245,138,101,0.85)', color: '#fff',
          fontSize: 10, fontWeight: 700, borderRadius: 4,
          fontFamily: 'Inter, system-ui',
        }}>$55</div>
      </div>

      {/* Bottom controls */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 22px 38px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
        zIndex: 10,
      }}>
        {/* Mini progress */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)',
          borderRadius: 16, padding: '10px 14px', marginBottom: 18,
          border: '1px solid rgba(255,255,255,0.12)',
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: T2.peachDeep, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <I2 name="cart" size={18} color="#fff" strokeWidth={2}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>已加入購物車</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>9 件 · NT$ 1,025</div>
          </div>
          <I2 name="chev" size={18} color="rgba(255,255,255,0.7)"/>
        </div>

        {/* Mode toggle */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 4,
          background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)',
          borderRadius: 999, padding: 4, width: 'fit-content', margin: '0 auto',
        }}>
          {['價格標', '條碼', '手動輸入'].map((m, i) => (
            <div key={m} style={{
              padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600,
              background: i === 0 ? '#fff' : 'transparent',
              color: i === 0 ? T2.ink : 'rgba(255,255,255,0.7)',
            }}>{m}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ───────────────────── 4. Scan Confirm ─────────────────────
function ScreenConfirm() {
  return (
    <SB2>
      {/* Soft success glow header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 220,
        background: `radial-gradient(ellipse at 50% 0%, ${T2.peachWash} 0%, transparent 70%)`,
      }}/>

      <div style={{ position: 'relative', padding: '60px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <RB2 icon="chevL"/>
          <span style={{ fontSize: 14, fontWeight: 700, color: T2.ink70 }}>已加入購物車</span>
          <RB2 icon="x"/>
        </div>

        {/* Success badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 36,
            background: T2.mintWash,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 0 8px ${T2.mintWash}55`,
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 26, background: T2.mint,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <I2 name="check" size={28} color="#fff" strokeWidth={2.6}/>
            </div>
          </div>
        </div>

        {/* Item card */}
        <K2 pad={20} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 76, height: 76, borderRadius: 18, background: '#E8E2D0',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38,
            }}>🍵</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: T2.ink50, fontWeight: 600, letterSpacing: 0.3 }}>義美 · 飲料</div>
              <div style={{ fontSize: 17, fontWeight: 800, marginTop: 2, lineHeight: 1.25 }}>義美厚奶茶 950ml</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: T2.peachDeep, fontFamily: 'Inter, system-ui' }}>NT$55</span>
                <span style={{ fontSize: 12, color: T2.ink50, textDecoration: 'line-through' }}>NT$65</span>
                <C2 bg={T2.roseWash} color={T2.rose}>特價</C2>
              </div>
            </div>
          </div>

          {/* Quantity */}
          <div style={{
            marginTop: 16, padding: '10px 12px', background: T2.bg, borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: T2.ink70 }}>數量</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button style={{
                width: 32, height: 32, borderRadius: 16, border: 'none', cursor: 'pointer',
                background: T2.card, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><I2 name="minus" size={16} color={T2.ink}/></button>
              <span style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Inter, system-ui', minWidth: 24, textAlign: 'center' }}>2</span>
              <button style={{
                width: 32, height: 32, borderRadius: 16, border: 'none', cursor: 'pointer',
                background: T2.peachDeep, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><I2 name="plus" size={16} color="#fff" strokeWidth={2.4}/></button>
            </div>
          </div>

          {/* OCR confidence */}
          <div style={{
            marginTop: 10, padding: '10px 12px', background: T2.mintWash, borderRadius: 14,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <I2 name="sparkle" size={16} color={T2.mint} strokeWidth={2}/>
            <span style={{ fontSize: 12, color: '#2F7A60', fontWeight: 600 }}>辨識成功 · 信心度 98%</span>
          </div>
        </K2>

        {/* Small footer note */}
        <div style={{ textAlign: 'center', fontSize: 12, color: T2.ink50, marginBottom: 16 }}>
          辨識錯誤？<span style={{ color: T2.peachDeep, fontWeight: 700 }}>手動修改</span>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button style={{
            height: 54, borderRadius: 27, border: 'none', cursor: 'pointer',
            background: T2.ink, color: '#fff', fontSize: 15, fontWeight: 700,
            fontFamily: '"Noto Sans TC", system-ui',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <I2 name="scan" size={18} color="#fff" strokeWidth={2}/>
            繼續掃描下一件
          </button>
          <button style={{
            height: 48, borderRadius: 24, border: `1.5px solid ${T2.ink10}`, cursor: 'pointer',
            background: 'transparent', color: T2.ink70, fontSize: 14, fontWeight: 700,
            fontFamily: '"Noto Sans TC", system-ui',
          }}>
            前往購物車
          </button>
        </div>
      </div>
    </SB2>
  );
}

// ───────────────────── 5. Cart Edit ─────────────────────
function ScreenCart() {
  const data = window.CH_DATA.cart;
  const subtotal = data.reduce((s, it) => s + it.price * it.qty, 0);

  return (
    <SB2>
      <H2
        title="購物車"
        subtitle={`${data.reduce((s, it) => s + it.qty, 0)} 件 · 內湖店`}
        left={<RB2 icon="chevL"/>}
        right={<RB2 icon="edit"/>}
      />

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 8, padding: '0 16px 12px', overflowX: 'auto' }}>
        {[
          { l: '全部 · 6', active: true },
          { l: '生鮮 · 2' },
          { l: '飲料 · 2' },
          { l: '日用品 · 1' },
          { l: '冷藏 · 2' },
        ].map((f, i) => (
          <div key={i} style={{
            padding: '8px 14px', borderRadius: 999,
            background: f.active ? T2.ink : T2.card,
            color: f.active ? '#fff' : T2.ink70,
            fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
            boxShadow: f.active ? 'none' : '0 1px 0 rgba(36,31,26,0.04)',
          }}>{f.l}</div>
        ))}
      </div>

      {/* Items */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map((it, idx) => (
          <K2 key={it.id} pad={12} style={{
            position: 'relative',
            ...(idx === 1 ? { borderRight: `4px solid ${T2.peach}` } : {}),
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, background: it.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
                flexShrink: 0,
              }}>{it.emoji}</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>{it.name}</div>
                <div style={{ fontSize: 11, color: T2.ink50, marginTop: 2 }}>{it.sub}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T2.peachDeep, marginTop: 4, fontFamily: 'Inter, system-ui' }}>
                  NT${it.price} <span style={{ color: T2.ink50, fontWeight: 500, fontSize: 11 }}>/ 件</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button style={{
                  width: 28, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: T2.bgDeep, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}><I2 name="minus" size={14} color={T2.ink70}/></button>
                <span style={{ fontSize: 15, fontWeight: 800, fontFamily: 'Inter, system-ui', minWidth: 18, textAlign: 'center' }}>{it.qty}</span>
                <button style={{
                  width: 28, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: T2.peachWash, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}><I2 name="plus" size={14} color={T2.peachDeep} strokeWidth={2.2}/></button>
              </div>
            </div>
          </K2>
        ))}
      </div>

      {/* Footer summary */}
      <div style={{ height: 200 }}/>
      <div style={{
        position: 'absolute', left: 12, right: 12, bottom: 30,
        background: T2.card, borderRadius: 24, padding: 16,
        boxShadow: '0 -8px 30px -10px rgba(36,31,26,0.18), 0 1px 0 rgba(36,31,26,0.04)',
        zIndex: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: T2.ink50, fontWeight: 600 }}>小計</span>
          <span style={{ fontSize: 12, color: T2.ink50 }}>含預估稅</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <span style={{ fontSize: 26, fontWeight: 800, fontFamily: 'Inter, system-ui', letterSpacing: -0.5 }}>
            <span style={{ fontSize: 16, opacity: 0.6, marginRight: 4 }}>NT$</span>{subtotal.toLocaleString()}
          </span>
          <span style={{ fontSize: 12, color: T2.mint, fontWeight: 700 }}>已省 NT$ 87</span>
        </div>

        <button style={{
          width: '100%', height: 52, borderRadius: 26, border: 'none', cursor: 'pointer',
          background: `linear-gradient(160deg, ${T2.peach}, ${T2.peachDeep})`,
          color: '#fff', fontSize: 15, fontWeight: 700,
          fontFamily: '"Noto Sans TC", system-ui',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: '0 14px 28px -14px rgba(227,107,69,0.6)',
        }}>
          結帳後掃發票比對 <I2 name="receipt" size={18} color="#fff" strokeWidth={2}/>
        </button>
      </div>
    </SB2>
  );
}

Object.assign(window, { ScreenOnboarding, ScreenHome, ScreenScan, ScreenConfirm, ScreenCart });
