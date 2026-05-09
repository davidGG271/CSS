import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDetallePedidoDto } from './dto/create-detalle-pedido.dto';
import { UpdateDetallePedidoDto } from './dto/update-detalle-pedido.dto';
import { DetallePedido } from './entities/detalle-pedido.entity';

@Injectable()
export class DetallePedidoService {
  constructor(
    @InjectRepository(DetallePedido)
    private detallePedidoRepository: Repository<DetallePedido>,
  ) {}

  async create(createDetallePedidoDto: CreateDetallePedidoDto) {
    const detallePedido = this.detallePedidoRepository.create(createDetallePedidoDto);
    return this.detallePedidoRepository.save(detallePedido);
  }

  async findAll() {
    return this.detallePedidoRepository.find({ relations: ['pedido', 'producto'] });
  }

  async findOne(idDetallePedido: number) {
    const detallePedido = await this.detallePedidoRepository.findOne({
      where: { idDetallePedido },
      relations: ['pedido', 'producto'],
    });
    if (!detallePedido) {
      throw new NotFoundException('Detalle de pedido no encontrado');
    }
    return detallePedido;
  }

  async update(idDetallePedido: number, updateDetallePedidoDto: UpdateDetallePedidoDto) {
    const detallePedido = await this.findOne(idDetallePedido);
    Object.assign(detallePedido, updateDetallePedidoDto);
    return this.detallePedidoRepository.save(detallePedido);
  }

  async remove(idDetallePedido: number) {
    const detallePedido = await this.findOne(idDetallePedido);
    return this.detallePedidoRepository.remove(detallePedido);
  }
}
