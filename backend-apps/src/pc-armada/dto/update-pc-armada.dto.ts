import { PartialType } from '@nestjs/mapped-types';
import { CreatePcArmadaDto } from './create-pc-armada.dto';

export class UpdatePcArmadaDto extends PartialType(CreatePcArmadaDto) {}
