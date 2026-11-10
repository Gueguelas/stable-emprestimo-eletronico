import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pill } from "@/components/ui/pill";
import { SectionRule } from "@/components/ui/section-rule";
import { resumoEmprestimos } from "@/features/emprestimos/regras";
import { estaEmAtraso, formatarData } from "@/lib/datas";
import { registrarDevolucaoMock } from "@/lib/devolucaoMock";
import { useEmprestimosMock } from "@/stores/emprestimosMock";
import { useEquipamentosMock } from "@/stores/equipamentosMock";
import { useToast } from "@/stores/toast";

export function OperacoesPage() {
  const navegar = useNavigate();
  const emprestimos = useEmprestimosMock((estado) => estado.emprestimos);
  const equipamentos = useEquipamentosMock((estado) => estado.equipamentos);
  const mostrarToast = useToast((estado) => estado.mostrar);
  const [busca, setBusca] = useState("");
  const [idSelecionado, setIdSelecionado] = useState<string | null>(null);
  const abertos = emprestimos.filter((item) => !item.devolvido);
  const lista = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return abertos.filter((item) =>
      `${item.pessoa} ${item.equipamento} ${item.patrimonio}`
        .toLocaleLowerCase("pt-BR")
        .includes(termo)
    );
  }, [abertos, busca]);
  const kpis = resumoEmprestimos(emprestimos, equipamentos);
  const selecionado = abertos.find((item) => item.id === idSelecionado);

  function confirmarDevolucao() {
    if (!selecionado) return;
    registrarDevolucaoMock(selecionado.id);
    setIdSelecionado(null);
    mostrarToast(`Devolução de ${selecionado.equipamento} registrada.`);
  }

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">PAINEL DE OPERAÇÕES</p>
          <h1>Empréstimos em aberto</h1>
          <p className="subheading">Acompanhe os equipamentos emprestados e registre devoluções.</p>
        </div>
        <div className="heading-actions">
          <label className="search-field">
            <span className="sr-only">Buscar pessoa ou equipamento</span>
            <Input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar pessoa ou item" />
          </label>
          <Button onClick={() => navegar("/equipamentos")}>Cadastrar equipamento</Button>
        </div>
      </section>
      <SectionRule />
      <div className="kpi-grid">
        <article className="kpi"><span>EM ABERTO</span><strong>{kpis.emAberto}</strong><small>empréstimos ativos</small></article>
        <article className="kpi kpi-danger"><span>EM ATRASO</span><strong>{kpis.emAtraso}</strong><small>precisam de atenção</small></article>
        <article className="kpi kpi-accent"><span>DISPONÍVEIS</span><strong>{kpis.disponiveis}</strong><small>prontos para retirada</small></article>
        <article className="kpi kpi-muted"><span>MANUTENÇÃO</span><strong>{kpis.manutencao}</strong><small>indisponíveis</small></article>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Pessoa</th><th>Equipamento</th><th>Patrimônio</th><th>Retirada</th><th>Prazo</th><th>Situação</th><th><span className="sr-only">Ação</span></th>
            </tr>
          </thead>
          <tbody>
            {lista.map((emprestimo) => {
              const atraso = estaEmAtraso(emprestimo.prazo);
              return (
                <tr key={emprestimo.id}>
                  <td><span className="person-cell"><span className="avatar avatar-neutral">{emprestimo.pessoa.split(" ").map((parte) => parte[0]).slice(0, 2).join("")}</span>{emprestimo.pessoa}</span></td>
                  <td>{emprestimo.equipamento}</td>
                  <td className="micro-copy">{emprestimo.patrimonio}</td>
                  <td>{formatarData(emprestimo.retirada)}</td>
                  <td className={atraso ? "text-danger" : ""}>{formatarData(emprestimo.prazo)}</td>
                  <td><Pill tipo={atraso ? "atraso" : "emprestado"}>{atraso ? "Em atraso" : "Emprestado"}</Pill></td>
                  <td><Button variant="ghost" onClick={() => setIdSelecionado(emprestimo.id)}>Registrar devolução</Button></td>
                </tr>
              );
            })}
            {lista.length === 0 && (
              <tr><td className="table-empty" colSpan={7}>Nenhum empréstimo corresponde à busca.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Dialog
        aberto={Boolean(selecionado)}
        aoFechar={() => setIdSelecionado(null)}
        titulo="Registrar devolução"
        confirmar={confirmarDevolucao}
        textoConfirmar="Confirmar devolução"
      >
        <div className="dialog-body">
          <p>Confirme a devolução recebida no balcão.</p>
          <div className="dialog-summary">
            <span>Pessoa</span><strong>{selecionado?.pessoa}</strong>
            <span>Equipamento</span><strong>{selecionado?.equipamento}</strong>
          </div>
        </div>
      </Dialog>
    </>
  );
}
