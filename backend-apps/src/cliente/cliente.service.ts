import { Injectable, ConflictException, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { LoginClienteDto } from './dto/login-cliente.dto';
import { Cliente } from './entities/cliente.entity';

@Injectable()
export class ClienteService {
  constructor(
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
  ) {}

  async create(createClienteDto: CreateClienteDto) {
    // Verificar si el DNI ya existe
    const clienteExistenteDni = await this.clienteRepository.findOne({
      where: { dni: createClienteDto.dni },
    });
    if (clienteExistenteDni) {
      throw new ConflictException('El DNI ya está registrado');
    }

    // Verificar si el correo ya existe
    const clienteExistenteCorreo = await this.clienteRepository.findOne({
      where: { correo: createClienteDto.correo },
    });
    if (clienteExistenteCorreo) {
      throw new ConflictException('El correo ya está registrado');
    }

    // Hash de la contraseña
    const contrasenaHasheada = await bcrypt.hash(createClienteDto.contrasena, 10);

    const cliente = this.clienteRepository.create({
      ...createClienteDto,
      contrasena: contrasenaHasheada,
    });

    return this.clienteRepository.save(cliente);
  }

  async findAll() {
    return this.clienteRepository.find({
      select: ['idCliente', 'nombre', 'dni', 'correo', 'createdAt', 'updatedAt'],
    });
  }

  async findOne(idCliente: number) {
    const cliente = await this.clienteRepository.findOne({
      where: { idCliente },
      select: ['idCliente', 'nombre', 'dni', 'correo', 'createdAt', 'updatedAt'],
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${idCliente} no encontrado`);
    }

    return cliente;
  }

  async update(idCliente: number, updateClienteDto: UpdateClienteDto) {
    const cliente = await this.clienteRepository.findOne({ where: { idCliente } });

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${idCliente} no encontrado`);
    }

    // Verificar duplicidad de DNI
    if (updateClienteDto.dni && updateClienteDto.dni !== cliente.dni) {
      const existeDni = await this.clienteRepository.findOne({
        where: { dni: updateClienteDto.dni },
      });
      if (existeDni) {
        throw new ConflictException('El DNI ya está registrado');
      }
    }

    // Verificar duplicidad de correo
    if (updateClienteDto.correo && updateClienteDto.correo !== cliente.correo) {
      const existeCorreo = await this.clienteRepository.findOne({
        where: { correo: updateClienteDto.correo },
      });
      if (existeCorreo) {
        throw new ConflictException('El correo ya está registrado');
      }
    }

    // Hash de contraseña si se envía
    if (updateClienteDto.contrasena) {
      updateClienteDto.contrasena = await bcrypt.hash(updateClienteDto.contrasena, 10);
    }

    await this.clienteRepository.update(idCliente, updateClienteDto);
    return this.findOne(idCliente);
  }

  async remove(idCliente: number) {
    const cliente = await this.clienteRepository.findOne({ where: { idCliente } });

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${idCliente} no encontrado`);
    }

    await this.clienteRepository.remove(cliente);
    return { message: `Cliente con ID ${idCliente} eliminado correctamente` };
  }

  async login(loginClienteDto: LoginClienteDto) {
    const cliente = await this.clienteRepository.findOne({
      where: { correo: loginClienteDto.correo },
    });

    if (!cliente) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    const contrasenaValida = await bcrypt.compare(
      loginClienteDto.contrasena,
      cliente.contrasena,
    );

    if (!contrasenaValida) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    return {
      idCliente: cliente.idCliente,
      nombre: cliente.nombre,
      correo: cliente.correo,
      dni: cliente.dni,
      message: 'Login exitoso',
    };
  }
}
