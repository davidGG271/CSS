import { IsString, IsNumber, IsOptional, MinLength, MaxLength, Min, IsNotEmpty } from 'class-validator';

export class CreateProductoDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(80, { message: 'El nombre no puede exceder 80 caracteres' })
  nombre!: string;

  @IsNotEmpty({ message: 'La marca es requerida' })
  @IsString()
  @MaxLength(40, { message: 'La marca no puede exceder 40 caracteres' })
  marca!: string;

  @IsNotEmpty({ message: 'El precio es requerido' })
  @IsNumber()
  @Min(0, { message: 'El precio debe ser mayor a 0' })
  precio!: number;

  @IsNotEmpty({ message: 'El stock es requerido' })
  @IsNumber()
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock!: number;

  @IsNotEmpty({ message: 'La categoría es requerida' })
  @IsString()
  @MaxLength(30, { message: 'La categoría no puede exceder 30 caracteres' })
  categoria!: string;

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
