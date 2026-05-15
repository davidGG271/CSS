import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { CheckoutCarritoDto, CheckoutPedidoDto } from './dto/checkout-pedido.dto';
import { Pedido } from './entities/pedido.entity';
import { Cliente } from '../cliente/entities/cliente.entity';
import { Producto } from '../producto/entities/producto.entity';
import { PcArmada } from '../pc-armada/entities/pc-armada.entity';
import { DetallePedido } from '../detalle-pedido/entities/detalle-pedido.entity';
import { Pago } from '../pago/entities/pago.entity';
import { CarritoCompras } from '../carrito-compras/entities/carrito-compras.entity';
import { DetalleCarrito } from '../detalle-carrito/entities/detalle-carrito.entity';

@Injectable()
export class PedidoService {
  constructor(
    @InjectRepository(Pedido)
    private pedidoRepository: Repository<Pedido>,
    private dataSource: DataSource,
  ) {}

  private readonly pedidoRelations = [
    'cliente',
    'detalles',
    'detalles.producto',
    'detalles.pcArmada',
    'detalles.pcArmada.productos',
    'detalles.pcArmada.productos.producto',
    'pagos',
  ];

  async create(createPedidoDto: CreatePedidoDto) {
    const pedido = this.pedidoRepository.create(createPedidoDto);
    return this.pedidoRepository.save(pedido);
  }

  async findAll() {
    return this.pedidoRepository.find({
      relations: this.pedidoRelations,
      order: { idPedido: 'DESC' },
    });
  }

  async findByCliente(idCliente: number) {
    return this.pedidoRepository.find({
      where: { idCliente },
      relations: this.pedidoRelations,
      order: { idPedido: 'DESC' },
    });
  }

