// ─── Dots Design Tokens ────────────────────────────────────────────────────
// Single source of truth for all colors, fonts, spacing used across the app.
// Import this wherever you need consistent values in JS/JSX.

export const colors = {
  // Backgrounds
  bgPrimary:    '#080c14',
  bgSecondary:  '#0d1420',
  bgCard:       '#111827',
  bgCardHover:  '#1a2332',

  // Borders
  border:       '#1e2d42',
  borderBright: '#2a4060',

  // Brand / Math palette (matches 3Blue1Brown)
  blue:         '#58C4DD',
  blueDim:      '#2a6480',
  blueGlow:     'rgba(88, 196, 221, 0.15)',
  yellow:       '#f0c040',
  yellowDim:    'rgba(240, 192, 64, 0.15)',
  green:        '#83C167',
  red:          '#FC6255',
  purple:       '#9B72CF',

  // Text
  textPrimary:   '#e8edf5',
  textSecondary: '#8899aa',
  textMuted:     '#445566',
  textDim:       '#2a3a4a',
};

export const fonts = {
  display: "'DM Serif Display', Georgia, serif",
  body:    "'Instrument Sans', system-ui, sans-serif",
  mono:    "'JetBrains Mono', 'Courier New', monospace",
};

export const fontSizes = {
  xs:   '11px',
  sm:   '12px',
  base: '14px',
  md:   '15px',
  lg:   '18px',
  xl:   '22px',
  '2xl':'28px',
  '3xl':'36px',
  '4xl':'48px',
};

export const radii = {
  sm:  '6px',
  md:  '8px',
  lg:  '12px',
  xl:  '16px',
  xxl: '20px',
};

export const shadows = {
  card:  '0 4px 24px rgba(0, 0, 0, 0.4)',
  blue:  '0 0 40px rgba(88, 196, 221, 0.1)',
  glow:  '0 0 20px rgba(88, 196, 221, 0.25)',
  inner: 'inset 0 1px 0 rgba(255,255,255,0.04)',
};

export const transitions = {
  fast:   'all 0.15s ease',
  normal: 'all 0.2s ease',
  slow:   'all 0.4s ease',
};

export const zIndex = {
  background: 0,
  base:       1,
  overlay:    10,
  modal:      100,
  toast:      200,
};

// ─── Reusable style objects (use with inline styles or spread) ────────────────

export const cardStyle = {
  background:   colors.bgCard,
  border:       `1px solid ${colors.border}`,
  borderRadius: radii.lg,
  boxShadow:    shadows.card,
};

export const glowBorderStyle = {
  border:     `1px solid ${colors.borderBright}`,
  boxShadow:  shadows.blue,
};

export const monoTextStyle = {
  fontFamily: fonts.mono,
  fontSize:   fontSizes.xs,
  color:      colors.textSecondary,
};

export const displayTextStyle = {
  fontFamily:    fonts.display,
  color:         colors.textPrimary,
  letterSpacing: '-0.5px',
};

// Helper: create a glow effect style for a given color
export const glowFor = (hexColor, strength = 0.2) => ({
  boxShadow: `0 0 30px ${hexColor}${Math.round(strength * 255).toString(16).padStart(2, '0')}`,
});

// Helper: themed button base
export const btnBase = {
  border:       'none',
  borderRadius: radii.md,
  cursor:       'pointer',
  fontFamily:   fonts.body,
  fontSize:     fontSizes.base,
  fontWeight:   '500',
  transition:   transitions.normal,
  display:      'inline-flex',
  alignItems:   'center',
  justifyContent: 'center',
  gap:          '6px',
};

export const btnPrimary = {
  ...btnBase,
  background: colors.blue,
  color:      colors.bgPrimary,
  padding:    '10px 20px',
};

export const btnSecondary = {
  ...btnBase,
  background: 'transparent',
  color:      colors.blue,
  border:     `1px solid ${colors.border}`,
  padding:    '10px 20px',
};

export const btnGhost = {
  ...btnBase,
  background: 'none',
  color:      colors.textSecondary,
  padding:    '6px 12px',
};

// Default export — everything as one object for convenience
const theme = {
  colors,
  fonts,
  fontSizes,
  radii,
  shadows,
  transitions,
  zIndex,
  cardStyle,
  glowBorderStyle,
  monoTextStyle,
  displayTextStyle,
  glowFor,
  btnBase,
  btnPrimary,
  btnSecondary,
  btnGhost,
};

export default theme;