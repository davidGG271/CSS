import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginAdminDto {
  @IsNotEmpty({ message: 'El correo es requerido' })
  @IsEmail({}, { message: 'Debe ser un correo válido' })
  correo!: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  contrasena!: string;
}
