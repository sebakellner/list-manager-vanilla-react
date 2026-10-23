import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "react-chromium",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://127.0.0.1:4173/",
      },
    },
    {
      name: "vanilla-chromium",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://127.0.0.1:4174/vanilla/",
      },
    },
  ],
  webServer: [
    {
      command: "pnpm --filter technical-proof-react exec vite --host 127.0.0.1 --port 4173 --strictPort",
      url: "http://127.0.0.1:4173/",
      reuseExistingServer: false,
    },
    {
      command: "pnpm exec serve . --config serve.json --listen tcp://127.0.0.1:4174 --no-clipboard",
      url: "http://127.0.0.1:4174/vanilla/",
      reuseExistingServer: false,
    },
  ],
});