  async findOne(idPedido: number) {
    const pedido = await this.pedidoRepository.findOne({
      where: { idPedido },
      relations: this.pedidoRelations,
    });
    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }
    return pedido;
  }

  async checkout(checkoutPedidoDto: CheckoutPedidoDto) {
    const pedidoGuardado = await this.dataSource.transaction(async (manager) => {
      const clienteRepository = manager.getRepository(Cliente);
      const productoRepository = manager.getRepository(Producto);
      const pcArmadaRepository = manager.getRepository(PcArmada);
      const pedidoRepository = manager.getRepository(Pedido);
      const detallePedidoRepository = manager.getRepository(DetallePedido);
      const pagoRepository = manager.getRepository(Pago);
      const carritoRepository = manager.getRepository(CarritoCompras);
      const detalleCarritoRepository = manager.getRepository(DetalleCarrito);

      const cliente = await clienteRepository.findOne({
        where: { idCliente: checkoutPedidoDto.idCliente },
      });

      if (!cliente) {
        throw new NotFoundException(
          `Cliente con ID ${checkoutPedidoDto.idCliente} no encontrado`,
        );
      }

      let montoTotal = 0;
      const detalles: DetallePedido[] = [];

      for (const item of checkoutPedidoDto.items) {
        const tieneProducto = item.idProducto !== undefined && item.idProducto !== null;
        const tienePcArmada = item.idPcArmada !== undefined && item.idPcArmada !== null;

        if (tieneProducto === tienePcArmada) {
          throw new BadRequestException(
            'Cada item debe incluir solo idProducto o solo idPcArmada',
          );
        }

        if (tieneProducto) {
          const producto = await productoRepository.findOne({
            where: { idProducto: item.idProducto },
          });

          if (!producto) {
            throw new NotFoundException(
              `Producto con ID ${item.idProducto} no encontrado`,
            );
          }

          if (producto.stock < item.cantidad) {
            throw new BadRequestException(
              `Stock insuficiente para el producto ${producto.nombre}`,
            );
          }

          producto.stock -= item.cantidad;
          await productoRepository.save(producto);

          const precio = Number(producto.precio);
          montoTotal += precio * item.cantidad;
          detalles.push(
            detallePedidoRepository.create({
              idProducto: producto.idProducto,
              cantidad: item.cantidad,
              precio,
            }),
          );
        }

        if (tienePcArmada) {
          const pcArmada = await pcArmadaRepository.findOne({
            where: { idPcArmada: item.idPcArmada },
          });

          if (!pcArmada) {
            throw new NotFoundException(
              `PC armada con ID ${item.idPcArmada} no encontrada`,
            );
          }

          if (pcArmada.stock < item.cantidad) {
            throw new BadRequestException(
              `Stock insuficiente para la PC armada ${pcArmada.nombre}`,
            );
          }

          pcArmada.stock -= item.cantidad;
          await pcArmadaRepository.save(pcArmada);

          const precio = Number(pcArmada.precio);
          montoTotal += precio * item.cantidad;
          detalles.push(
            detallePedidoRepository.create({
              idPcArmada: pcArmada.idPcArmada,
              cantidad: item.cantidad,
              precio,
            }),
          );
        }
      }

      const pedido = await pedidoRepository.save(
        pedidoRepository.create({
          idCliente: checkoutPedidoDto.idCliente,
          estado: 'confirmado',
          fecha: new Date(),
        }),
      );

      for (const detalle of detalles) {
        detalle.idPedido = pedido.idPedido;
      }
      await detallePedidoRepository.save(detalles);

      await pagoRepository.save(
        pagoRepository.create({
          idPedido: pedido.idPedido,
          monto: montoTotal,
          metodoPago: checkoutPedidoDto.pago.metodoPago,
          estado: 'aprobado',
          fechaPago: new Date(),
          codigoTransaccion:
            checkoutPedidoDto.pago.codigoTransaccion ??
            `CYC-${pedido.idPedido}-${Date.now()}`,
        }),
      );

      if (checkoutPedidoDto.idCarrito) {
        const carrito = await carritoRepository.findOne({
          where: {
            idCarrito: checkoutPedidoDto.idCarrito,
            idCliente: checkoutPedidoDto.idCliente,
          },
        });

        if (!carrito) {
          throw new NotFoundException(
            `Carrito con ID ${checkoutPedidoDto.idCarrito} no encontrado para el cliente`,
          );
        }

        await detalleCarritoRepository.delete({ idCarrito: carrito.idCarrito });
        carrito.isVisible = false;
        await carritoRepository.save(carrito);
      }

      return pedido;
    });

    return this.findOne(pedidoGuardado.idPedido);
  }

  async checkoutCarrito(checkoutCarritoDto: CheckoutCarritoDto) {
    const carritoRepository = this.dataSource.getRepository(CarritoCompras);
    const carrito = await carritoRepository.findOne({
      where: {
        idCarrito: checkoutCarritoDto.idCarrito,
        idCliente: checkoutCarritoDto.idCliente,
        isVisible: true,
      },
      relations: ['detalles'],
    });

    if (!carrito) {
      throw new NotFoundException(
        `Carrito activo con ID ${checkoutCarritoDto.idCarrito} no encontrado para el cliente`,
      );
    }

    if (!carrito.detalles.length) {
      throw new BadRequestException('El carrito no tiene items para comprar');
    }

    return this.checkout({
      idCliente: checkoutCarritoDto.idCliente,
      idCarrito: checkoutCarritoDto.idCarrito,
      items: carrito.detalles.map((detalle) => ({
        idProducto: detalle.idProducto,
        idPcArmada: detalle.idPcArmada,
        cantidad: detalle.cantidad,
      })),
      pago: checkoutCarritoDto.pago,
    });
  }

  async update(idPedido: number, updatePedidoDto: UpdatePedidoDto) {
    const pedido = await this.findOne(idPedido);
    Object.assign(pedido, updatePedidoDto);
    return this.pedidoRepository.save(pedido);
  }

  async remove(idPedido: number) {
    const pedido = await this.findOne(idPedido);
    return this.pedidoRepository.remove(pedido);
  }
}
