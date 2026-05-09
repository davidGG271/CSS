import { IsNumber, IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreatePcArmadaProductoDto {
  @IsNotEmpty({ message: 'El ID de PC Armada es requerido' })
  @IsNumber()
  idPcArmada!: number;

  @IsNotEmpty({ message: 'El ID de Producto es requerido' })
  @IsNumber()
  idProducto!: number;

  @IsNotEmpty({ message: 'La cantidad es requerida' })
  @IsString()
  @MaxLength(80, { message: 'La cantidad no puede exceder 80 caracteres' })
  cantidad!: string;
}
