import { execFileSync } from "node:child_process";
// Descobre o socket do contexto local (Docker Desktop/OrbStack), sem alterar
// configurações do usuário. Testcontainers não lê contextos do Docker CLI.
if (!process.env.DOCKER_HOST) {
  try {
    const host = execFileSync(
      "docker",
      ["context", "inspect", "--format", "{{.Endpoints.docker.Host}}"],
      { encoding: "utf8" },
    ).trim();
    if (!host.startsWith("unix://"))
      throw new Error("Testes exigem Docker local");
    process.env.DOCKER_HOST = host;
  } catch {
    /* Testcontainers apresenta o diagnóstico se não houver runtime. */
  }
}
