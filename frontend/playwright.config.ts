import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"]
  },
  webServer: {
<<<<<<< HEAD
    command: "npm run dev -- --host 127.0.0.1 --port 5173",
=======
    command: "npm run dev",
>>>>>>> a52456606c59e2feef60eb067f786b93e23ae2a1
    url: "http://127.0.0.1:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
