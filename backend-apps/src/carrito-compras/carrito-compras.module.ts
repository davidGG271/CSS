import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarritoComprasService } from './carrito-compras.service';
import { CarritoComprasController } from './carrito-compras.controller';
import { CarritoCompras } from './entities/carrito-compras.entity';
import { DetalleCarrito } from '../detalle-carrito/entities/detalle-carrito.entity';
import { Producto } from '../producto/entities/producto.entity';
import { PcArmada } from '../pc-armada/entities/pc-armada.entity';
import { Cliente } from '../cliente/entities/cliente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CarritoCompras, DetalleCarrito, Producto, PcArmada, Cliente])],
  controllers: [CarritoComprasController],
  providers: [CarritoComprasService],
  exports: [CarritoComprasService],
})
export class CarritoComprasModule {}
