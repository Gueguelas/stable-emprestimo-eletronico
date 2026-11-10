export function validarFechamento(relatorio, checks, atual, spec, cas) {
  if (!checks?.aprovado || checks.estado !== atual)
    throw new Error("Checks ausentes, reprovados ou desatualizados");
  if (relatorio?.estado !== atual || relatorio.spec !== spec)
    throw new Error("Relatório ausente ou desatualizado");
  const linhas = relatorio.criterios;
  if (
    !Array.isArray(linhas) ||
    linhas.length !== cas.length ||
    cas.some((ca, n) => linhas[n]?.ca !== ca)
  )
    throw new Error("Tabela de CAs incompleta ou fora de ordem");
  if (
    relatorio.conclusao !== "PRONTA" ||
    linhas.some(
      (i) =>
        i.resultado !== "APROVADO" || !i.evidencia?.trim() || !i.motivo?.trim(),
    )
  )
    throw new Error(
      "Spec não pronta: há falha, ausência de teste ou pendência",
    );
  return true;
}
