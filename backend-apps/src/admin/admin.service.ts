import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Admin } from './entities/admin.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {}

  async create(createAdminDto: CreateAdminDto) {
    // Verificar si el correo ya existe
    const adminExistente = await this.adminRepository.findOne({
      where: { correo: createAdminDto.correo },
    });
    if (adminExistente) {
      throw new ConflictException('El correo ya está registrado');
    }

    // Hash de la contraseña
    const contrasenaHasheada = await bcrypt.hash(createAdminDto.contrasena, 10);

    const admin = this.adminRepository.create({
      ...createAdminDto,
      contrasena: contrasenaHasheada,
    });

    return this.adminRepository.save(admin);
  }

  async findAll() {
    return this.adminRepository.find({
      select: ['id', 'nombre', 'correo', 'createdAt', 'updatedAt'],
    });
  }

  async findOne(id: number) {
    const admin = await this.adminRepository.findOne({
      where: { id },
      select: ['id', 'nombre', 'correo', 'createdAt', 'updatedAt'],
    });

    if (!admin) {
      throw new NotFoundException(`Admin con ID ${id} no encontrado`);
    }

    return admin;
  }

  async update(id: number, updateAdminDto: UpdateAdminDto) {
    const admin = await this.adminRepository.findOne({ where: { id } });

    if (!admin) {
      throw new NotFoundException(`Admin con ID ${id} no encontrado`);
    }

    // Verificar duplicidad de correo
    if (updateAdminDto.correo && updateAdminDto.correo !== admin.correo) {
      const existeCorreo = await this.adminRepository.findOne({
        where: { correo: updateAdminDto.correo },
      });
      if (existeCorreo) {
        throw new ConflictException('El correo ya está registrado');
      }
    }

    // Hash de contraseña si se envía
    if (updateAdminDto.contrasena) {
      updateAdminDto.contrasena = await bcrypt.hash(updateAdminDto.contrasena, 10);
    }

    await this.adminRepository.update(id, updateAdminDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const admin = await this.adminRepository.findOne({ where: { id } });

    if (!admin) {
      throw new NotFoundException(`Admin con ID ${id} no encontrado`);
    }

    await this.adminRepository.remove(admin);
    return { message: `Admin con ID ${id} eliminado correctamente` };
  }
}
