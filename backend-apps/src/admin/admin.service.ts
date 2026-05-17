import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { LoginAdminDto } from './dto/login-admin.dto';
import { ChangePasswordAdminDto } from './dto/change-password-admin.dto';
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

  async login(loginAdminDto: LoginAdminDto) {
    const admin = await this.adminRepository.findOne({
      where: { correo: loginAdminDto.correo },
    });

    if (!admin) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    const contrasenaValida = await bcrypt.compare(
      loginAdminDto.contrasena,
      admin.contrasena,
    );

    if (!contrasenaValida) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    return {
      id: admin.id,
      nombre: admin.nombre,
      correo: admin.correo,
      message: 'Login exitoso',
    };
  }

  async changePassword(id: number, changePasswordAdminDto: ChangePasswordAdminDto) {
    const admin = await this.adminRepository.findOne({ where: { id } });

    if (!admin) {
      throw new NotFoundException(`Admin con ID ${id} no encontrado`);
    }

    // Verificar que la contraseña actual sea correcta
    const contrasenaValida = await bcrypt.compare(
      changePasswordAdminDto.contrasenaActual,
      admin.contrasena,
    );

    if (!contrasenaValida) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    // Hash de la nueva contraseña
    const nuevaContrasenaHasheada = await bcrypt.hash(changePasswordAdminDto.nuevaContrasena, 10);

    await this.adminRepository.update(id, {
      contrasena: nuevaContrasenaHasheada,
    });

    return { message: 'Contraseña actualizada correctamente' };
  }
}
