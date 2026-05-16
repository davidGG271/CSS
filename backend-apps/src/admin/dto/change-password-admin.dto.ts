import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordAdminDto {
  @IsString()
  @IsNotEmpty()
  contrasenaActual!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
  nuevaContrasena!: string;
}
