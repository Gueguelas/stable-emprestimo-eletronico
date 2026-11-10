import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { Inject } from "@nestjs/common";
import { ENV, Env } from "../env";

// Conexão de runtime via DATABASE_URL (pooler na Vercel);
// migrations usam directUrl (ADR-001, seção 5).
// Sem $connect no boot: GET /health não depende do banco.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(@Inject(ENV) env: Env) {
    super({
      datasources: {
        db: { url: env.DATABASE_URL }
      }
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
