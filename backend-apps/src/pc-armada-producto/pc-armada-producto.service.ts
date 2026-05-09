import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePcArmadaProductoDto } from './dto/create-pc-armada-producto.dto';
import { UpdatePcArmadaProductoDto } from './dto/update-pc-armada-producto.dto';
import { PcArmadaProducto } from './entities/pc-armada-producto.entity';

@Injectable()
export class PcArmadaProductoService {
  constructor(
    @InjectRepository(PcArmadaProducto)
    private pcArmadaProductoRepository: Repository<PcArmadaProducto>,
  ) {}

  async create(createPcArmadaProductoDto: CreatePcArmadaProductoDto) {
    const pcArmadaProducto = this.pcArmadaProductoRepository.create(
      createPcArmadaProductoDto,
    );
    return this.pcArmadaProductoRepository.save(pcArmadaProducto);
  }

  async findAll() {
    return this.pcArmadaProductoRepository.find({
      relations: ['pcArmada', 'producto'],
    });
  }

  async findByPcArmada(idPcArmada: number) {
    return this.pcArmadaProductoRepository.find({
      where: { idPcArmada },
      relations: ['pcArmada', 'producto'],
    });
  }

  async remove(idPcArmada: number, idProducto: number) {
    const pcArmadaProducto = await this.pcArmadaProductoRepository.findOne({
      where: { idPcArmada, idProducto },
    });

    if (!pcArmadaProducto) {
      throw new NotFoundException(
        `Relación entre PC Armada ${idPcArmada} y Producto ${idProducto} no encontrada`,
      );
    }

    await this.pcArmadaProductoRepository.remove(pcArmadaProducto);
    return { message: 'Producto removido de la PC Armada correctamente' };
  }
}
