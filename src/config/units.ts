/** The world unit is one metre. These helpers convert from imperial sizes used by ISO containers. */
export const FOOT = 0.3048;
export const INCH = 0.0254;

export const feet = (ft: number, inches = 0): number => ft * FOOT + inches * INCH;

/** Rounds to millimetres, for stable labels and comparisons. */
export const mm = (metres: number): number => Math.round(metres * 1000) / 1000;
