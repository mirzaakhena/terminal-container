import { MeshStandardMaterial } from 'three';
import { palette } from '../config/theme';

/** Shared materials for vehicles and equipment, created once. */
const m = (color: string, roughness = 0.7, metalness = 0.1) => new MeshStandardMaterial({ color, roughness, metalness });

export const materials = {
  brand: m(palette.brand, 0.55),
  brandDark: m(palette.brandDark, 0.6),
  white: m('#f7f8fc', 0.6),
  steel: m(palette.steel, 0.6, 0.25),
  steelDark: m(palette.steelDark, 0.6, 0.25),
  frame: m('#4d566f', 0.65, 0.2),
  rubber: m(palette.rubber, 0.9, 0),
  glass: m(palette.glass, 0.25, 0.3),
  light: m('#fff6d6', 0.3),
  tail: m('#e5484d', 0.4),
  amber: m('#f2a93b', 0.4),
  yellow: m(palette.marking, 0.6),
};
