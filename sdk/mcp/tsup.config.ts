import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    server: "src/server.ts",
    cli:    "src/cli.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  target: "node18",
});

