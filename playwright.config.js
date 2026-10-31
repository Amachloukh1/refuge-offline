import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  outputDir: ".playwright",
  workers: 1,
  retries: 0,
  webServer: {
    command: "node --env-file-if-exists=.env server/index.js",
    url: "http://127.0.0.1:8099",
    reuseExistingServer: true,
    timeout: 60000,
  },
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:8099",
    browserName: "chromium",
    channel: "chrome",
    headless: true,
    viewport: { width: 1536, height: 1024 },
  },
  reporter: "list",
});
