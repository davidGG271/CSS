import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { Pedido } from './entities/pedido.entity';

@Injectable()
export class PedidoService {
  constructor(
    @InjectRepository(Pedido)
    private pedidoRepository: Repository<Pedido>,
  ) {}

  async create(createPedidoDto: CreatePedidoDto) {
    const pedido = this.pedidoRepository.create(createPedidoDto);
    return this.pedidoRepository.save(pedido);
  }

  async findAll() {
    return this.pedidoRepository.find({ relations: ['cliente'] });
  }

  async findOne(idPedido: number) {
    const pedido = await this.pedidoRepository.findOne({
      where: { idPedido },
      relations: ['cliente'],
    });
    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }
    return pedido;
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
