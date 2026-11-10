import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { contextoAtual } from "../request-context/contexto";
import { LIMITE, prazoDe } from "./regras";

const include = { equipamento: true } satisfies Prisma.EmprestimoInclude;

@Injectable()
export class EmprestimosRepository {
  constructor(private readonly prisma: PrismaService) {}

  listar() {
    const { tenantId, userId } = contextoAtual().exigir();
    return this.prisma.emprestimo.findMany({
      where: { tenantId, userId, devolvidoEm: null },
      include,
      orderBy: [{ prazoEm: "asc" }, { id: "asc" }],
    });
  }

  membership() {
    const { tenantId, userId } = contextoAtual().exigir();
    return this.prisma.membership.findUnique({
      where: { tenantId_userId: { tenantId, userId } },
      include: { user: true },
    });
  }

  async solicitar(equipamentoId: string, hoje: string) {
    const { tenantId, userId } = contextoAtual().exigir();
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          // Ordem fixa: membership → equipamento. Locks duram até commit/rollback.
          const membros = await tx.$queryRaw<Array<{ id: string }>>`
          select id from memberships where tenant_id = ${tenantId}::uuid
          and user_id = ${userId}::uuid for update`;
          if (!membros.length)
            throw new ForbiddenException("Usuário sem vínculo com o tenant");
          const itens = await tx.$queryRaw<Array<{ situacao: string }>>`
          select situacao from equipamentos where id = ${equipamentoId}::uuid
          and tenant_id = ${tenantId}::uuid for update`;
          const item = itens[0];
          if (!item) throw new NotFoundException("Equipamento não encontrado");
          if (item.situacao !== "disponivel")
            throw new ConflictException("Equipamento em manutenção");
          const ocupado = await tx.emprestimo.findFirst({
            where: { tenantId, equipamentoId, devolvidoEm: null },
          });
          if (ocupado) throw new ConflictException("Equipamento já emprestado");
          const meus = await tx.emprestimo.findMany({
            where: { tenantId, userId, devolvidoEm: null },
            select: { prazoEm: true },
          });
          if (meus.some((e) => e.prazoEm.toISOString().slice(0, 10) < hoje)) {
            throw new UnprocessableEntityException(
              "Bloqueado por empréstimo em atraso",
            );
          }
          if (meus.length >= LIMITE)
            throw new UnprocessableEntityException(
              "Limite de 3 itens atingido",
            );
          return tx.emprestimo.create({
            data: {
              tenantId,
              userId,
              equipamentoId,
              retiradaEm: new Date(hoje),
              prazoEm: new Date(prazoDe(hoje)),
            },
            include,
          });
        },
        { maxWait: 10000, timeout: 15000 },
      );
    } catch (erro) {
      if (
        erro instanceof Prisma.PrismaClientKnownRequestError &&
        erro.code === "P2002"
      ) {
        throw new ConflictException("Equipamento já emprestado");
      }
      throw erro;
    }
  }
}
