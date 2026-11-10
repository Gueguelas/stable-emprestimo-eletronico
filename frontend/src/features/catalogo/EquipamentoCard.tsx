import { useState } from "react";
import type { Equipamento } from "@/api/schemas";
import type { EmprestimoDto } from "@/api/generated/model";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { acaoReal } from "@/features/emprestimos/regrasReais";
const categorias = {
  notebook: "NOTEBOOK",
  monitor: "MONITOR",
  cabo: "CABO",
  camera: "CÂMERA",
  acessorio: "ACESSÓRIO",
};
export function EquipamentoCard({
  equipamento: item,
  emprestimos,
  hoje,
  pronto,
  solicitar,
}: {
  equipamento: Equipamento;
  emprestimos: EmprestimoDto[];
  hoje: string;
  pronto: boolean;
  solicitar: (e: Equipamento) => void;
}) {
  const [falhou, setFalhou] = useState(false);
  const texto = acaoReal(item, emprestimos, hoje, pronto);
  const disponivel = item.situacao === "disponivel";
  const rotulo = disponivel
    ? "Disponível"
    : item.situacao === "emprestado"
      ? "Emprestado"
      : "Em manutenção";
  return (
    <Card className="equipment-card">
      {item.imagemUrl && !falhou ? (
        <img
          className="equipment-photo"
          src={item.imagemUrl}
          alt={item.nome}
          loading="lazy"
          onError={() => setFalhou(true)}
        />
      ) : (
        <div
          className="equipment-photo equipment-photo-empty"
          role="img"
          aria-label={`Imagem indisponível: ${item.nome}`}
        >
          Imagem indisponível
        </div>
      )}
      <div className="equipment-card-top">
        <span className="eyebrow">{categorias[item.categoria]}</span>
        <Pill
          tipo={
            disponivel ? "disponivel" : item.situacao === "emprestado" ? "emprestado" : "manutencao"
          }
        >
          {rotulo}
        </Pill>
      </div>
      <h2>{item.nome}</h2>
      <p className="micro-copy">{item.patrimonio}</p>
      <p className="equipment-detail">
        {disponivel
          ? "Pronto para retirada no balcão"
          : item.situacao === "em_manutencao"
            ? item.observacao || "Equipamento em manutenção"
            : "Equipamento em uso"}
      </p>
      <Button
        block
        variant={texto === "Solicitar empréstimo" ? "primary" : "secondary"}
        disabled={texto !== "Solicitar empréstimo"}
        onClick={() => solicitar(item)}
      >
        {texto}
      </Button>
    </Card>
  );
}
