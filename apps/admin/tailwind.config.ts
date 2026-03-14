import type { Config } from "tailwindcss";
import baseConfig from "../../packages/config/tailwind.config.base";

const config: Config = {
  ...baseConfig,
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    ...baseConfig.theme,
    extend: {
      ...(baseConfig.theme?.extend ?? {}),
      colors: {
        ...(baseConfig.theme?.extend as Record<string, unknown>)?.colors as Record<string, unknown>,
        // Admin-specific: slate palette additions
      },
    },
  },
};

export default config;
