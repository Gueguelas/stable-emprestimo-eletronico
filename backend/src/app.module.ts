import { Module } from "@nestjs/common";
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { ZodSerializerInterceptor } from "nestjs-zod";
import { EnvModule } from "./env";
import { PrismaModule } from "./prisma/prisma.module";
import { JwtGuard } from "./auth/jwt.guard";
import { ProblemDetailsFilter } from "./erros/problem-details.filter";
import { ContextoMiddleware } from "./request-context/contexto.middleware";
import { MiddlewareConsumer, NestModule } from "@nestjs/common";
import { EquipamentosModule } from "./equipamentos/equipamentos.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [EnvModule, PrismaModule, EquipamentosModule, HealthModule],
  providers: [
    // Guard nomeado + APP_GUARD via useExisting: um único guard no container,
    // o que permite substituí-lo nos testes (overrideProvider(JwtGuard)).
    JwtGuard,
    { provide: APP_GUARD, useExisting: JwtGuard },
    // Serializa as respostas pelo schema Zod que também gera o OpenAPI.
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    { provide: APP_FILTER, useClass: ProblemDetailsFilter }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(ContextoMiddleware).forRoutes("*");
  }
}
