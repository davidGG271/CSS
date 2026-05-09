import { IsString, IsNumber, MinLength, MaxLength, IsOptional, IsNotEmpty } from 'class-validator';

export class CreatePcArmadaDto {
  @IsOptional()
  @IsNumber()
  idCliente?: number;

  @IsOptional()
  @IsNumber()
  idAdmin?: number;

  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(80, { message: 'El nombre no puede exceder 80 caracteres' })
  nombre!: string;

  @IsNotEmpty({ message: 'El precio es requerido' })
  @IsNumber()
  precio!: number;

  @IsNotEmpty({ message: 'El stock es requerido' })
  @IsNumber()
  stock!: number;

  @IsNotEmpty({ message: 'El tipo es requerido' })
  @IsString()
  @MaxLength(30, { message: 'El tipo no puede exceder 30 caracteres' })
  tipo!: string;

  @IsOptional()
  imagen?: Buffer;

  @IsNotEmpty({ message: 'La descripción es requerida' })
  @IsString()
  @MaxLength(300, { message: 'La descripción no puede exceder 300 caracteres' })
  descripcion!: string;
}
