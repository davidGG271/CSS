import { PartialType } from '@nestjs/mapped-types';
import { CreateDetalleCarritoDto } from './create-detalle-carrito.dto';

export class UpdateDetalleCarritoDto extends PartialType(CreateDetalleCarritoDto) {}
