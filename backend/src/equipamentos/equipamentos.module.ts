import { Module } from "@nestjs/common";
import { EquipamentosController } from "./equipamentos.controller";
import { EquipamentosService } from "./equipamentos.service";
import { EquipamentosRepository } from "./equipamentos.repository";

@Module({
  controllers: [EquipamentosController],
  providers: [EquipamentosService, EquipamentosRepository]
})
export class EquipamentosModule {}
