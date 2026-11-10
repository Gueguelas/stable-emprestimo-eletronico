import "reflect-metadata";
import { Test } from "@nestjs/testing";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { AppModule } from "../src/app.module";
import { ENV } from "../src/env";
import { documentoOpenApi } from "../src/openapi";

async function main() {
  // Só constrói metadados. Nenhuma conexão ou chave real é necessária.
  const modulo = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(ENV)
    .useValue({
      DATABASE_URL: "postgresql://local:local@127.0.0.1:5432/nao_conectar",
      SUPABASE_URL: "http://127.0.0.1:54321",
      NODE_ENV: "test",
      PORT: 3000,
    })
    .compile();
  const app = modulo.createNestApplication();
  app.setGlobalPrefix("v1", { exclude: ["health"] });
  writeFileSync(
    resolve(__dirname, "../openapi.json"),
    JSON.stringify(documentoOpenApi(app), null, 2) + "\n",
  );
  await app.close();
}
main().catch(() => {
  console.error("Falha ao exportar OpenAPI");
  process.exitCode = 1;
});
