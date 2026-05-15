import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCarritoComprasDto } from './dto/create-carrito-compras.dto';
import { UpdateCarritoComprasDto } from './dto/update-carrito-compras.dto';
import { AddCarritoItemDto, UpdateCarritoItemDto } from './dto/carrito-item.dto';
import { CarritoCompras } from './entities/carrito-compras.entity';
import { DetalleCarrito } from '../detalle-carrito/entities/detalle-carrito.entity';
import { Producto } from '../producto/entities/producto.entity';
import { PcArmada } from '../pc-armada/entities/pc-armada.entity';
import { Cliente } from '../cliente/entities/cliente.entity';

@Injectable()
export class CarritoComprasService {
  constructor(
    @InjectRepository(CarritoCompras)
    private carritoComprasRepository: Repository<CarritoCompras>,
    @InjectRepository(DetalleCarrito)
    private detalleCarritoRepository: Repository<DetalleCarrito>,
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
    @InjectRepository(PcArmada)
    private pcArmadaRepository: Repository<PcArmada>,
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
  ) {}

  private readonly carritoRelations = [
    'cliente',
    'detalles',
    'detalles.producto',
    'detalles.pcArmada',
  ];

  async create(createCarritoComprasDto: CreateCarritoComprasDto) {
    const carritoCompras = this.carritoComprasRepository.create(createCarritoComprasDto);
    return this.carritoComprasRepository.save(carritoCompras);
  }

  async findAll() {
    return this.carritoComprasRepository.find({
      relations: this.carritoRelations,
      order: { idCarrito: 'DESC' },
    });
  }

  async findOne(idCarrito: number) {
    const carritoCompras = await this.carritoComprasRepository.findOne({
      where: { idCarrito },
      relations: this.carritoRelations,
    });
    if (!carritoCompras) {
      throw new NotFoundException('Carrito de compras no encontrado');
    }
    return carritoCompras;
  }

  async findActiveByCliente(idCliente: number) {
    await this.assertClienteExists(idCliente);

    let carrito = await this.carritoComprasRepository.findOne({
      where: { idCliente, isVisible: true },
      relations: this.carritoRelations,
      order: { idCarrito: 'DESC' },
    });

    if (!carrito) {
      carrito = await this.carritoComprasRepository.save(
        this.carritoComprasRepository.create({ idCliente, isVisible: true }),
      );
    }

    return this.findOne(carrito.idCarrito);
  }

  async addItem(addCarritoItemDto: AddCarritoItemDto) {
    const tieneProducto =
      addCarritoItemDto.idProducto !== undefined &&
      addCarritoItemDto.idProducto !== null;
    const tienePcArmada =
      addCarritoItemDto.idPcArmada !== undefined &&
      addCarritoItemDto.idPcArmada !== null;

    if (tieneProducto === tienePcArmada) {
      throw new BadRequestException(
        'Debe enviar solo idProducto o solo idPcArmada',
      );
    }

    const carrito = await this.findActiveByCliente(addCarritoItemDto.idCliente);
    const where = tieneProducto
      ? {
          idCarrito: carrito.idCarrito,
          idProducto: addCarritoItemDto.idProducto,
        }
      : {
          idCarrito: carrito.idCarrito,
          idPcArmada: addCarritoItemDto.idPcArmada,
        };

    const existente = await this.detalleCarritoRepository.findOne({ where });
    const cantidadFinal =
      (existente?.cantidad ?? 0) + addCarritoItemDto.cantidad;

    await this.assertStockDisponible({
      idProducto: addCarritoItemDto.idProducto,
      idPcArmada: addCarritoItemDto.idPcArmada,
      cantidad: cantidadFinal,
    });

    if (existente) {
      existente.cantidad = cantidadFinal;
      await this.detalleCarritoRepository.save(existente);
    } else {
      await this.detalleCarritoRepository.save(
        this.detalleCarritoRepository.create({
          idCarrito: carrito.idCarrito,
          idProducto: addCarritoItemDto.idProducto,
          idPcArmada: addCarritoItemDto.idPcArmada,
          cantidad: addCarritoItemDto.cantidad,
        }),
      );
    }

    return this.findOne(carrito.idCarrito);
  }

  async updateItem(
    idDetalleCarrito: number,
    updateCarritoItemDto: UpdateCarritoItemDto,
  ) {
    const detalle = await this.detalleCarritoRepository.findOne({
      where: { idDetalleCarrito },
      relations: ['carrito', 'producto', 'pcArmada'],
    });

    if (!detalle) {
      throw new NotFoundException(
        `Detalle de carrito con ID ${idDetalleCarrito} no encontrado`,
      );
    }

    await this.assertStockDisponible({
      idProducto: detalle.idProducto,
      idPcArmada: detalle.idPcArmada,
      cantidad: updateCarritoItemDto.cantidad,
    });

    detalle.cantidad = updateCarritoItemDto.cantidad;
    await this.detalleCarritoRepository.save(detalle);
    return this.findOne(detalle.idCarrito);
  }

  async removeItem(idDetalleCarrito: number) {
    const detalle = await this.detalleCarritoRepository.findOne({
      where: { idDetalleCarrito },
    });

    if (!detalle) {
      throw new NotFoundException(
        `Detalle de carrito con ID ${idDetalleCarrito} no encontrado`,
      );
    }

    const idCarrito = detalle.idCarrito;
    await this.detalleCarritoRepository.remove(detalle);
    return this.findOne(idCarrito);
  }

  async clearItems(idCarrito: number) {
    await this.findOne(idCarrito);
    await this.detalleCarritoRepository.delete({ idCarrito });
    return this.findOne(idCarrito);
  }

  async update(idCarrito: number, updateCarritoComprasDto: UpdateCarritoComprasDto) {
    const carritoCompras = await this.findOne(idCarrito);
    Object.assign(carritoCompras, updateCarritoComprasDto);
    return this.carritoComprasRepository.save(carritoCompras);
  }

  async remove(idCarrito: number) {
    const carritoCompras = await this.findOne(idCarrito);
    return this.carritoComprasRepository.remove(carritoCompras);
  }

  private async assertClienteExists(idCliente: number) {
    const cliente = await this.clienteRepository.findOne({ where: { idCliente } });

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${idCliente} no encontrado`);
    }
  }

  private async assertStockDisponible({
    idProducto,
    idPcArmada,
    cantidad,
  }: {
    idProducto?: number;
    idPcArmada?: number;
    cantidad: number;
  }) {
    if (idProducto !== undefined && idProducto !== null) {
      const producto = await this.productoRepository.findOne({
        where: { idProducto },
      });

      if (!producto) {
        throw new NotFoundException(`Producto con ID ${idProducto} no encontrado`);
      }

      if (producto.stock < cantidad) {
        throw new BadRequestException(
          `Stock insuficiente para el producto ${producto.nombre}`,
        );
      }

      return;
    }

    if (idPcArmada !== undefined && idPcArmada !== null) {
      const pcArmada = await this.pcArmadaRepository.findOne({
        where: { idPcArmada },
      });

      if (!pcArmada) {
        throw new NotFoundException(
          `PC armada con ID ${idPcArmada} no encontrada`,
        );
      }

      if (pcArmada.stock < cantidad) {
        throw new BadRequestException(
          `Stock insuficiente para la PC armada ${pcArmada.nombre}`,
        );
      }

      return;
    }

    throw new BadRequestException('Debe enviar idProducto o idPcArmada');
  }
}
