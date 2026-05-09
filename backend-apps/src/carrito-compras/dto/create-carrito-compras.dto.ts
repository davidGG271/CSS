import { IsNumber, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';

export class CreateCarritoComprasDto {
  @IsNotEmpty({ message: 'El ID del cliente es requerido' })
  @IsNumber()
  idCliente!: number;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}
