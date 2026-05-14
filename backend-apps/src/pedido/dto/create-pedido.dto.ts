import { IsNumber, IsString, IsDate, IsNotEmpty, MaxLength } from 'class-validator';

export class CreatePedidoDto {
  @IsNotEmpty({ message: 'El ID del cliente es requerido' })
  @IsNumber()
  idCliente!: number;

  @IsNotEmpty({ message: 'El estado es requerido' })
  @IsString()
  @MaxLength(20, { message: 'El estado no puede exceder 20 caracteres' })
  estado!: string;

  @IsNotEmpty({ message: 'La fecha es requerida' })
  @IsDate()
  fecha!: Date;
}
