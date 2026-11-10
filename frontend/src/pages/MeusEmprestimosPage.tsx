import { Link } from "react-router-dom";
import { useDadosEmprestimos } from "@/api/useEmprestimos";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { SectionRule } from "@/components/ui/section-rule";
import { formatarData } from "@/lib/datas";
export function MeusEmprestimosPage() {
  const { sessao, emprestimos } = useDadosEmprestimos();
  const meus = emprestimos.data?.itens ?? [];
  const hoje = sessao.data?.hoje ?? "";
  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">VISÃO PESSOAL</p>
          <h1>Meus empréstimos</h1>
          <p className="subheading">
            {meus.length} de 3 itens em seu nome · prazo padrão de 14 dias
          </p>
        </div>
      </section>
      <div className="loan-slots" aria-label={`${meus.length} de 3 itens emprestados`}>
        {[0, 1, 2].map((n) => (
          <span
            key={n}
            className={`loan-slot ${meus[n] ? (meus[n].prazo < hoje ? "overdue" : "occupied") : ""}`}
          />
        ))}
      </div>
      <SectionRule />
      {sessao.isPending || emprestimos.isPending ? (
        <p role="status">Carregando empréstimos…</p>
      ) : sessao.isError || emprestimos.isError ? (
        <div role="alert" className="error-state">
          <p>{emprestimos.error?.message || sessao.error?.message}</p>
          <Button
            onClick={() => {
              void sessao.refetch();
              void emprestimos.refetch();
            }}
          >
            Tentar novamente
          </Button>
        </div>
      ) : !meus.length ? (
        <div className="empty-box">
          <h2>Nenhum empréstimo em aberto</h2>
          <p>Os equipamentos que você retirar vão aparecer aqui.</p>
          <Link to="/catalogo">
            <Button>Ir ao catálogo</Button>
          </Link>
        </div>
      ) : (
        <div className="loan-list">
          {meus.map((e) => (
            <article className={`loan-row${e.prazo < hoje ? " loan-row-overdue" : ""}`} key={e.id}>
              <div className="loan-item">
                <strong>{e.equipamento}</strong>
                <span className="micro-copy">{e.patrimonio}</span>
              </div>
              <div>
                <span className="table-label">Retirada</span>
                <span>{formatarData(e.retirada)}</span>
              </div>
              <div>
                <span className="table-label">Devolver até</span>
                <strong>{formatarData(e.prazo)}</strong>
              </div>
              <Pill tipo={e.prazo < hoje ? "atraso" : "disponivel"}>
                {e.prazo < hoje ? "Em atraso" : "Em dia"}
              </Pill>
            </article>
          ))}
        </div>
      )}
      <div className="rules-strip">
        <span>Máximo de 3 itens por pessoa</span>
        <span>Prazo padrão: 14 dias corridos</span>
        <span>Devolução registrada no balcão</span>
      </div>
    </>
  );
}
