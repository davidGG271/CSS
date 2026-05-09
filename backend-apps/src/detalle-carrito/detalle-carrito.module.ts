import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleCarritoService } from './detalle-carrito.service';
import { DetalleCarritoController } from './detalle-carrito.controller';
import { DetalleCarrito } from './entities/detalle-carrito.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DetalleCarrito])],
  controllers: [DetalleCarritoController],
  providers: [DetalleCarritoService],
})
export class DetalleCarritoModule {}
