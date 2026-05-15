import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CheckoutPedidoItemDto {
  @IsOptional()
  @IsNumber()
  idProducto?: number;

  @IsOptional()
  @IsNumber()
  idPcArmada?: number;

  @IsNumber()
  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  cantidad!: number;
}

export class CheckoutPagoDto {
  @IsNotEmpty({ message: 'El metodo de pago es requerido' })
  @IsString()
  @MaxLength(30, { message: 'El metodo de pago no puede exceder 30 caracteres' })
  metodoPago!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'El codigo de transaccion no puede exceder 100 caracteres' })
  codigoTransaccion?: string;
}

export class CheckoutPedidoDto {
  @IsNotEmpty({ message: 'El ID del cliente es requerido' })
  @IsNumber()
  idCliente!: number;

  @IsOptional()
  @IsNumber()
  idCarrito?: number;

  @IsArray()
  @ArrayMinSize(1, { message: 'El pedido debe tener al menos un item' })
  @ValidateNested({ each: true })
  @Type(() => CheckoutPedidoItemDto)
  items!: CheckoutPedidoItemDto[];

  @IsNotEmpty({ message: 'Los datos de pago son requeridos' })
  @ValidateNested()
  @Type(() => CheckoutPagoDto)
  pago!: CheckoutPagoDto;
}

export class CheckoutCarritoDto {
  @IsNotEmpty({ message: 'El ID del cliente es requerido' })
  @IsNumber()
  idCliente!: number;

  @IsNotEmpty({ message: 'El ID del carrito es requerido' })
  @IsNumber()
  idCarrito!: number;

  @IsNotEmpty({ message: 'Los datos de pago son requeridos' })
  @ValidateNested()
  @Type(() => CheckoutPagoDto)
  pago!: CheckoutPagoDto;
}
