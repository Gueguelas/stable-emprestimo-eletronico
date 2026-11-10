// Tipos e validação derivados de OpenAPI; não manter contrato manual.
import type { ListaEquipamentosDto } from "./generated/model";
export type Equipamento = ListaEquipamentosDto["itens"][number];
export type ListaEquipamentos = ListaEquipamentosDto;
export { ListarEquipamentosResponse as listaEquipamentosSchema } from "./generated/validation";
