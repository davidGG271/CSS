import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CarritoComprasService } from './carrito-compras.service';
import { CreateCarritoComprasDto } from './dto/create-carrito-compras.dto';
import { UpdateCarritoComprasDto } from './dto/update-carrito-compras.dto';
import { AddCarritoItemDto, UpdateCarritoItemDto } from './dto/carrito-item.dto';

@Controller('carrito-compras')
export class CarritoComprasController {
  constructor(private readonly carritoComprasService: CarritoComprasService) {}

  @Post()
  create(@Body() createCarritoComprasDto: CreateCarritoComprasDto) {
    return this.carritoComprasService.create(createCarritoComprasDto);
  }

  @Get()
  findAll() {
    return this.carritoComprasService.findAll();
  }

  @Get('cliente/:idCliente/activo')
  findActiveByCliente(@Param('idCliente') idCliente: string) {
    return this.carritoComprasService.findActiveByCliente(+idCliente);
  }

  @Post('items')
  addItem(@Body() addCarritoItemDto: AddCarritoItemDto) {
    return this.carritoComprasService.addItem(addCarritoItemDto);
  }

  @Patch('items/:idDetalleCarrito')
  updateItem(
    @Param('idDetalleCarrito') idDetalleCarrito: string,
    @Body() updateCarritoItemDto: UpdateCarritoItemDto,
  ) {
    return this.carritoComprasService.updateItem(
      +idDetalleCarrito,
      updateCarritoItemDto,
    );
  }

  @Delete('items/:idDetalleCarrito')
  removeItem(@Param('idDetalleCarrito') idDetalleCarrito: string) {
    return this.carritoComprasService.removeItem(+idDetalleCarrito);
  }

  @Delete(':idCarrito/items')
  clearItems(@Param('idCarrito') idCarrito: string) {
    return this.carritoComprasService.clearItems(+idCarrito);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carritoComprasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCarritoComprasDto: UpdateCarritoComprasDto) {
    return this.carritoComprasService.update(+id, updateCarritoComprasDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.carritoComprasService.remove(+id);
  }
}
