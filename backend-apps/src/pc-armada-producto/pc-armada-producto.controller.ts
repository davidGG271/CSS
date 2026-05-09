import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { PcArmadaProductoService } from './pc-armada-producto.service';
import { CreatePcArmadaProductoDto } from './dto/create-pc-armada-producto.dto';

@Controller('pc-armada-producto')
export class PcArmadaProductoController {
  constructor(private readonly pcArmadaProductoService: PcArmadaProductoService) {}

  @Post()
  create(@Body() createPcArmadaProductoDto: CreatePcArmadaProductoDto) {
    return this.pcArmadaProductoService.create(createPcArmadaProductoDto);
  }

  @Get()
  findAll() {
    return this.pcArmadaProductoService.findAll();
  }

  @Get('pc-armada/:idPcArmada')
  findByPcArmada(@Param('idPcArmada') idPcArmada: string) {
    return this.pcArmadaProductoService.findByPcArmada(+idPcArmada);
  }

  @Delete(':idPcArmada/:idProducto')
  remove(
    @Param('idPcArmada') idPcArmada: string,
    @Param('idProducto') idProducto: string,
  ) {
    return this.pcArmadaProductoService.remove(+idPcArmada, +idProducto);
  }
}
