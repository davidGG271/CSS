import { IsString, IsEmail, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateAdminDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(70, { message: 'El nombre no puede exceder 70 caracteres' })
  nombre!: string;

  @IsNotEmpty({ message: 'El correo es requerido' })
  @IsEmail({}, { message: 'Debe ser un correo válido' })
  correo!: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @MaxLength(255, { message: 'La contraseña no puede exceder 255 caracteres' })
  contrasena!: string;
}
