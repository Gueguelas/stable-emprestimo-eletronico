import { createZodDto } from "nestjs-zod";
import { z } from "zod";

// Situação DERIVADA, nunca armazenada: "emprestado" vem do empréstimo
// em aberto (regra do AGENTS.md — estado derivado no render/consumidor).
export const situacaoSchema = z.enum(["disponivel", "emprestado", "em_manutencao"]);

export const equipamentoSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(1),
  categoria: z.enum(["notebook", "monitor", "cabo", "camera", "acessorio"]),
  patrimonio: z.string().min(1),
  situacao: situacaoSchema,
  comPessoa: z.string().nullable(),
  prazo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  observacao: z.string().nullable()
});

export const listaEquipamentosSchema = z.object({
  itens: z.array(equipamentoSchema),
  proximoCursor: z.string().nullable()
});

export const listaEquipamentosQuerySchema = z.object({
  limite: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().optional()
});

export class EquipamentoRespostaDto extends createZodDto(equipamentoSchema) {}
export class ListaEquipamentosDto extends createZodDto(listaEquipamentosSchema) {}
export class ListaEquipamentosQueryDto extends createZodDto(listaEquipamentosQuerySchema) {}
