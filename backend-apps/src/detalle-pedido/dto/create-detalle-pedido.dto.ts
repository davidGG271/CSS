import { IsNumber, IsNotEmpty, Min } from 'class-validator';

export class CreateDetallePedidoDto {
  @IsNotEmpty({ message: 'El ID del pedido es requerido' })
  @IsNumber()
  idPedido!: number;

  @IsNotEmpty({ message: 'El ID del producto es requerido' })
  @IsNumber()
  idProducto!: number;

  @IsNotEmpty({ message: 'La cantidad es requerida' })
  @IsNumber()
  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  cantidad!: number;

  @IsNotEmpty({ message: 'El precio es requerido' })
  @IsNumber()
  @Min(0, { message: 'El precio debe ser mayor a 0' })
  precio!: number;
}
