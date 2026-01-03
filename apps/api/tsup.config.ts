import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  target: "node18",
  outDir: "dist",
  clean: true,
  bundle: true,
  noExternal: ["@repo/db"],
  skipNodeModulesBundle: true, 
  sourcemap: false,
  dts: false,  
});