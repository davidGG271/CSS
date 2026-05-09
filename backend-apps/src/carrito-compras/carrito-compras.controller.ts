import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CarritoComprasService } from './carrito-compras.service';
import { CreateCarritoComprasDto } from './dto/create-carrito-compras.dto';
import { UpdateCarritoComprasDto } from './dto/update-carrito-compras.dto';

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
