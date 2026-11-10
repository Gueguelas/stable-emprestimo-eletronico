import { SetMetadata } from "@nestjs/common";

export const ROTA_PUBLICA = "rotaPublica";

export const Publico = (): MethodDecorator & ClassDecorator =>
  SetMetadata(ROTA_PUBLICA, true);
