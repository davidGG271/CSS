import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePcArmadaDto } from './dto/create-pc-armada.dto';
import { UpdatePcArmadaDto } from './dto/update-pc-armada.dto';
import { PcArmada } from './entities/pc-armada.entity';

@Injectable()
export class PcArmadaService {
  constructor(
    @InjectRepository(PcArmada)
    private pcArmadaRepository: Repository<PcArmada>,
  ) {}

  async create(createPcArmadaDto: CreatePcArmadaDto) {
    // Validar que al menos uno de idCliente o idAdmin esté presente
    if (!createPcArmadaDto.idCliente && !createPcArmadaDto.idAdmin) {
      throw new BadRequestException(
        'Debe proporcionar idCliente (PC personalizada) o idAdmin (PC catálogo base)',
      );
    }

    const pcArmada = this.pcArmadaRepository.create(createPcArmadaDto);
    return this.pcArmadaRepository.save(pcArmada);
  }

  async findAll() {
    return this.pcArmadaRepository.find({
      relations: ['cliente', 'admin', 'productos'],
    });
  }

  async findOne(id: number) {
    const pcArmada = await this.pcArmadaRepository.findOne({
      where: { idPcArmada: id },
      relations: ['cliente', 'admin', 'productos'],
    });

    if (!pcArmada) {
      throw new NotFoundException(`PC Armada con ID ${id} no encontrada`);
    }

    return pcArmada;
  }

  async update(id: number, updatePcArmadaDto: UpdatePcArmadaDto) {
    const pcArmada = await this.pcArmadaRepository.findOne({
      where: { idPcArmada: id },
    });

    if (!pcArmada) {
      throw new NotFoundException(`PC Armada con ID ${id} no encontrada`);
    }

    await this.pcArmadaRepository.update(id, updatePcArmadaDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const pcArmada = await this.pcArmadaRepository.findOne({
      where: { idPcArmada: id },
    });

    if (!pcArmada) {
      throw new NotFoundException(`PC Armada con ID ${id} no encontrada`);
    }

    await this.pcArmadaRepository.remove(pcArmada);
    return { message: `PC Armada con ID ${id} eliminada correctamente` };
  }
}
