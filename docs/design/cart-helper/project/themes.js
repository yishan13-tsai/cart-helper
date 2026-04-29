// 8 themes derived from style-A illustrative crimson
window.CH_THEMES = {
  crimson: {
    id: 'crimson', name: '緋紅', en: 'Crimson',
    bg: '#FFFFFF', surface: '#FBEFE5',
    page: '#C73E5A', pageDark: '#A02942',
    ink: '#1A1416', ink60: '#7A6B72', ink30: '#C9BEC4', ink10: '#EFE7DA',
    chip1: '#F7A23B', chip2: '#7BC97A',
    success: '#5DBE9C', successWash: '#DDEFE5',
    alert: '#E85F77', alertWash: '#F8CFD7',
    warn: '#E9B949', warnWash: '#F8EAC2',
  },
  tomato: {
    id: 'tomato', name: '番茄紅', en: 'Tomato',
    bg: '#FFFAF5', surface: '#FFE9D8',
    page: '#E84F2A', pageDark: '#B83A1C',
    ink: '#1A1416', ink60: '#7A6B72', ink30: '#C9BEC4', ink10: '#EFE7DA',
    chip1: '#FFB347', chip2: '#7BC97A',
    success: '#5DBE9C', successWash: '#DDEFE5',
    alert: '#E85F77', alertWash: '#F8CFD7',
    warn: '#E9B949', warnWash: '#F8EAC2',
  },
  maple: {
    id: 'maple', name: '楓糖橘', en: 'Maple',
    bg: '#FFF7EC', surface: '#FCE9CD',
    page: '#E07A1F', pageDark: '#B05E12',
    ink: '#1A1416', ink60: '#7A6B72', ink30: '#C9BEC4', ink10: '#EFE7DA',
    chip1: '#F4B53F', chip2: '#9CC579',
    success: '#5DBE9C', successWash: '#DDEFE5',
    alert: '#E85F77', alertWash: '#F8CFD7',
    warn: '#E9B949', warnWash: '#F8EAC2',
  },
  rouge: {
    id: 'rouge', name: '胭脂粉', en: 'Rouge',
    bg: '#FFFAF7', surface: '#FBE5E8',
    page: '#D14D6E', pageDark: '#A4364F',
    ink: '#1A1416', ink60: '#7A6B72', ink30: '#C9BEC4', ink10: '#EFE7DA',
    chip1: '#F0A0A8', chip2: '#A8C99A',
    success: '#5DBE9C', successWash: '#DDEFE5',
    alert: '#E85F77', alertWash: '#F8CFD7',
    warn: '#E9B949', warnWash: '#F8EAC2',
  },
  bordeaux: {
    id: 'bordeaux', name: '酒紅', en: 'Bordeaux',
    bg: '#FBF6EE', surface: '#F0E4D2',
    page: '#8E2A3A', pageDark: '#6A1E2A',
    ink: '#1A1416', ink60: '#7A6B72', ink30: '#C9BEC4', ink10: '#EFE7DA',
    chip1: '#D9A05B', chip2: '#7B9F70',
    success: '#5DBE9C', successWash: '#DDEFE5',
    alert: '#E85F77', alertWash: '#F8CFD7',
    warn: '#E9B949', warnWash: '#F8EAC2',
  },
  matcha: {
    id: 'matcha', name: '抹茶綠', en: 'Matcha',
    bg: '#FBF7EC', surface: '#EDE2C8',
    page: '#3F8E5C', pageDark: '#2C6B43',
    ink: '#1A1416', ink60: '#7A6B72', ink30: '#C9BEC4', ink10: '#EFE7DA',
    chip1: '#F4B53F', chip2: '#E07A4D',
    success: '#5DBE9C', successWash: '#DDEFE5',
    alert: '#E85F77', alertWash: '#F8CFD7',
    warn: '#E9B949', warnWash: '#F8EAC2',
  },
  navy: {
    id: 'navy', name: '深藍橘', en: 'Navy & Persimmon',
    bg: '#FFF8EE', surface: '#FFE3CB',
    page: '#1F3A5F', pageDark: '#142844',
    ink: '#0F1B2D', ink60: '#5C6B85', ink30: '#A6B0C2', ink10: '#E0E5EE',
    chip1: '#F26E3F', chip2: '#F4B53F',
    success: '#5DBE9C', successWash: '#DDEFE5',
    alert: '#F26E3F', alertWash: '#FFD9C4',
    warn: '#F4B53F', warnWash: '#FBE6B5',
  },
  cocoa: {
    id: 'cocoa', name: '深棕橘', en: 'Cocoa & Citrus',
    bg: '#FBF4E8', surface: '#F0DDB8',
    page: '#3D2418', pageDark: '#291810',
    ink: '#1A1010', ink60: '#6E5440', ink30: '#BFAA8E', ink10: '#EBDFC9',
    chip1: '#F4A93F', chip2: '#C46A2D',
    success: '#5DBE9C', successWash: '#DDEFE5',
    alert: '#C46A2D', alertWash: '#F2D2B5',
    warn: '#F4A93F', warnWash: '#FBE6B5',
  },
};

// Active theme (resolved at render time from data-theme attr)
window.CH_USE_THEME = function() {
  const t = (typeof document !== 'undefined' && document.documentElement.dataset.chTheme) || 'tomato';
  return window.CH_THEMES[t] || window.CH_THEMES.tomato;
};
