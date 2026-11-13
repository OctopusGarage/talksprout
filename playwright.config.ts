import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "*.spec.ts",
  use: {
    locale: "zh-CN",
    baseURL: "http://127.0.0.1:4173",
    viewport: { width: 390, height: 844 },
  },
  webServer: {
    command: "pnpm preview --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
  },
  workers: 1,
});
