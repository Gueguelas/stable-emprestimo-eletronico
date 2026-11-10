import { Body, Controller, Get, Query } from "@nestjs/common";
import { ZodSerializerDto, ZodValidationPipe } from "nestjs-zod";
import { EquipamentosService } from "./equipamentos.service";
import {
  ListaEquipamentosDto,
  ListaEquipamentosQueryDto
} from "./equipamentos.schema";

// Rota do PRD item 2: catálogo com a situação de cada equipamento.
// Autenticação e tenant resolvidos pelo JwtGuard (global no AppModule).
@Controller("equipamentos")
export class EquipamentosController {
  constructor(private readonly service: EquipamentosService) {}

  @Get()
  @ZodSerializerDto(ListaEquipamentosDto)
  listar(
    @Query(new ZodValidationPipe(ListaEquipamentosQueryDto))
    query: ListaEquipamentosQueryDto
  ): Promise<ListaEquipamentosDto> {
    return this.service.listar(query.limite, query.cursor);
  }
}
