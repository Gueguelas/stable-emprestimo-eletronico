import "reflect-metadata";
import express from "express";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import serverlessExpress from "@vendia/serverless-express";
import helmet from "helmet";
import { AppModule } from "./app.module";

// Instância cacheada fora do handler — sem isso cada invocação paga o
// bootstrap do Nest (ADR-001, seção 3).
let handlerCacheado: ReturnType<typeof serverlessExpress> | undefined;

export async function bootstrap(): Promise<ReturnType<typeof serverlessExpress>> {
  if (handlerCacheado) {
    return handlerCacheado;
  }

  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter);
  app.use(helmet());
  app.setGlobalPrefix("v1", { exclude: ["health"] });
  app.enableCors({
    origin: process.env.FRONT_ORIGIN?.split(",") ?? true,
    credentials: true
  });
  await app.init();

  handlerCacheado = serverlessExpress({ app: expressApp });
  return handlerCacheado;
}

export async function handler(
  evento: unknown,
  contexto: unknown
): Promise<unknown> {
  const servidor = await bootstrap();
  return servidor(evento as never, contexto as never, undefined as never);
}
