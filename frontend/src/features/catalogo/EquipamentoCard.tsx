import type { Equipamento } from "@/api/schemas";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { detalheEquipamento, rotuloSituacao } from "./situacao";
import { acaoDoCard } from "@/features/emprestimos/regras";
import type { Emprestimo } from "@/stores/emprestimosMock";

const nomesCategoria: Record<Equipamento["categoria"], string> = {
  notebook: "NOTEBOOK",
  monitor: "MONITOR",
  cabo: "CABO",
  camera: "CÂMERA",
  acessorio: "ACESSÓRIO"
};

export function EquipamentoCard({
  equipamento,
  nome,
  emprestimos,
  solicitar
}: {
  equipamento: Equipamento;
  nome: string;
  emprestimos: Emprestimo[];
  solicitar: (equipamento: Equipamento) => void;
}) {
  const acao = acaoDoCard(equipamento, nome, emprestimos);
  const situacao = rotuloSituacao(equipamento);
  const tipo =
    equipamento.situacao === "em_manutencao"
      ? "manutencao"
      : situacao === "Emprestado"
        ? "emprestado"
        : "disponivel";
  return (
    <Card className="equipment-card">
      <div className="equipment-card-top">
        <span className="eyebrow">{nomesCategoria[equipamento.categoria]}</span>
        <Pill tipo={tipo}>{situacao}</Pill>
      </div>
      <h2>{equipamento.nome}</h2>
      <p className="micro-copy">{equipamento.patrimonio}</p>
      <p className="equipment-detail">{detalheEquipamento(equipamento)}</p>
      <Button
        block
        variant={acao.variante}
        disabled={!acao.habilitada}
        onClick={() => solicitar(equipamento)}
      >
        {acao.texto}
      </Button>
    </Card>
  );
}
