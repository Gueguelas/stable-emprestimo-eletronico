import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { contextoAtual } from "../request-context/contexto";

export interface LinhaEquipamento {
  id: string;
  nome: string;
  categoria: string;
  patrimonio: string;
  situacao: string;
  observacao: string | null;
  cadastradoEm: Date;
  emprestimos: Array<{
    prazoEm: Date;
    user: { nome: string };
  }>;
}

const SELECT_COM_EMPRESTIMO = {
  id: true,
  nome: true,
  categoria: true,
  patrimonio: true,
  situacao: true,
  observacao: true,
  cadastradoEm: true,
  emprestimos: {
    where: { devolvidoEm: null },
    take: 1,
    select: {
      prazoEm: true,
      user: { select: { nome: true } }
    }
  }
} satisfies Prisma.EquipamentoSelect;

@Injectable()
export class EquipamentosRepository {
  constructor(private readonly prisma: PrismaService) {}

  // O tenant nunca entra por parâmetro: vem do AsyncLocalStorage,
  // preenchido pelo guard a partir do JWT (ADR-001, seção 6).
  private tenantId(): string {
    return contextoAtual().exigir().tenantId;
  }

  async listar(limite: number, cursor?: string): Promise<LinhaEquipamento[]> {
    const onde: Prisma.EquipamentoWhereInput = { tenantId: this.tenantId() };

    if (cursor) {
      const decodificado = Buffer.from(cursor, "base64").toString("utf8");
      const [dataIso, id] = decodificado.split("|");
      if (!dataIso || !id) {
        throw new Error("Cursor inválido");
      }
      const data = new Date(dataIso);
      onde.OR = [
        { cadastradoEm: { lt: data } },
        { cadastradoEm: { equals: data }, id: { lt: id } }
      ];
    }

    // take limite + 1 para saber se existe próxima página.
    return this.prisma.equipamento.findMany({
      where: onde,
      orderBy: [{ cadastradoEm: "desc" }, { id: "desc" }],
      take: limite + 1,
      select: SELECT_COM_EMPRESTIMO
    });
  }
}
