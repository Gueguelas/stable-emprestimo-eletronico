import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionRule } from "@/components/ui/section-rule";
import { useEquipamentosMock } from "@/stores/equipamentosMock";
import { useToast } from "@/stores/toast";
import type { Equipamento } from "@/api/schemas";

const schemaEquipamento = z.object({
  nome: z.string().trim().min(1, "Informe o nome do equipamento."),
  categoria: z.enum(["notebook", "monitor", "cabo", "camera", "acessorio"]),
  patrimonio: z.string(),
  observacao: z.string(),
  situacao: z.enum(["disponivel", "em_manutencao"])
});
type DadosEquipamento = z.infer<typeof schemaEquipamento>;

export function EquipamentosPage() {
  const navegar = useNavigate();
  const adicionar = useEquipamentosMock((estado) => estado.adicionar);
  const mostrarToast = useToast((estado) => estado.mostrar);
  const [enviando, setEnviando] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<DadosEquipamento>({
    resolver: zodResolver(schemaEquipamento),
    defaultValues: {
      categoria: "notebook",
      situacao: "disponivel",
      patrimonio: "",
      observacao: ""
    }
  });

  function cadastrar(dados: DadosEquipamento) {
    setEnviando(true);
    const novo: Equipamento = {
      id: crypto.randomUUID(),
      nome: dados.nome,
      categoria: dados.categoria,
      patrimonio: dados.patrimonio.trim() || "TI-—",
      situacao: dados.situacao,
      comPessoa: null,
      prazo: null,
      observacao: dados.observacao.trim() || null
    };
    adicionar(novo);
    mostrarToast("Equipamento cadastrado.");
    navegar("/operacoes");
    setEnviando(false);
  }

  function cadastroInvalido() {
<<<<<<< HEAD
    if (errors.nome) mostrarToast("Informe o nome do equipamento.");
=======
    mostrarToast("Informe o nome do equipamento.");
>>>>>>> a52456606c59e2feef60eb067f786b93e23ae2a1
  }

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">INVENTÁRIO</p>
          <h1>Cadastrar equipamento</h1>
          <p className="subheading">Adicione um item ao catálogo interno.</p>
        </div>
      </section>
      <SectionRule />
      <div className="equipment-form-layout">
        <Card>
          <form className="equipment-form" onSubmit={handleSubmit(cadastrar, cadastroInvalido)}>
            <label className="field field-span-2">
              <span>Nome do equipamento</span>
              <Input placeholder="Ex.: Notebook Dell Latitude 5450" {...register("nome")} />
              {errors.nome && <small className="field-error">{errors.nome.message}</small>}
            </label>
            <label className="field">
              <span>Categoria</span>
              <select className="input" {...register("categoria")}>
                <option value="notebook">Notebook</option>
                <option value="monitor">Monitor</option>
                <option value="cabo">Cabo</option>
                <option value="camera">Câmera</option>
                <option value="acessorio">Acessório</option>
              </select>
            </label>
            <label className="field">
              <span>Patrimônio</span>
              <Input placeholder="TI-0000" {...register("patrimonio")} />
            </label>
            <label className="field field-span-2">
              <span>Observações</span>
              <textarea className="input textarea" placeholder="Informações adicionais" {...register("observacao")} />
            </label>
            <fieldset className="field field-span-2 radio-group">
              <legend>Situação inicial</legend>
              <label><input type="radio" value="disponivel" {...register("situacao")} /> Disponível</label>
              <label><input type="radio" value="em_manutencao" {...register("situacao")} /> Em manutenção</label>
            </fieldset>
            <div className="form-actions field-span-2">
              <Button type="submit" disabled={enviando}>{enviando ? "Cadastrando…" : "Cadastrar equipamento"}</Button>
              <Button type="button" variant="ghost" onClick={() => navegar("/operacoes")}>Cancelar</Button>
            </div>
          </form>
        </Card>
        <aside className="form-aside">
          <Card>
            <h2>Regras em vigor</h2>
            <ul className="accent-list">
              <li>Até 3 itens por pessoa</li>
              <li>Prazo padrão de 14 dias</li>
              <li>Atraso bloqueia novo empréstimo</li>
              <li>Manutenção não aparece disponível</li>
            </ul>
          </Card>
          <Card className="muted-card">
            <h2>Fora desta versão</h2>
            <ul>
              <li>Reserva com data futura</li>
              <li>Notificação por e-mail</li>
              <li>Importação de planilha</li>
            </ul>
          </Card>
        </aside>
      </div>
    </>
  );
}
