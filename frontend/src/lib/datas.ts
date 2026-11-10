export const HOJE_MOCK = "2026-08-31";
export const PRAZO_PADRAO_DIAS = 14;

export function adicionarDias(data: string, dias: number): string {
  const [ano, mes, dia] = data.split("-").map(Number);
  const resultado = new Date(Date.UTC(ano, mes - 1, dia + dias));
  return resultado.toISOString().slice(0, 10);
}

export function formatarData(data: string | null): string {
  if (!data) return "—";
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function diasAte(prazo: string, hoje = HOJE_MOCK): number {
  const [ano, mes, dia] = hoje.split("-").map(Number);
  const [anoPrazo, mesPrazo, diaPrazo] = prazo.split("-").map(Number);
  const hojeUtc = Date.UTC(ano, mes - 1, dia);
  const prazoUtc = Date.UTC(anoPrazo, mesPrazo - 1, diaPrazo);
  return Math.round((prazoUtc - hojeUtc) / 86_400_000);
}

export function estaEmAtraso(prazo: string, hoje = HOJE_MOCK): boolean {
  return diasAte(prazo, hoje) < 0;
}
