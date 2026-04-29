// Screens 6–10: Receipt Scan, Compare, Discrepancy, History, Settings
const T3 = window.CH_TOKENS;
const { CHIcon: I3, CHChip: C3, CHNT: NT3, CHCard: K3, CHBottomNav: BN3, CHHeader: H3, CHRoundBtn: RB3, CHSectionTitle: ST3, CHScreenBase: SB3 } = window;

// Reconciliation data
window.CH_RECON = {
  matched: [
    { name: '統一鮮乳 936ml', cart: 178, receipt: 178, qty: 2 },
    { name: '台灣土雞蛋 10入', cart: 95,  receipt: 95,  qty: 1 },
    { name: '舒潔抽取式衛生紙', cart: 249, receipt: 249, qty: 1 },
  ],
  diff: [
    { name: '玉井愛文芒果 1袋', cart: 159, receipt: 199, qty: 1, kind: 'overcharged', delta: 40 },
    { name: '可口可樂 2L',      cart: 195, receipt: 0,   qty: 3, kind: 'missing' },
  ],
  extra: [
    { name: '黑松沙士 600ml', receipt: 35, qty: 1, kind: 'unscanned' },
  ],
};

// ───────────────────── 6. Receipt Scan ─────────────────────
function ScreenReceiptScan() {
  return (
    <div style={{
      width: '100%', minHeight: '100%', background: '#0F0B07', position: 'relative',
      fontFamily: '"Noto Sans TC", -apple-system, system-ui',
      color: '#fff', overflow: 'hidden',
    }}>
      {/* Faux desk surface */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse at 50% 100%, rgba(120,90,60,0.4), transparent 60%),
          radial-gradient(ellipse at 30% 0%, rgba(255,200,160,0.1), transparent 50%),
          #1a1410
        `,
      }}/>

      {/* Receipt visual — long, perspective tilt */}
      <div style={{
        position: 'absolute', top: 100, left: '50%',
        transform: 'translateX(-50%) rotate(2deg)',
        width: 200, background: '#FFFCF5', color: '#1a1410',
        padding: '14px 14px 24px', borderRadius: 4,
        boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
        fontFamily: 'Inter, "Noto Sans TC", monospace',
      }}>
        <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#241F1A' }}>家樂福 內湖店</div>
        <div style={{ textAlign: 'center', fontSize: 9, color: '#7a6a52' }}>2026/04/25 15:42</div>
        <div style={{ borderTop: '1px dashed #C7BBAA', margin: '8px 0' }}/>
        {[
          ['統一鮮乳', '178'],
          ['土雞蛋', '95'],
          ['愛文芒果', '199'],
          ['可樂×3', '195'],
          ['舒潔衛生紙', '249'],
          ['黑松沙士', '35'],
          ['義美奶茶', '110'],
        ].map(([n, p], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, lineHeight: 1.6 }}>
            <span>{n}</span>
            <span>${p}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px dashed #C7BBAA', margin: '8px 0' }}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800 }}>
          <span>合計</span><span>$1,061</span>
        </div>
        <div style={{ marginTop: 10, height: 28, background: 'repeating-linear-gradient(90deg, #1a1410 0 1.5px, transparent 1.5px 3px)' }}/>
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
          <I3 name="x" size={20} color="#fff" strokeWidth={2}/>
        </button>
        <div style={{
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)',
          padding: '7px 14px', borderRadius: 18, fontSize: 12, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <I3 name="receipt" size={14} color={T3.peach}/>
          掃描整張發票
        </div>
        <div style={{ width: 38 }}/>
      </div>

      {/* Document detection frame */}
      <div style={{
        position: 'absolute', top: 92, left: '50%', transform: 'translateX(-50%) rotate(2deg)',
        width: 220, height: 460,
        border: `2px solid ${T3.peach}`,
        borderRadius: 10,
        boxShadow: `0 0 0 2000px rgba(0,0,0,0.35)`,
        zIndex: 5,
      }}>
        {/* Corner pulses */}
        {['tl','tr','bl','br'].map(p => (
          <div key={p} style={{
            position: 'absolute', width: 14, height: 14, borderRadius: 7,
            background: T3.peach,
            boxShadow: `0 0 14px ${T3.peach}`,
            top: p.startsWith('t') ? -7 : undefined,
            bottom: p.startsWith('b') ? -7 : undefined,
            left: p.endsWith('l') ? -7 : undefined,
            right: p.endsWith('r') ? -7 : undefined,
          }}/>
        ))}
      </div>

      {/* Hint */}
      <div style={{
        position: 'absolute', top: 50, left: '50%', transform: 'translateX(-50%)',
        marginTop: 80, padding: '8px 14px', borderRadius: 999,
        background: 'rgba(245,138,101,0.95)', color: '#fff',
        fontSize: 12, fontWeight: 700, zIndex: 6,
      }}>
        ✨ 偵測到發票 · 請保持平整
      </div>

      {/* Bottom controls */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 22px 38px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
        zIndex: 10,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>對齊發票四角</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>放在平面上 · 對齊框線後自動拍攝</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
          <button style={{
            width: 52, height: 52, borderRadius: 26, border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 11, fontWeight: 700, flexDirection: 'column', gap: 2,
          }}>
            <I3 name="grid" size={18} color="#fff"/>
            <span style={{ fontSize: 9 }}>相簿</span>
          </button>

          <button style={{
            width: 76, height: 76, borderRadius: 38, border: '4px solid rgba(255,255,255,0.3)',
            cursor: 'pointer', background: '#fff', padding: 4,
          }}>
            <div style={{
              width: '100%', height: '100%', borderRadius: '50%',
              background: `linear-gradient(160deg, ${T3.peach}, ${T3.peachDeep})`,
            }}/>
          </button>

          <button style={{
            width: 52, height: 52, borderRadius: 26, border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', color: '#fff',
          }}>
            <I3 name="bolt" size={18} color="#fff"/>
            <span style={{ fontSize: 9, marginTop: 2 }}>自動</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────────────────── 7. Side-by-side Compare ─────────────────────
function ScreenCompare() {
  const cartItems = [
    { name: '統一鮮乳 936ml',  qty: 2, price: 178, status: 'match' },
    { name: '台灣土雞蛋 10入', qty: 1, price: 95,  status: 'match' },
    { name: '玉井愛文芒果',    qty: 1, price: 159, status: 'over' },
    { name: '可口可樂 2L',      qty: 3, price: 195, status: 'missing' },
    { name: '舒潔抽取式衛生紙', qty: 1, price: 249, status: 'match' },
    { name: '義美厚奶茶',       qty: 2, price: 110, status: 'match' },
  ];
  const recItems = [
    { name: '統一鮮乳 936ml',  qty: 2, price: 178, status: 'match' },
    { name: '土雞蛋 10入',      qty: 1, price: 95,  status: 'match' },
    { name: '愛文芒果',         qty: 1, price: 199, status: 'over' },
    { name: '舒潔抽取式衛生紙', qty: 1, price: 249, status: 'match' },
    { name: '黑松沙士 600ml',   qty: 1, price: 35,  status: 'extra' },
    { name: '義美厚奶茶',       qty: 2, price: 110, status: 'match' },
  ];

  const statusBg = {
    match:   { bg: T3.mintWash,   fg: '#2F7A60', dot: T3.mint },
    over:    { bg: T3.roseWash,   fg: T3.rose,    dot: T3.rose },
    missing: { bg: T3.sunWash,    fg: '#9C7A1F', dot: T3.sun  },
    extra:   { bg: T3.lavWash,    fg: '#5D4FA0', dot: T3.lav  },
  };

  const Col = ({ title, sub, total, items, color }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
      <div style={{
        background: T3.card, borderRadius: 16, padding: '10px 12px',
        borderTop: `3px solid ${color}`,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T3.ink50, letterSpacing: 0.4 }}>{sub}</div>
        <div style={{ fontSize: 14, fontWeight: 800, color: T3.ink, marginTop: 1 }}>{title}</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: T3.ink, marginTop: 4, fontFamily: 'Inter, system-ui' }}>
          <span style={{ fontSize: 11, opacity: 0.6, marginRight: 2 }}>NT$</span>{total.toLocaleString()}
        </div>
      </div>

      {items.map((it, i) => {
        const s = statusBg[it.status];
        return (
          <div key={i} style={{
            background: T3.card, borderRadius: 14, padding: '8px 10px',
            display: 'flex', flexDirection: 'column', gap: 4,
            position: 'relative',
            border: `1px solid ${s.bg}`,
          }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: T3.ink, lineHeight: 1.25,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{it.name}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: T3.ink50 }}>×{it.qty}</span>
              <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'Inter, system-ui' }}>
                ${it.price}
              </span>
            </div>
            <div style={{
              position: 'absolute', top: -1, right: -1,
              width: 8, height: 8, borderRadius: 4, background: s.dot,
              border: `1.5px solid ${T3.bg}`,
            }}/>
          </div>
        );
      })}
    </div>
  );

  const cartTotal = 1112;
  const recTotal = 1061 + 35 + 40 - 195; // ~941

  return (
    <SB3>
      <H3
        title="比對結果"
        subtitle="家樂福 · 內湖店 · 04/25"
        left={<RB3 icon="chevL"/>}
        right={<RB3 icon="info"/>}
      />

      {/* Summary tally */}
      <div style={{ padding: '0 16px 12px' }}>
        <K3 pad={14}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T3.ink50 }}>總差額</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: T3.rose, fontFamily: 'Inter, system-ui', letterSpacing: -0.5 }}>
                +NT$ 40
              </div>
            </div>
            <div style={{
              padding: '6px 12px', borderRadius: 999,
              background: T3.roseWash, color: T3.rose,
              fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <I3 name="bell" size={12} color={T3.rose} strokeWidth={2}/>
              發現 3 處差異
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
            {[
              { l: '相符', n: 4, c: T3.mint,  bg: T3.mintWash },
              { l: '價差', n: 1, c: T3.rose,  bg: T3.roseWash },
              { l: '漏結', n: 1, c: T3.sun,   bg: T3.sunWash },
              { l: '多結', n: 1, c: T3.lav,   bg: T3.lavWash },
            ].map((s, i) => (
              <div key={i} style={{ background: s.bg, borderRadius: 12, padding: '8px 6px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.c, fontFamily: 'Inter, system-ui' }}>{s.n}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: s.c }}>{s.l}</div>
              </div>
            ))}
          </div>
        </K3>
      </div>

      {/* Two columns */}
      <div style={{ padding: '0 12px', display: 'flex', gap: 8 }}>
        <Col
          title="購物車"
          sub="自己掃的"
          total={1112}
          items={cartItems}
          color={T3.peach}
        />
        <Col
          title="發票"
          sub="店家結帳"
          total={1061}
          items={recItems}
          color={T3.lav}
        />
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, padding: '14px 16px 0', flexWrap: 'wrap' }}>
        {[
          { l: '相符',  c: T3.mint },
          { l: '價差',  c: T3.rose },
          { l: '漏結',  c: T3.sun  },
          { l: '多結',  c: T3.lav  },
        ].map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: T3.ink70, fontWeight: 600 }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: l.c }}/> {l.l}
          </div>
        ))}
      </div>

      <div style={{ height: 130 }}/>
      <BN3 active="compare"/>
    </SB3>
  );
}

// ───────────────────── 8. Discrepancy Resolution ─────────────────────
function ScreenDiscrepancy() {
  return (
    <SB3>
      <H3
        title="處理差異"
        subtitle="2 / 3"
        left={<RB3 icon="chevL"/>}
        right={<span style={{ fontSize: 13, color: T3.peachDeep, fontWeight: 700, padding: '0 10px' }}>跳過</span>}
      />

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 6, padding: '0 20px 16px' }}>
        <div style={{ flex: 1, height: 5, borderRadius: 3, background: T3.mint }}/>
        <div style={{ flex: 1, height: 5, borderRadius: 3, background: T3.peachDeep }}/>
        <div style={{ flex: 1, height: 5, borderRadius: 3, background: T3.ink10 }}/>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Headline */}
        <div style={{
          display: 'inline-flex', padding: '4px 10px', borderRadius: 999,
          background: T3.roseWash, color: T3.rose, fontSize: 11, fontWeight: 700,
          letterSpacing: 0.3, marginBottom: 10,
        }}>
          <I3 name="bell" size={12} color={T3.rose} strokeWidth={2}/>&nbsp;價差 · 多收 NT$ 40
        </div>

        <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.3, letterSpacing: -0.4, marginBottom: 4 }}>
          這項商品的價格<br/>跟你掃的不一樣
        </div>
        <div style={{ fontSize: 13, color: T3.ink70, marginBottom: 18 }}>
          發票顯示的金額比你在貨架掃的多 <b style={{ color: T3.rose }}>NT$ 40</b>。檢查一下是否有效。
        </div>

        {/* Comparison cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          <K3 pad={16} bg={T3.peachWash} style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: T3.peachDeep, letterSpacing: 0.4 }}>你掃到的</span>
              <span style={{ fontSize: 10, color: T3.ink50, fontFamily: 'Inter, system-ui' }}>15:18 · 貨架</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14, background: '#FFEBD8',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
              }}>🥭</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800 }}>玉井愛文芒果 1袋</div>
                <div style={{ fontSize: 11, color: T3.ink50, marginTop: 2 }}>當日特價標</div>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: T3.peachDeep, fontFamily: 'Inter, system-ui' }}>
                $159
              </div>
            </div>
          </K3>

          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', height: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 16, background: T3.card,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(36,31,26,0.1)',
              position: 'absolute', top: -22, zIndex: 5,
            }}>
              <I3 name="swap" size={16} color={T3.ink70} strokeWidth={2}/>
            </div>
          </div>

          <K3 pad={16} style={{ borderRight: `4px solid ${T3.rose}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: T3.lav, letterSpacing: 0.4 }}>發票顯示</span>
              <span style={{ fontSize: 10, color: T3.ink50, fontFamily: 'Inter, system-ui' }}>15:42 · 收銀</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14, background: T3.bgDeep,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <I3 name="receipt" size={26} color={T3.ink50}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800 }}>愛文芒果</div>
                <div style={{ fontSize: 11, color: T3.ink50, marginTop: 2 }}>原價 · 未套用特價</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: T3.rose, fontFamily: 'Inter, system-ui' }}>
                  $199
                </div>
                <div style={{ fontSize: 11, color: T3.rose, fontWeight: 700 }}>+NT$ 40</div>
              </div>
            </div>
          </K3>
        </div>

        {/* Action choices */}
        <div style={{ fontSize: 12, fontWeight: 700, color: T3.ink70, marginBottom: 8, letterSpacing: 0.3 }}>
          你想怎麼處理？
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { i: 'bell',  t: '回客服中心反映',     s: '帶著發票去客服，要求退價差', accent: T3.rose },
            { i: 'check', t: '接受發票價格',         s: '可能特價已結束 · 不再追蹤', accent: T3.mint },
            { i: 'edit',  t: '我掃錯了 · 修正購物車', s: '把芒果改成 NT$ 199',         accent: T3.lav },
          ].map((a, i) => (
            <K3 key={i} pad={14} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 12,
                background: a.accent + '22',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <I3 name={a.i} size={18} color={a.accent} strokeWidth={2}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{a.t}</div>
                <div style={{ fontSize: 11, color: T3.ink50, marginTop: 1 }}>{a.s}</div>
              </div>
              <I3 name="chev" size={18} color={T3.ink30}/>
            </K3>
          ))}
        </div>
      </div>

      <div style={{ height: 30 }}/>
    </SB3>
  );
}

