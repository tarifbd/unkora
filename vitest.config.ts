import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "apps/*/src/**/*.test.ts"],
    exclude: ["node_modules", "dist", ".next"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["packages/utils/src/**", "apps/*/src/**"],
      exclude: ["**/*.test.ts", "**/node_modules/**"],
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      "@unkora/utils": new URL("./packages/utils/src/index.ts", import.meta.url).pathname,
      "@unkora/types": new URL("./packages/types/index.ts", import.meta.url).pathname,
    },
  },
});
