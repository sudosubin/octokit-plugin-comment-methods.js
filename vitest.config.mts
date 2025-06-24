import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "dist/",
        "node_modules/",
        "tests/",
        "**/*.d.ts",
        "**/*.config.{js,ts}",
      ],
      include: ["src/**/*.ts"],
    },
  },
});
