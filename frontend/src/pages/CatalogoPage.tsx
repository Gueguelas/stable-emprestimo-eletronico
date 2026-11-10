import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Equipamento } from "@/api/schemas";
import { useEquipamentos } from "@/api/useEquipamentos";
import { useDadosEmprestimos, useSolicitar } from "@/api/useEmprestimos";
import { EquipamentoCard } from "@/features/catalogo/EquipamentoCard";
import { filtrarEquipamentos } from "@/features/emprestimos/regras";
import { formatarData } from "@/lib/datas";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SectionRule } from "@/components/ui/section-rule";
import { useToast } from "@/stores/toast";
const filtros = [
  ["todos", "Todos"],
  ["disponivel", "Disponíveis"],
  ["emprestado", "Emprestados"],
  ["em_manutencao", "Em manutenção"],
];
export function CatalogoPage() {
  const { data = [], isLoading, error, refetch } = useEquipamentos();
  const { sessao, emprestimos } = useDadosEmprestimos();
  const solicitar = useSolicitar();
  const enviando = useRef(false);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [selecionado, setSelecionado] = useState<Equipamento | null>(null);
  const [erroSolicitacao, setErroSolicitacao] = useState<string | null>(null);
  const toast = useToast((s) => s.mostrar);
  const listagem = useMemo(() => filtrarEquipamentos(data, busca, filtro), [data, busca, filtro]);
  const meus = emprestimos.data?.itens ?? [];
  const pronto =
    sessao.isSuccess && emprestimos.isSuccess && !sessao.isError && !emprestimos.isError;
  const hoje = sessao.data?.hoje ?? "";
  const bloqueado = pronto && meus.some((i) => i.prazo < hoje);
  async function confirmar() {
    if (!selecionado || enviando.current || !pronto) return;
    enviando.current = true;
    setErroSolicitacao(null);
    try {
      const resultado = await solicitar.mutateAsync(selecionado.id);
      setSelecionado(null);
      toast(`Empréstimo confirmado. Devolver até ${formatarData(resultado.prazo)}.`);
    } catch (e) {
      setErroSolicitacao(e instanceof Error ? e.message : "Não foi possível solicitar.");
    } finally {
      enviando.current = false;
    }
  }
  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">EQUIPAMENTOS</p>
          <h1>Catálogo</h1>
          <p className="subheading">
            {data.filter((i) => i.situacao === "disponivel").length} de {data.length} equipamentos
            disponíveis agora
          </p>
        </div>
        <label className="search-field">
          <span className="sr-only">Buscar equipamento</span>
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou patrimônio"
          />
        </label>
      </section>
      <SectionRule />
      {(sessao.isError || emprestimos.isError) && (
        <div className="alert-banner" role="alert">
          <span>
            Não foi possível carregar os dados da sua conta. As solicitações estão bloqueadas.
          </span>
          <Button
            variant="secondary"
            onClick={() => {
              void sessao.refetch();
              void emprestimos.refetch();
            }}
          >
            Tentar novamente
          </Button>
        </div>
      )}
      {bloqueado && (
        <div className="alert-banner" role="alert">
          <span>Você tem um empréstimo em atraso e não pode solicitar outro item.</span>
          <Link to="/meus-emprestimos">Ver meus empréstimos</Link>
        </div>
      )}
      <div className="filter-row" aria-label="Filtrar equipamentos">
        {filtros.map(([valor, rotulo]) => (
          <button
            key={valor}
            className={`filter-chip${filtro === valor ? " selected" : ""}`}
            aria-pressed={filtro === valor}
            onClick={() => setFiltro(valor!)}
          >
            {rotulo}
          </button>
        ))}
      </div>
      {isLoading ? (
        <div className="empty-state" role="status">
          Carregando equipamentos…
        </div>
      ) : error ? (
        <div className="error-state" role="alert">
          <h2>Não foi possível carregar o catálogo</h2>
          <p>{error.message}</p>
          <Button variant="secondary" onClick={() => void refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : !listagem.length ? (
        <div className="empty-state">
          {busca ? "Nenhum equipamento corresponde à busca." : "Nenhum equipamento nesta situação."}
        </div>
      ) : (
        <div className="equipment-grid">
          {listagem.map((item) => (
            <EquipamentoCard
              key={item.id}
              equipamento={item}
              emprestimos={meus}
              hoje={hoje}
              pronto={pronto && !solicitar.isPending}
              solicitar={(item) => {
                setErroSolicitacao(null);
                setSelecionado(item);
              }}
            />
          ))}
        </div>
      )}
      <p className="photo-credit">
        <a href="https://pixabay.com/pt/" target="_blank" rel="noreferrer">
          Fotos: Pixabay
        </a>
      </p>
      <Dialog
        aberto={Boolean(selecionado)}
        aoFechar={() => {
          if (!enviando.current) setSelecionado(null);
        }}
        titulo="Solicitar empréstimo"
        confirmar={() => void confirmar()}
        confirmando={solicitar.isPending || !pronto}
        textoConfirmar={solicitar.isPending ? "Solicitando…" : "Confirmar solicitação"}
      >
        <div className="dialog-body">
          <p>Confirme o item que deseja retirar no balcão.</p>
          <div className="dialog-summary">
            <span>Equipamento</span>
            <strong>{selecionado?.nome}</strong>
            <span>Devolver até</span>
            <strong>{formatarData(sessao.data?.prazoPrevisto ?? null)}</strong>
          </div>
          {erroSolicitacao && <p role="alert">{erroSolicitacao}</p>}
        </div>
      </Dialog>
    </>
  );
}
