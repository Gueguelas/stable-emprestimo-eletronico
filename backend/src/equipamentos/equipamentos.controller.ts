import { Body, Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { ZodSerializerDto, ZodValidationPipe } from "nestjs-zod";
import { EquipamentosService } from "./equipamentos.service";
import {
  ListaEquipamentosDto,
  ListaEquipamentosQueryDto,
} from "./equipamentos.schema";

// Rota do PRD item 2: catálogo com a situação de cada equipamento.
// Autenticação e tenant resolvidos pelo JwtGuard (global no AppModule).
@Controller("equipamentos")
@ApiBearerAuth()
export class EquipamentosController {
  constructor(private readonly service: EquipamentosService) {}

  @Get()
  @ApiOperation({ operationId: "listarEquipamentos" })
  @ApiOkResponse({ type: ListaEquipamentosDto })
  @ZodSerializerDto(ListaEquipamentosDto)
  listar(
    @Query(new ZodValidationPipe(ListaEquipamentosQueryDto))
    query: ListaEquipamentosQueryDto,
  ): Promise<ListaEquipamentosDto> {
    return this.service.listar(query.limite, query.cursor);
  }
}
