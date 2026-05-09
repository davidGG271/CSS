import { IsNumber, IsString, IsDate, IsNotEmpty, MaxLength } from 'class-validator';

export class CreatePedidoDto {
  @IsNotEmpty({ message: 'El ID del cliente es requerido' })
  @IsNumber()
  idCliente!: number;

  @IsNotEmpty({ message: 'El tipo de compra es requerido' })
  @IsString()
  @MaxLength(40, { message: 'El tipo de compra no puede exceder 40 caracteres' })
  TipoCompra!: string;

  @IsNotEmpty({ message: 'El estado es requerido' })
  @IsString()
  @MaxLength(20, { message: 'El estado no puede exceder 20 caracteres' })
  Estado!: string;

  @IsNotEmpty({ message: 'La fecha es requerida' })
  @IsDate()
  fecha!: Date;
}
