/**
 * Brand Raw Color Palette (Single Source of Truth)
 * Restrictive brand hex values.
 */
export const rawColors = {
  deepTeal: '#002626',      // Dark Forest Teal
  darkOcean: '#0E4749',     // Deep Ocean Teal
  limeAccent: '#95C623',    // Electric Lime
  warmCream: '#FEFAE0',     // Light Warm Cream
  sageMint: '#8EB69B',      // Soft Sage Mint
} as const;

export type RawColorKey = keyof typeof rawColors;

/**
 * Scalable Semantic Design Tokens
 * Purpose-driven mappings used throughout Tailwind configuration & UI components.
 */
export const semanticColors = {
  primary: {
    DEFAULT: rawColors.deepTeal,
    hover: rawColors.darkOcean,
    foreground: rawColors.warmCream,
  },
  secondary: {
    DEFAULT: rawColors.darkOcean,
    hover: rawColors.deepTeal,
    foreground: rawColors.warmCream,
  },
  accent: {
    DEFAULT: rawColors.limeAccent,
    hover: rawColors.sageMint,
    foreground: rawColors.deepTeal,
  },
  surface: {
    DEFAULT: rawColors.warmCream,
    dark: rawColors.darkOcean,
    deep: rawColors.deepTeal,
    muted: rawColors.sageMint,
    foreground: rawColors.deepTeal,
  },
  muted: {
    DEFAULT: rawColors.sageMint,
    foreground: rawColors.deepTeal,
  },
  background: {
    DEFAULT: rawColors.warmCream,
    dark: rawColors.deepTeal,
    light: rawColors.warmCream,
    foreground: rawColors.deepTeal,
  },
} as const;

export type SemanticColorRole = keyof typeof semanticColors;
