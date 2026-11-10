import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { Request } from "express";
import { Inject } from "@nestjs/common";
import { ENV, Env } from "../env";
import { contextoAtual } from "../request-context/contexto";
import { ROTA_PUBLICA } from "./publico";
import { identidadeDoJwt } from "./claims";
import { PrismaService } from "../prisma/prisma.service";

// Valida o JWT do Supabase Auth contra o JWKS e resolve tenant_id do claim.
// ADR-001, seções 6 e 7: o tenant vem do token, nunca do cliente.
@Injectable()
export class JwtGuard implements CanActivate {
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;
  private readonly issuer: string;

  constructor(
    private readonly reflector: Reflector,
    @Inject(ENV) env: Env,
    private readonly prisma: PrismaService,
  ) {
    this.jwks = createRemoteJWKSet(
      new URL(`${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`),
    );
    this.issuer = `${env.SUPABASE_URL}/auth/v1`;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const publica = this.reflector.getAllAndOverride<boolean>(ROTA_PUBLICA, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (publica) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const cabecalho = req.headers.authorization;
    const token = cabecalho?.replace(/^Bearer\s+/i, "");
    if (!token) {
      throw new UnauthorizedException("Token ausente");
    }

    let payload: Record<string, unknown>;
    try {
      const verificado = await jwtVerify(token, this.jwks, {
        issuer: this.issuer,
        audience: "authenticated",
      });
      payload = verificado.payload as Record<string, unknown>;
    } catch {
      throw new UnauthorizedException("Token inválido ou expirado");
    }

    const { userId, tenantId } = identidadeDoJwt(payload);
    const membership = await this.prisma.membership.findUnique({
      where: { tenantId_userId: { tenantId, userId } },
    });
    if (!membership)
      throw new ForbiddenException("Usuário sem vínculo com o tenant");

    const store = contextoAtual();
    store.tenantId = tenantId;
    store.userId = userId;
    return true;
  }
}
