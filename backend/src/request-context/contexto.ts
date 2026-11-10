import { AsyncLocalStorage } from "node:async_hooks";

// Contexto de request com tenant_id e user_id (ADR-001, seção 3).
// O tenant vem do JWT, resolvido no guard — nunca do body ou da query.
export class ContextoRequest {
  tenantId?: string;
  userId?: string;

  exigir(): { tenantId: string; userId: string } {
    if (!this.tenantId || !this.userId) {
      throw new Error("Contexto de request ausente — o guard precisa rodar antes");
    }
    return { tenantId: this.tenantId, userId: this.userId };
  }
}

export const als = new AsyncLocalStorage<ContextoRequest>();

export function contextoAtual(): ContextoRequest {
  const store = als.getStore();
  if (!store) {
    // Cai aqui em chamadas fora do escopo do request (ex.: job, boot).
    return new ContextoRequest();
  }
  return store;
}
