import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Pill } from "@/components/ui/pill";
import { SectionRule } from "@/components/ui/section-rule";
import { useContextoUsuario } from "@/features/emprestimos/useContextoUsuario";
import { estaEmAtraso, formatarData, HOJE_MOCK } from "@/lib/datas";
import { registrarDevolucaoMock } from "@/lib/devolucaoMock";
import { useToast } from "@/stores/toast";

export function MeusEmprestimosPage() {
  const { meus } = useContextoUsuario();
  const mostrarToast = useToast((estado) => estado.mostrar);
  const [idSelecionado, setIdSelecionado] = useState<string | null>(null);
  const selecionado = meus.find((item) => item.id === idSelecionado);

  function confirmarDevolucao() {
    if (!selecionado) return;
    registrarDevolucaoMock(selecionado.id);
    setIdSelecionado(null);
    mostrarToast(`${selecionado.equipamento} devolvido.`);
  }

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">VISÃO PESSOAL</p>
          <h1>Meus empréstimos</h1>
          <p className="subheading">{meus.length} de 3 itens em seu nome · prazo padrão de 14 dias</p>
        </div>
      </section>
      <div className="loan-slots" aria-label={`${meus.length} de 3 itens emprestados`}>
        {[0, 1, 2].map((slot) => {
          const emprestimo = meus[slot];
          const estado = emprestimo
            ? estaEmAtraso(emprestimo.prazo)
              ? "overdue"
              : "occupied"
            : "";
          return <span key={slot} className={`loan-slot ${estado}`} />;
        })}
      </div>
      <SectionRule />
      {meus.length === 0 ? (
        <div className="empty-box">
          <h2>Nenhum empréstimo em aberto</h2>
          <p>Os equipamentos que você retirar vão aparecer aqui.</p>
          <Link to="/catalogo"><Button>Ir ao catálogo</Button></Link>
        </div>
      ) : (
        <div className="loan-list">
          {meus.map((emprestimo) => {
            const atraso = estaEmAtraso(emprestimo.prazo);
            return (
              <article className={`loan-row${atraso ? " loan-row-overdue" : ""}`} key={emprestimo.id}>
                <div className="loan-item">
                  <strong>{emprestimo.equipamento}</strong>
                  <span className="micro-copy">{emprestimo.patrimonio}</span>
                </div>
                <div><span className="table-label">Retirada</span><span>{formatarData(emprestimo.retirada)}</span></div>
                <div><span className="table-label">Devolver até</span><strong className={atraso ? "text-danger" : ""}>{formatarData(emprestimo.prazo)}</strong></div>
                <Pill tipo={atraso ? "atraso" : "disponivel"}>{atraso ? "Em atraso" : "Em dia"}</Pill>
                <Button variant="secondary" onClick={() => setIdSelecionado(emprestimo.id)}>Devolver</Button>
              </article>
            );
          })}
        </div>
      )}
      <div className="rules-strip">
        <span>Máximo de 3 itens por pessoa</span>
        <span>Prazo padrão: 14 dias</span>
        <span>Devolução registrada no balcão</span>
      </div>
      <Dialog
        aberto={Boolean(selecionado)}
        aoFechar={() => setIdSelecionado(null)}
        titulo="Confirmar devolução"
        confirmar={confirmarDevolucao}
        textoConfirmar="Confirmar devolução"
      >
        <div className="dialog-body">
          <p>Deseja registrar a devolução deste equipamento?</p>
          <div className="dialog-summary">
            <span>Equipamento</span><strong>{selecionado?.equipamento}</strong>
            <span>Devolução em</span><strong>{formatarData(HOJE_MOCK)}</strong>
          </div>
        </div>
      </Dialog>
    </>
  );
}
