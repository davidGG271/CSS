import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PcArmadaService } from './pc-armada.service';
import { CreatePcArmadaDto } from './dto/create-pc-armada.dto';
import { UpdatePcArmadaDto } from './dto/update-pc-armada.dto';

@Controller('pc-armada')
export class PcArmadaController {
  constructor(private readonly pcArmadaService: PcArmadaService) {}

  @Post()
  create(@Body() createPcArmadaDto: CreatePcArmadaDto) {
    return this.pcArmadaService.create(createPcArmadaDto);
  }

  @Get()
  findAll() {
    return this.pcArmadaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pcArmadaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePcArmadaDto: UpdatePcArmadaDto) {
    return this.pcArmadaService.update(+id, updatePcArmadaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pcArmadaService.remove(+id);
  }
}
