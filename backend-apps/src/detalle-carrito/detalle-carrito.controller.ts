import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DetalleCarritoService } from './detalle-carrito.service';
import { CreateDetalleCarritoDto } from './dto/create-detalle-carrito.dto';
import { UpdateDetalleCarritoDto } from './dto/update-detalle-carrito.dto';

@Controller('detalle-carrito')
export class DetalleCarritoController {
  constructor(private readonly detalleCarritoService: DetalleCarritoService) {}

  @Post()
  create(@Body() createDetalleCarritoDto: CreateDetalleCarritoDto) {
    return this.detalleCarritoService.create(createDetalleCarritoDto);
  }

  @Get()
  findAll() {
    return this.detalleCarritoService.findAll();
  }

  @Get('carrito/:idCarrito')
  findByCarrito(@Param('idCarrito') idCarrito: string) {
    return this.detalleCarritoService.findByCarrito(+idCarrito);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.detalleCarritoService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDetalleCarritoDto: UpdateDetalleCarritoDto,
  ) {
    return this.detalleCarritoService.update(+id, updateDetalleCarritoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.detalleCarritoService.remove(+id);
  }
}
