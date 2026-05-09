import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PcArmadaProductoService } from './pc-armada-producto.service';
import { PcArmadaProductoController } from './pc-armada-producto.controller';
import { PcArmadaProducto } from './entities/pc-armada-producto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PcArmadaProducto])],
  controllers: [PcArmadaProductoController],
  providers: [PcArmadaProductoService],
  exports: [PcArmadaProductoService],
})
export class PcArmadaProductoModule {}
