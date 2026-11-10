import { z } from "zod";

export const equipamentoSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(1),
  categoria: z.enum(["notebook", "monitor", "cabo", "camera", "acessorio"]),
  patrimonio: z.string().min(1),
  situacao: z.enum(["disponivel", "emprestado", "em_manutencao"]),
  comPessoa: z.string().nullable(),
  prazo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  observacao: z.string().nullable()
});

export const listaEquipamentosSchema = z.object({
  itens: z.array(equipamentoSchema),
  proximoCursor: z.string().nullable()
});

export type Equipamento = z.infer<typeof equipamentoSchema>;
export type ListaEquipamentos = z.infer<typeof listaEquipamentosSchema>;
