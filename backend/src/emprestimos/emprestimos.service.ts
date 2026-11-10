import { ForbiddenException, Injectable } from "@nestjs/common";
import { EmprestimosRepository } from "./emprestimos.repository";
import { Relogio, hojeSaoPaulo, LIMITE, prazoDe } from "./regras";
import { EmprestimoDto } from "./emprestimos.schema";

type Linha = Awaited<ReturnType<EmprestimosRepository["listar"]>>[number];

function dto(linha: Linha): EmprestimoDto {
  return {
    id: linha.id,
    equipamentoId: linha.equipamentoId,
    equipamento: linha.equipamento.nome,
    patrimonio: linha.equipamento.patrimonio,
    categoria: linha.equipamento.categoria,
    retirada: linha.retiradaEm.toISOString().slice(0, 10),
    prazo: linha.prazoEm.toISOString().slice(0, 10),
  };
}

@Injectable()
export class EmprestimosService {
  constructor(
    private readonly repository: EmprestimosRepository,
    private readonly relogio: Relogio,
  ) {}
  async listar() {
    return { itens: (await this.repository.listar()).map(dto) };
  }
  async solicitar(id: string) {
    return dto(
      await this.repository.solicitar(id, hojeSaoPaulo(this.relogio.agora())),
    );
  }
  async sessao() {
    const membro = await this.repository.membership();
    if (!membro)
      throw new ForbiddenException("Usuário sem vínculo com o tenant");
    const hoje = hojeSaoPaulo(this.relogio.agora());
    return {
      userId: membro.userId,
      tenantId: membro.tenantId,
      nome: membro.user.nome,
      email: membro.user.email,
      papel: membro.papel,
      hoje,
      prazoPrevisto: prazoDe(hoje),
      limite: LIMITE,
    };
  }
}
