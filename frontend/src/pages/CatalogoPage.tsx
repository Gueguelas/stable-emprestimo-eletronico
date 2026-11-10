import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Equipamento } from "@/api/schemas";
import { useEquipamentos } from "@/api/useEquipamentos";
import { EquipamentoCard } from "@/features/catalogo/EquipamentoCard";
import { filtrarEquipamentos } from "@/features/emprestimos/regras";
import { useContextoUsuario } from "@/features/emprestimos/useContextoUsuario";
import { adicionarDias, formatarData, HOJE_MOCK } from "@/lib/datas";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SectionRule } from "@/components/ui/section-rule";
import { useToast } from "@/stores/toast";

const filtros = [
  ["todos", "Todos"],
  ["disponivel", "Disponíveis"],
  ["emprestado", "Emprestados"],
  ["em_manutencao", "Em manutenção"]
];

export function CatalogoPage() {
  const { data = [], isLoading, error, refetch } = useEquipamentos();
  const { usuario, meus, todos } = useContextoUsuario();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [selecionado, setSelecionado] = useState<Equipamento | null>(null);
  const mostrarToast = useToast((estado) => estado.mostrar);
  const listagem = useMemo(
    () => filtrarEquipamentos(data, busca, filtro),
    [data, busca, filtro]
  );
  const disponiveis = data.filter(
    (item) => item.situacao === "disponivel" && !item.comPessoa
  ).length;
  const bloqueadoPorAtraso = meus.some((item) => item.prazo < HOJE_MOCK);

  function confirmarSolicitacao() {
    setSelecionado(null);
    mostrarToast("Solicitações de empréstimo estarão disponíveis em breve.");
  }

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">EQUIPAMENTOS</p>
          <h1>Catálogo</h1>
          <p className="subheading">
            {disponiveis} de {data.length} equipamentos disponíveis agora
          </p>
        </div>
        <label className="search-field">
          <span className="sr-only">Buscar equipamento</span>
          <Input
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar por nome ou patrimônio"
          />
        </label>
      </section>
      <SectionRule />
      {bloqueadoPorAtraso && (
        <div className="alert-banner" role="alert">
          <span>Você tem um empréstimo em atraso e não pode solicitar outro item.</span>
          <Link to="/meus-emprestimos">Ver meus empréstimos →</Link>
        </div>
      )}
      <div className="filter-row" aria-label="Filtrar equipamentos">
        {filtros.map(([valor, rotulo]) => (
          <button
            key={valor}
            className={`filter-chip${filtro === valor ? " selected" : ""}`}
            aria-pressed={filtro === valor}
            onClick={() => setFiltro(valor)}
          >
            {rotulo}
          </button>
        ))}
      </div>
      {isLoading ? (
        <div className="empty-state" role="status">Carregando equipamentos…</div>
      ) : error ? (
        <div className="error-state" role="alert">
          <h2>Não foi possível carregar o catálogo</h2>
          <p>{error.message}</p>
          <Button variant="secondary" onClick={() => void refetch()}>Tentar novamente</Button>
        </div>
      ) : listagem.length === 0 ? (
        <div className="empty-state">
          {busca ? "Nenhum equipamento corresponde à busca." : "Nenhum equipamento nesta situação."}
        </div>
      ) : (
        <div className="equipment-grid">
          {listagem.map((equipamento) => (
            <EquipamentoCard
              key={equipamento.id}
              equipamento={equipamento}
              nome={usuario?.nome ?? ""}
              emprestimos={todos.filter((item) => item.pessoa === usuario?.nome)}
              solicitar={setSelecionado}
            />
          ))}
        </div>
      )}
      <Dialog
        aberto={Boolean(selecionado)}
        aoFechar={() => setSelecionado(null)}
        titulo="Solicitar empréstimo"
        confirmar={confirmarSolicitacao}
        textoConfirmar="Confirmar solicitação"
      >
        <div className="dialog-body">
          <p>Confirme o item que deseja retirar no balcão.</p>
          <div className="dialog-summary">
            <span>Equipamento</span><strong>{selecionado?.nome}</strong>
            <span>Devolver até</span><strong>{formatarData(adicionarDias(HOJE_MOCK, 14))}</strong>
          </div>
        </div>
      </Dialog>
    </>
  );
}
