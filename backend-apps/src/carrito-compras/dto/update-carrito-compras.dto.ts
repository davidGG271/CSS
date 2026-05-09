import { PartialType } from '@nestjs/mapped-types';
import { CreateCarritoComprasDto } from './create-carrito-compras.dto';

export class UpdateCarritoComprasDto extends PartialType(CreateCarritoComprasDto) {}
