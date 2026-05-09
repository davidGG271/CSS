import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDetalleCarritoDto } from './dto/create-detalle-carrito.dto';
import { UpdateDetalleCarritoDto } from './dto/update-detalle-carrito.dto';
import { DetalleCarrito } from './entities/detalle-carrito.entity';

@Injectable()
export class DetalleCarritoService {
  constructor(
    @InjectRepository(DetalleCarrito)
    private detalleCarritoRepository: Repository<DetalleCarrito>,
  ) {}

  async create(createDetalleCarritoDto: CreateDetalleCarritoDto) {
    const detalleCarrito = this.detalleCarritoRepository.create(createDetalleCarritoDto);
    return this.detalleCarritoRepository.save(detalleCarrito);
  }

  async findAll() {
    return this.detalleCarritoRepository.find({ relations: ['carrito', 'producto'] });
  }

  async findOne(idCarrito: number, idProducto: number) {
    const detalleCarrito = await this.detalleCarritoRepository.findOne({
      where: { idCarrito, idProducto },
      relations: ['carrito', 'producto'],
    });
    if (!detalleCarrito) {
      throw new NotFoundException('Detalle de carrito no encontrado');
    }
    return detalleCarrito;
  }

  async update(
    idCarrito: number,
    idProducto: number,
    updateDetalleCarritoDto: UpdateDetalleCarritoDto,
  ) {
    const detalleCarrito = await this.findOne(idCarrito, idProducto);
    Object.assign(detalleCarrito, updateDetalleCarritoDto);
    return this.detalleCarritoRepository.save(detalleCarrito);
  }

  async remove(idCarrito: number, idProducto: number) {
    const detalleCarrito = await this.findOne(idCarrito, idProducto);
    return this.detalleCarritoRepository.remove(detalleCarrito);
  }
}
