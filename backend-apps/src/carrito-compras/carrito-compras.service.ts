import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCarritoComprasDto } from './dto/create-carrito-compras.dto';
import { UpdateCarritoComprasDto } from './dto/update-carrito-compras.dto';
import { CarritoCompras } from './entities/carrito-compras.entity';

@Injectable()
export class CarritoComprasService {
  constructor(
    @InjectRepository(CarritoCompras)
    private carritoComprasRepository: Repository<CarritoCompras>,
  ) {}

  async create(createCarritoComprasDto: CreateCarritoComprasDto) {
    const carritoCompras = this.carritoComprasRepository.create(createCarritoComprasDto);
    return this.carritoComprasRepository.save(carritoCompras);
  }

  async findAll() {
    return this.carritoComprasRepository.find({ relations: ['cliente'] });
  }

  async findOne(idCarrito: number) {
    const carritoCompras = await this.carritoComprasRepository.findOne({
      where: { idCarrito },
      relations: ['cliente'],
    });
    if (!carritoCompras) {
      throw new NotFoundException('Carrito de compras no encontrado');
    }
    return carritoCompras;
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
}
