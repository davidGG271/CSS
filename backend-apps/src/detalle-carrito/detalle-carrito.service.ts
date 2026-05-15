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
    return this.detalleCarritoRepository.find({ relations: ['carrito', 'producto', 'pcArmada'] });
  }

  async findByCarrito(idCarrito: number) {
    return this.detalleCarritoRepository.find({
      where: { idCarrito },
      relations: ['carrito', 'producto', 'pcArmada'],
    });
  }

  async findOne(idDetalleCarrito: number) {
    const detalleCarrito = await this.detalleCarritoRepository.findOne({
      where: { idDetalleCarrito },
      relations: ['carrito', 'producto', 'pcArmada'],
    });
    if (!detalleCarrito) {
      throw new NotFoundException(`Detalle de carrito con ID ${idDetalleCarrito} no encontrado`);
    }
    return detalleCarrito;
  }

  async update(idDetalleCarrito: number, updateDetalleCarritoDto: UpdateDetalleCarritoDto) {
    const detalleCarrito = await this.findOne(idDetalleCarrito);
    Object.assign(detalleCarrito, updateDetalleCarritoDto);
    return this.detalleCarritoRepository.save(detalleCarrito);
  }

  async remove(idDetalleCarrito: number) {
    const detalleCarrito = await this.findOne(idDetalleCarrito);
    await this.detalleCarritoRepository.remove(detalleCarrito);
    return { message: `Detalle de carrito con ID ${idDetalleCarrito} eliminado correctamente` };
  }
}
