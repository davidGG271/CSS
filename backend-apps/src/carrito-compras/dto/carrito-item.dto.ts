import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class AddCarritoItemDto {
  @IsNotEmpty({ message: 'El ID del cliente es requerido' })
  @IsNumber()
  idCliente!: number;

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

export class UpdateCarritoItemDto {
  @IsNotEmpty({ message: 'La cantidad es requerida' })
  @IsNumber()
  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  cantidad!: number;
}
