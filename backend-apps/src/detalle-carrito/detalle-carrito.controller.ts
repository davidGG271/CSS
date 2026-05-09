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

  @Get(':idCarrito/:idProducto')
  findOne(
    @Param('idCarrito') idCarrito: string,
    @Param('idProducto') idProducto: string,
  ) {
    return this.detalleCarritoService.findOne(+idCarrito, +idProducto);
  }

  @Patch(':idCarrito/:idProducto')
  update(
    @Param('idCarrito') idCarrito: string,
    @Param('idProducto') idProducto: string,
    @Body() updateDetalleCarritoDto: UpdateDetalleCarritoDto,
  ) {
    return this.detalleCarritoService.update(+idCarrito, +idProducto, updateDetalleCarritoDto);
  }

  @Delete(':idCarrito/:idProducto')
  remove(
    @Param('idCarrito') idCarrito: string,
    @Param('idProducto') idProducto: string,
  ) {
    return this.detalleCarritoService.remove(+idCarrito, +idProducto);
  }
}
