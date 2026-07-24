import { defineConfig } from "vitest/config";
import path from "node:path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Keep unit tests on the in-memory adapter; do not auto-load .env.local.
  envDir: false,
  plugins: [react()],
  test: {
    environment: "node",
    include: ["src/__tests__/**/*.{test,spec}.{ts,tsx}"],
    setupFiles: ["./src/__tests__/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
