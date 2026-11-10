import { Controller, Get } from "@nestjs/common";
import { Publico } from "../auth/publico";

@Controller("health")
export class HealthController {
  @Publico()
  @Get()
  verificar(): { status: "ok" } {
    return { status: "ok" };
  }
}
