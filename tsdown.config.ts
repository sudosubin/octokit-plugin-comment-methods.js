import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "./src/index.ts",
  clean: true,
  dts: true,
  format: ["cjs", "esm"],
  sourcemap: true,
  minify: true,
});
