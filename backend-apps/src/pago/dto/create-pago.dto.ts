import { IsNumber, IsString, IsDate, IsNotEmpty, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePagoDto {
  @IsNotEmpty({ message: 'El ID del pedido es requerido' })
  @IsNumber()
  idPedido!: number;

  @IsNotEmpty({ message: 'El monto es requerido' })
  @IsNumber()
  @Min(0, { message: 'El monto debe ser mayor a 0' })
  monto!: number;

  @IsNotEmpty({ message: 'El método de pago es requerido' })
  @IsString()
  @MaxLength(30, { message: 'El método de pago no puede exceder 30 caracteres' })
  metodoPago!: string;

  @IsNotEmpty({ message: 'El estado es requerido' })
  @IsString()
  @MaxLength(20, { message: 'El estado no puede exceder 20 caracteres' })
  estado!: string;

  @IsNotEmpty({ message: 'La fecha de pago es requerida' })
  @Type(() => Date)
  @IsDate({ message: 'La fecha de pago debe ser una fecha válida' })
  fechaPago!: Date;

  @IsNotEmpty({ message: 'El código de transacción es requerido' })
  @IsString()
  @MaxLength(100, { message: 'El código de transacción no puede exceder 100 caracteres' })
  codigoTransaccion!: string;
}
