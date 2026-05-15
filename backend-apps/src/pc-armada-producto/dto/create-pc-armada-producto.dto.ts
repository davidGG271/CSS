import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreatePcArmadaProductoDto {
  @IsNotEmpty({ message: 'El ID de PC Armada es requerido' })
  @IsNumber()
  idPcArmada!: number;

  @IsNotEmpty({ message: 'El ID de Producto es requerido' })
  @IsNumber()
  idProducto!: number;

  @IsNotEmpty({ message: 'La cantidad es requerida' })
  @IsNumber()
  cantidad!: number;
}
