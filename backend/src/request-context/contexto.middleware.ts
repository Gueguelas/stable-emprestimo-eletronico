import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { als, ContextoRequest } from "./contexto";

// Cria o store do AsyncLocalStorage cedo, no início do request.
// O guard preenche o MESMO objeto depois de validar o JWT — o contexto
// fica visível para controller, service e repository sem passar por parâmetro.
@Injectable()
export class ContextoMiddleware implements NestMiddleware {
  use(_req: Request, _res: Response, next: NextFunction): void {
    als.run(new ContextoRequest(), () => next());
  }
}