// ───────────────────── 9. History ─────────────────────
function ScreenHistory() {
  const trips = [
    { date: '今天', store: '家樂福 · 內湖店', total: 1112, items: 9, diff: 40, status: 'pending' },
    { date: '昨天', store: '全聯 · 民權店',   total: 528,  items: 5, diff: 0,  status: 'clean' },
    { date: '04/22', store: '美廉社 · 行愛店', total: 215,  items: 3, diff: -8, status: 'saved' },
    { date: '04/19', store: '家樂福 · 內湖店', total: 980,  items: 7, diff: 0,  status: 'clean' },
    { date: '04/15', store: '頂好 · 港墘店',   total: 432,  items: 6, diff: 25, status: 'resolved' },
  ];

  const statusMeta = {
    pending:  { l: '待處理', bg: T3.roseWash, fg: T3.rose },
    clean:    { l: '無差異', bg: T3.mintWash, fg: '#2F7A60' },
    saved:    { l: '省錢',   bg: T3.mintWash, fg: '#2F7A60' },
    resolved: { l: '已解決', bg: T3.lavWash, fg: '#5D4FA0' },
  };

  return (
    <SB3>
      <H3
        title="購物紀錄"
        subtitle="本月 · 12 趟"
        right={<>
          <RB3 icon="calendar"/>
          <RB3 icon="list"/>
        </>}
      />

      {/* Monthly stat */}
      <div style={{ padding: '0 16px 14px' }}>
        <K3 pad={16} style={{
          background: `linear-gradient(160deg, #FFF7EE 0%, ${T3.peachWash} 100%)`,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: T3.ink70 }}>本月省下</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: T3.peachDeep, fontFamily: 'Inter, system-ui', letterSpacing: -0.5, marginTop: 2 }}>
            <span style={{ fontSize: 18, opacity: 0.7, marginRight: 4 }}>NT$</span>342
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 12 }}>
            {[
              { l: '已找回', v: '+NT$ 280', c: T3.mint },
              { l: '檢出差異', v: '6 處', c: T3.rose },
              { l: '購物趟次', v: '12', c: T3.lav },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: s.c, fontFamily: 'Inter, system-ui' }}>{s.v}</div>
                <div style={{ fontSize: 10, color: T3.ink50, fontWeight: 600 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </K3>
      </div>

      {/* Trips */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <ST3>歷史購物</ST3>
        {trips.map((t, i) => {
          const m = statusMeta[t.status];
          return (
            <K3 key={i} pad={14}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: T3.bgDeep,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ fontSize: 9, color: T3.ink50, fontWeight: 700 }}>{t.date.includes('/') ? t.date.split('/')[0] : ''}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: T3.ink, fontFamily: 'Inter, system-ui', lineHeight: 1 }}>
                    {t.date.includes('/') ? t.date.split('/')[1] : t.date}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{t.store}</span>
                  </div>
                  <div style={{ fontSize: 11, color: T3.ink50, marginTop: 2 }}>{t.items} 件 · NT$ {t.total.toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
                    background: m.bg, color: m.fg, marginBottom: 4, display: 'inline-block',
                  }}>{m.l}</div>
                  {t.diff !== 0 && (
                    <div style={{
                      fontSize: 12, fontWeight: 700,
                      color: t.diff > 0 ? T3.rose : T3.mint,
                      fontFamily: 'Inter, system-ui',
                    }}>
                      {t.diff > 0 ? '+' : ''}NT$ {Math.abs(t.diff)}
                    </div>
                  )}
                </div>
              </div>
            </K3>
          );
        })}
      </div>

      <div style={{ height: 130 }}/>
      <BN3 active="history"/>
    </SB3>
  );
}

