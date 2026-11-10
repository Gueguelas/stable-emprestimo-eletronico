import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";

// Erros no formato RFC 9457 (Problem Details) — ADR-001, seção 4.
@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  catch(excecao: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const resposta = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const http = excecao instanceof HttpException;
    const status = http ? excecao.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const titulo =
      status === HttpStatus.UNAUTHORIZED ? "Não autenticado" :
      status === HttpStatus.FORBIDDEN ? "Sem permissão" :
      status === HttpStatus.NOT_FOUND ? "Não encontrado" :
      status === HttpStatus.BAD_REQUEST ? "Requisição inválida" :
      status < 500 ? "Requisição inválida" : "Erro interno";

    const corpo = {
      type: `https://stable.example.com/erros/${status}`,
      title: titulo,
      status,
      detail: http ? excecao.message : undefined,
      instance: req.originalUrl
    };

    resposta.status(status).json(corpo);
  }
}
