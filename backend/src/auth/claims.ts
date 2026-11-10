import { UnauthorizedException } from "@nestjs/common";
import { z } from "zod";

export function identidadeDoJwt(payload: Record<string, unknown>) {
  const metadata = payload.app_metadata;
  const interno =
    typeof metadata === "object" && metadata !== null
      ? (metadata as Record<string, unknown>).tenant_id
      : undefined;
  const superior = payload.tenant_id;
  if (superior !== undefined && interno !== undefined && superior !== interno) {
    throw new UnauthorizedException("Token com tenants divergentes");
  }
  const id = z.string().uuid();
  const user = id.safeParse(payload.sub);
  const tenant = id.safeParse(superior ?? interno);
  if (!user.success || !tenant.success) {
    throw new UnauthorizedException("Token sem usuário ou tenant válido");
  }
  return { userId: user.data, tenantId: tenant.data };
}
