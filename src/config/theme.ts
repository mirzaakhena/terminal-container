/**
 * Visual tokens shared by the 3D scene and the UI overlay.
 * Palette follows docs/style-reference.png: light lavender ground,
 * royal blue brand colour, soft cool shadows.
 */
export const palette = {
  brand: '#2f5bea',
  brandDark: '#1f3fb8',
  brandSoft: '#dfe6fd',

  ground: '#eceef7',
  groundLine: '#dcdfee',
  groundSection: '#c6cbe2',
  shadow: '#3a4580',
  background: '#e8eaf5',
  asphalt: '#d4d8ea',
  marking: '#f6d77a',

  steel: '#c9cede',
  steelDark: '#5b6278',
  rubber: '#2b2f3a',
  glass: '#2a3245',

  text: '#1b2033',
  textMuted: '#6b7189',
  card: '#ffffff',
  success: '#22a45d',
  warning: '#f2a93b',
} as const;

/** Pastel container colours — deliberately generic, no shipping-line branding. */
export const containerColors = [
  '#5b7cf0', // blue
  '#f08c6c', // coral
  '#5fc3a7', // mint
  '#f3c75f', // mustard
  '#a98bf0', // lavender
  '#ee7fa3', // rose
  '#6cc0e8', // sky
  '#9aa3b8', // grey
] as const;

export const lighting = {
  ambient: 0.8,
  hemisphereSky: '#ffffff',
  hemisphereGround: '#c8cce0',
  hemisphere: 0.9,
  sun: 2.0,
  sunColor: '#fffaf0',
  /** Direction the sun comes from (normalised later). */
  sunDirection: [-40, 80, 30] as [number, number, number],
  shadowMapSize: 4096,
  shadowExtent: 120,
};
