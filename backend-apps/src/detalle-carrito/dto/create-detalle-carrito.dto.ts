import { IsNumber, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class CreateDetalleCarritoDto {
  @IsNotEmpty({ message: 'El ID del carrito es requerido' })
  @IsNumber()
  idCarrito!: number;

  @IsOptional()
  @IsNumber()
  idProducto?: number;

  @IsOptional()
  @IsNumber()
  idPcArmada?: number;

  @IsNotEmpty({ message: 'La cantidad es requerida' })
  @IsNumber()
  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  cantidad!: number;
}
