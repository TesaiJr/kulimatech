import { rawColors } from './colors';

/**
 * Premium Gradient Token Registry
 * Built exclusively using the 5 core brand colors.
 */
export const gradients = {
  'emerald-dark': `linear-gradient(135deg, ${rawColors.deepTeal} 0%, ${rawColors.darkOcean} 100%)`,
  'ocean-lime': `linear-gradient(135deg, ${rawColors.darkOcean} 0%, ${rawColors.limeAccent} 100%)`,
  'electric-lime': `linear-gradient(90deg, ${rawColors.limeAccent} 0%, ${rawColors.sageMint} 100%)`,
  'sage-cream': `linear-gradient(180deg, ${rawColors.sageMint} 0%, ${rawColors.warmCream} 100%)`,
  'glass-dark': `linear-gradient(135deg, rgba(14, 71, 73, 0.85) 0%, rgba(0, 38, 38, 0.95) 100%)`,
} as const;

export type GradientToken = keyof typeof gradients;

/**
 * Scalable Gradient Helper Utility
 * Enables dynamic gradient generation adhering strictly to brand colors.
 */
export function createLinearGradient(
  from: keyof typeof rawColors,
  to: keyof typeof rawColors,
  angleDegrees: number = 135
): string {
  return `linear-gradient(${angleDegrees}deg, ${rawColors[from]} 0%, ${rawColors[to]} 100%)`;
}
