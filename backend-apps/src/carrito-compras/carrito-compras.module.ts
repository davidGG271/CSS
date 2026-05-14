import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarritoComprasService } from './carrito-compras.service';
import { CarritoComprasController } from './carrito-compras.controller';
import { CarritoCompras } from './entities/carrito-compras.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CarritoCompras])],
  controllers: [CarritoComprasController],
  providers: [CarritoComprasService],
  exports: [CarritoComprasService],
})
export class CarritoComprasModule {}
