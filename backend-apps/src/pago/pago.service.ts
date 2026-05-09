import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { Pago } from './entities/pago.entity';

@Injectable()
export class PagoService {
  constructor(
    @InjectRepository(Pago)
    private pagoRepository: Repository<Pago>,
  ) {}

  async create(createPagoDto: CreatePagoDto) {
    const pago = this.pagoRepository.create(createPagoDto);
    return this.pagoRepository.save(pago);
  }

  async findAll() {
    return this.pagoRepository.find({
      relations: ['pedido'],
    });
  }

  async findOne(id: number) {
    const pago = await this.pagoRepository.findOne({
      where: { idPago: id },
      relations: ['pedido'],
    });

    if (!pago) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }

    return pago;
  }

  async findByPedido(idPedido: number) {
    return this.pagoRepository.find({
      where: { idPedido },
      relations: ['pedido'],
    });
  }

  async update(id: number, updatePagoDto: UpdatePagoDto) {
    const pago = await this.pagoRepository.findOne({
      where: { idPago: id },
    });

    if (!pago) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }

    await this.pagoRepository.update(id, updatePagoDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const pago = await this.pagoRepository.findOne({
      where: { idPago: id },
    });

    if (!pago) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`);
    }

    await this.pagoRepository.remove(pago);
    return { message: `Pago con ID ${id} eliminado correctamente` };
  }
}
