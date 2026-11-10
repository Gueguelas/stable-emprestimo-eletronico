import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { carregarEnv } from "./env";

// Bootstrap local (npm run start:dev). Em produção na Vercel quem serve é
// o handler serverless (serverless.ts) com instância cacheada — ADR-001, seção 3.
async function bootstrap(): Promise<void> {
  const env = carregarEnv();

  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.use(
    pinoHttp({
      // Log em JSON com tenant no contexto — ADR-001, seção 9.
      autoLogging: false,
      genReqId: () => crypto.randomUUID()
    })
  );
  app.setGlobalPrefix("v1", { exclude: ["health"] });
  app.enableCors({
    origin: process.env.FRONT_ORIGIN?.split(",") ?? true,
    credentials: true
  });

  await app.listen(env.PORT);
  console.log(`Stable API em http://localhost:${env.PORT} — GET /health e /v1`);
}

void bootstrap();
