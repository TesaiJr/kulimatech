import type { Config } from 'tailwindcss';
import { semanticColors, gradients } from './src/theme/colors';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: semanticColors,
      backgroundImage: gradients,
    },
  },
  plugins: [],
};

export default config;
