import { Injectable } from "@nestjs/common";
import { EquipamentosRepository, LinhaEquipamento } from "./equipamentos.repository";
import { EquipamentoRespostaDto } from "./equipamentos.schema";

export interface ListaEquipamentos {
  itens: EquipamentoRespostaDto[];
  proximoCursor: string | null;
}

@Injectable()
export class EquipamentosService {
  constructor(private readonly repository: EquipamentosRepository) {}

  async listar(limite: number, cursor?: string): Promise<ListaEquipamentos> {
    const linhas = await this.repository.listar(limite, cursor);
    const temProximaPagina = linhas.length > limite;
    const pagina = temProximaPagina ? linhas.slice(0, limite) : linhas;
    const ultima = pagina[pagina.length - 1];

    return {
      itens: pagina.map((linha) => this.paraDto(linha)),
      proximoCursor:
        temProximaPagina && ultima ? this.codificarCursor(ultima) : null
    };
  }

  // A situação de resposta é derivada aqui — o banco nunca guarda "emprestado".
  private paraDto(linha: LinhaEquipamento): EquipamentoRespostaDto {
    const emprestimoAberto = linha.emprestimos[0];
    const situacao =
      linha.situacao === "em_manutencao"
        ? "em_manutencao"
        : emprestimoAberto
          ? "emprestado"
          : "disponivel";

    return {
      id: linha.id,
      nome: linha.nome,
      categoria: linha.categoria as EquipamentoRespostaDto["categoria"],
      patrimonio: linha.patrimonio,
      situacao,
      comPessoa: emprestimoAberto ? emprestimoAberto.user.nome : null,
      prazo: emprestimoAberto
        ? emprestimoAberto.prazoEm.toISOString().slice(0, 10)
        : null,
      observacao: linha.observacao
    };
  }

  private codificarCursor(linha: LinhaEquipamento): string {
    return Buffer.from(`${linha.cadastradoEm.toISOString()}|${linha.id}`, "utf8").toString(
      "base64"
    );
  }
}
