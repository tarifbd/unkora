import type { Config } from "tailwindcss";
import baseConfig from "../../packages/config/tailwind.config.base";

const config: Config = {
  ...baseConfig,
  content: [
    "./src/**/*.{ts,tsx,js,jsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    ...baseConfig.theme,
    extend: {
      ...baseConfig.theme?.extend,
      // Web-app-specific overrides
      colors: {
        ...(baseConfig.theme?.extend as Record<string, unknown>)?.colors as Record<string, unknown>,
      },
    },
  },
};

export default config;
