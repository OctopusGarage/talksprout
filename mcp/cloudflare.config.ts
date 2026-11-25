import { defineConfig } from "cf/config";
import config from "../distribution/config.json" with { type: "json" };
export default defineConfig({
  accountId: config.cloudflareAccountId,
  worker: {
    name: config.workerName,
    entrypoint: "./src/index.ts",
    previewUrls: false,
    compatibilityDate: "2026-11-25",
    compatibilityFlags: ["nodejs_compat"],
    observability: { enabled: false },
  },
});
