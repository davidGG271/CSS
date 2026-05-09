import { IsNumber, IsString, IsBoolean, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateDetalleCarritoDto {
  @IsNotEmpty({ message: 'El ID del carrito es requerido' })
  @IsNumber()
  idCarrito!: number;

  @IsNotEmpty({ message: 'El ID del producto es requerido' })
  @IsNumber()
  idProducto!: number;

  @IsNotEmpty({ message: 'El tipo de compra es requerido' })
  @IsString()
  @MaxLength(40, { message: 'El tipo de compra no puede exceder 40 caracteres' })
  TipoCompra!: string;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}
