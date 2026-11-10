import { Injectable } from "@nestjs/common";

export const LIMITE = 3;
export const PRAZO_DIAS = 14;

@Injectable()
export class Relogio {
  agora(): Date {
    return new Date();
  }
}

export function hojeSaoPaulo(instante: Date): string {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instante);
  const parte = (tipo: string) => partes.find((p) => p.type === tipo)!.value;
  return `${parte("year")}-${parte("month")}-${parte("day")}`;
}

export function prazoDe(hoje: string): string {
  const data = new Date(`${hoje}T00:00:00.000Z`);
  data.setUTCDate(data.getUTCDate() + PRAZO_DIAS);
  return data.toISOString().slice(0, 10);
}
