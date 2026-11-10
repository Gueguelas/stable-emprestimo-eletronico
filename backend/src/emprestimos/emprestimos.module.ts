import { Body, Controller, Get, Module, Post, Query } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from "@nestjs/swagger";
import { ZodSerializerDto, ZodValidationPipe } from "nestjs-zod";
import { EmprestimosRepository } from "./emprestimos.repository";
import { EmprestimosService } from "./emprestimos.service";
import {
  AbertosQueryDto,
  EmprestimoDto,
  EmprestimosDto,
  SessaoDto,
  SolicitarDto,
} from "./emprestimos.schema";
import { Relogio } from "./regras";

@Controller("emprestimos")
@ApiBearerAuth()
class EmprestimosController {
  constructor(private readonly service: EmprestimosService) {}
  @Get()
  @ApiOperation({ operationId: "listarMeusEmprestimos" })
  @ApiOkResponse({ type: EmprestimosDto })
  @ZodSerializerDto(EmprestimosDto)
  listar(
    @Query(new ZodValidationPipe(AbertosQueryDto)) _query: AbertosQueryDto,
  ) {
    return this.service.listar();
  }
  @Post()
  @ApiOperation({ operationId: "solicitarEmprestimo" })
  @ApiCreatedResponse({ type: EmprestimoDto })
  @ZodSerializerDto(EmprestimoDto)
  solicitar(@Body(new ZodValidationPipe(SolicitarDto)) body: SolicitarDto) {
    return this.service.solicitar(body.equipamentoId);
  }
}

@Controller("sessao")
@ApiBearerAuth()
class SessaoController {
  constructor(private readonly service: EmprestimosService) {}
  @Get()
  @ApiOperation({ operationId: "obterSessao" })
  @ApiOkResponse({ type: SessaoDto })
  @ZodSerializerDto(SessaoDto)
  obter() {
    return this.service.sessao();
  }
}

@Module({
  controllers: [EmprestimosController, SessaoController],
  providers: [EmprestimosService, EmprestimosRepository, Relogio],
})
export class EmprestimosModule {}
