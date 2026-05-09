import { PartialType } from '@nestjs/mapped-types';
import { CreatePcArmadaProductoDto } from './create-pc-armada-producto.dto';

export class UpdatePcArmadaProductoDto extends PartialType(
  CreatePcArmadaProductoDto,
) {}
