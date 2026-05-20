import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClienteModule } from './cliente/cliente.module';
import { ProductoModule } from './producto/producto.module';
import { PedidoModule } from './pedido/pedido.module';
import { DetallePedidoModule } from './detalle-pedido/detalle-pedido.module';
import { CarritoComprasModule } from './carrito-compras/carrito-compras.module';
import { DetalleCarritoModule } from './detalle-carrito/detalle-carrito.module';
import { AdminModule } from './admin/admin.module';
import { PcArmadaModule } from './pc-armada/pc-armada.module';
import { PcArmadaProductoModule } from './pc-armada-producto/pc-armada-producto.module';
import { PagoModule } from './pago/pago.module';
import { NotificacionModule } from './notificacion/notificacion.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
      /*
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'henry',
      database: 'tiendaCyC',
      */
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: false,
    }),
    ClienteModule,
    ProductoModule,
    PedidoModule,
    DetallePedidoModule,
    CarritoComprasModule,
    DetalleCarritoModule,
    AdminModule,
    PcArmadaModule,
    PcArmadaProductoModule,
    PagoModule,
    NotificacionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
