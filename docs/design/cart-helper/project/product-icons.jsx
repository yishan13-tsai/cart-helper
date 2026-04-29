// Product category icons — Lucide-style stroke SVGs. No external deps.
function PIcon({ name, size = 24, color = '#1A1416', sw = 1.6, bg }) {
  const c = { fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    // 牛奶盒
    milk: <g {...c}>
      <path d="M8 3h8v3l2 3v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9l2-3V3Z"/>
      <path d="M6 9h12"/>
      <path d="M10 14h4"/>
    </g>,
    // 芒果 / 水果
    mango: <g {...c}>
      <path d="M12 4c-4 0-8 3-8 8s3 8 8 8 8-4 8-8-2-8-8-8Z"/>
      <path d="M12 4c1-1 2-2 4-2"/>
      <path d="M9 10c.5-1.5 2-2.5 3.5-2.5"/>
    </g>,
    // 蛋
    egg: <g {...c}>
      <path d="M12 3c-4 0-7 6-7 11a7 7 0 0 0 14 0c0-5-3-11-7-11Z"/>
      <path d="M9 12c.5-1.5 1.5-2.5 3-3"/>
    </g>,
    // 飲料杯
    cup: <g {...c}>
      <path d="M6 7h12l-1.2 13a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 7Z"/>
      <path d="M5 7h14"/>
      <path d="M9 4l1-1h4l1 1"/>
      <path d="M10 12v5"/>
      <path d="M14 12v5"/>
    </g>,
    // 衛生紙卷
    tissue: <g {...c}>
      <ellipse cx="12" cy="8" rx="7" ry="3"/>
      <path d="M5 8v8a7 3 0 0 0 14 0V8"/>
      <ellipse cx="12" cy="8" rx="2.5" ry="1.2"/>
    </g>,
    // 茶 / 熱飲
    tea: <g {...c}>
      <path d="M5 9h12v6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5V9Z"/>
      <path d="M17 11h2a2 2 0 0 1 0 4h-2"/>
      <path d="M9 5c0-1 1-1.5 1-2.5"/>
      <path d="M13 5c0-1 1-1.5 1-2.5"/>
    </g>,
    // 麵包
    bread: <g {...c}>
      <path d="M3 12c0-3 3-5 5-5h8c2 0 5 2 5 5 0 1.5-1 2.5-2 2.5l-1 4a2 2 0 0 1-2 1.5H8a2 2 0 0 1-2-1.5l-1-4c-1 0-2-1-2-2.5Z"/>
      <path d="M9 13l1 4"/>
      <path d="M14 13l-1 4"/>
    </g>,
    // 米 / 包裝
    rice: <g {...c}>
      <path d="M6 6h12l1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L6 6Z"/>
      <path d="M8 3h8v3H8z"/>
      <path d="M9 13h6"/>
    </g>,
    // 蔬菜
    veg: <g {...c}>
      <path d="M12 8c-3 0-6 2.5-6 6 0 3.5 2.5 7 6 7s6-3.5 6-7c0-3.5-3-6-6-6Z"/>
      <path d="M12 8V4"/>
      <path d="M12 4c1.5-1 3-1 4 0"/>
      <path d="M12 4c-1.5-1-3-1-4 0"/>
    </g>,
    // 肉類
    meat: <g {...c}>
      <path d="M5 13a6 6 0 0 1 12 0 4 4 0 0 1-4 4H9a4 4 0 0 1-4-4Z"/>
      <circle cx="9" cy="13" r="1.2" fill={color}/>
    </g>,
  };
  const inner = paths[name] || paths.rice;
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.3,
      background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24">{inner}</svg>
    </div>
  );
}

window.PIcon = PIcon;
