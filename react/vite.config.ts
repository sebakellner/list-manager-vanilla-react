import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: [fileURLToPath(new URL("..", import.meta.url))],
    },
  },
  test: {
    include: [
      "src/**/__tests__/**/*.spec.{ts,tsx}",
      "tests/units/**/*.spec.{ts,tsx}",
    ],
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
