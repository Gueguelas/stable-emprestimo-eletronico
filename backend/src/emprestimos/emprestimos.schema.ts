import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const solicitarSchema = z
  .object({ equipamentoId: z.string().uuid() })
  .strict();
export class SolicitarDto extends createZodDto(solicitarSchema) {}

export const emprestimoSchema = z.object({
  id: z.string().uuid(),
  equipamentoId: z.string().uuid(),
  equipamento: z.string(),
  patrimonio: z.string(),
  categoria: z.enum(["notebook", "monitor", "cabo", "camera", "acessorio"]),
  retirada: z.string(),
  prazo: z.string(),
});
export class EmprestimoDto extends createZodDto(emprestimoSchema) {}
export class EmprestimosDto extends createZodDto(
  z.object({ itens: z.array(emprestimoSchema) }),
) {}
export class AbertosQueryDto extends createZodDto(
  z.object({ status: z.literal("abertos").default("abertos") }).strict(),
) {}
export class SessaoDto extends createZodDto(
  z.object({
    userId: z.string().uuid(),
    tenantId: z.string().uuid(),
    nome: z.string(),
    email: z.string(),
    papel: z.enum(["colaborador", "operacoes"]),
    hoje: z.string(),
    prazoPrevisto: z.string(),
    limite: z.number(),
  }),
) {}
