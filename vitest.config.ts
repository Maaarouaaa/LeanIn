import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  // Keep unit tests on the in-memory adapter; do not auto-load .env.local.
  envDir: false,
  test: {
    environment: "node",
    include: ["src/__tests__/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
