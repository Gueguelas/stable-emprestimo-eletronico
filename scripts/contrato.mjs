import { spawnSync } from "node:child_process";
import { copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
for (const dir of ["backend", "frontend"]) {
  if (dir === "frontend")
    copyFileSync(`${root}backend/openapi.json`, `${root}frontend/openapi.json`);
  const r = spawnSync(
    "npm",
    ["run", dir === "backend" ? "openapi" : "generate"],
    { cwd: `${root}${dir}`, stdio: "inherit" },
  );
  if (r.status !== 0) process.exit(r.status ?? 1);
}
