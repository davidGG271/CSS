import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PcArmadaService } from './pc-armada.service';
import { PcArmadaController } from './pc-armada.controller';
import { PcArmada } from './entities/pc-armada.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PcArmada])],
  controllers: [PcArmadaController],
  providers: [PcArmadaService],
  exports: [PcArmadaService],
})
export class PcArmadaModule {}