// ───────────────────── 10. Settings ─────────────────────
function ScreenSettings() {
  const Row = ({ icon, iconBg, label, sub, value, toggle, last }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px',
      borderBottom: last ? 'none' : `1px solid ${T3.hairline}`,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: iconBg || T3.bgDeep,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <I3 name={icon} size={16} color={T3.ink} strokeWidth={1.8}/>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: T3.ink50, marginTop: 1 }}>{sub}</div>}
      </div>
      {toggle !== undefined && (
        <div style={{
          width: 44, height: 26, borderRadius: 13,
          background: toggle ? T3.peachDeep : T3.ink10,
          display: 'flex', alignItems: 'center',
          padding: 2, justifyContent: toggle ? 'flex-end' : 'flex-start',
        }}>
          <div style={{ width: 22, height: 22, borderRadius: 11, background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}/>
        </div>
      )}
      {value && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: T3.ink50 }}>
          {value} <I3 name="chev" size={14} color={T3.ink30}/>
        </div>
      )}
    </div>
  );

  return (
    <SB3>
      <H3 title="設定" left={<RB3 icon="chevL"/>}/>

      {/* Profile card */}
      <div style={{ padding: '0 16px 14px' }}>
        <K3 pad={16}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 28,
              background: `linear-gradient(160deg, ${T3.peach}, ${T3.peachDeep})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 800, color: '#fff',
              fontFamily: '"Noto Sans TC", system-ui',
            }}>陳</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>陳小美</div>
              <div style={{ fontSize: 12, color: T3.ink50, marginTop: 1 }}>已連結手機條碼 /AB.CD12</div>
            </div>
            <I3 name="chev" size={18} color={T3.ink30}/>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {[
              { l: '本月省下', v: 'NT$ 342' },
              { l: '購物次數', v: '12' },
              { l: '會員等級', v: 'Gold' },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, padding: 10, background: T3.bgDeep, borderRadius: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'Inter, system-ui' }}>{s.v}</div>
                <div style={{ fontSize: 10, color: T3.ink50, fontWeight: 600, marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </K3>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <ST3>掃描偏好</ST3>
          <K3 pad={0}>
            <Row icon="tag"   iconBg={T3.peachWash} label="預設掃描模式" value="價格標"/>
            <Row icon="bolt"  iconBg={T3.sunWash}  label="自動連續掃描"   sub="掃完一張立刻打開下一張" toggle={true}/>
            <Row icon="check" iconBg={T3.mintWash} label="震動回饋"        toggle={true}/>
            <Row icon="bell"  iconBg={T3.roseWash} label="發票差異提醒"    sub="超過 NT$ 10 時通知"  toggle={true} last/>
          </K3>
        </div>

        <div>
          <ST3>購物</ST3>
          <K3 pad={0}>
            <Row icon="cart"  iconBg={T3.peachWash} label="預算提醒"   value="NT$ 1,500"/>
            <Row icon="lang"  iconBg={T3.lavWash}   label="語言"       value="繁體中文"/>
            <Row icon="cloud" iconBg={T3.mintWash}  label="雲端備份"   sub="iCloud · 已同步" toggle={true}/>
            <Row icon="moon"  iconBg={T3.bgDeep}    label="深色模式"   value="跟隨系統" last/>
          </K3>
        </div>

        <div>
          <ST3>關於</ST3>
          <K3 pad={0}>
            <Row icon="info" label="使用說明"/>
            <Row icon="eye"  label="隱私權"/>
            <Row icon="user" label="登出" last/>
          </K3>
        </div>

        <div style={{ textAlign: 'center', fontSize: 11, color: T3.ink30, padding: '16px 0', fontFamily: 'Inter, system-ui' }}>
          Cart Helper · v1.0.0
        </div>
      </div>

      <div style={{ height: 130 }}/>
      <BN3 active="me"/>
    </SB3>
  );
}

Object.assign(window, { ScreenReceiptScan, ScreenCompare, ScreenDiscrepancy, ScreenHistory, ScreenSettings });
