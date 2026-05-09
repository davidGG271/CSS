import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Producto } from './entities/producto.entity';

@Injectable()
export class ProductoService {
  constructor(
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
  ) {}

  async create(createProductoDto: CreateProductoDto) {
    const producto = this.productoRepository.create(createProductoDto);
    return this.productoRepository.save(producto);
  }

  async findAll() {
    return this.productoRepository.find();
  }

  async findOne(idProducto: number) {
    const producto = await this.productoRepository.findOne({
      where: { idProducto },
    });
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }
    return producto;
  }

  async update(idProducto: number, updateProductoDto: UpdateProductoDto) {
    const producto = await this.findOne(idProducto);
    Object.assign(producto, updateProductoDto);
    return this.productoRepository.save(producto);
  }

  async remove(idProducto: number) {
    const producto = await this.findOne(idProducto);
    return this.productoRepository.remove(producto);
  }
}
