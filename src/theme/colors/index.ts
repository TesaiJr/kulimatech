export * from './colors';
export * from './gradients';

import { rawColors, semanticColors } from './colors';
import { gradients } from './gradients';

/**
 * Unified Theme Export Bundle
 */
export const themeColors = {
  raw: rawColors,
  semantic: semanticColors,
  gradients: gradients,
} as const;

export default themeColors;
