import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PedidoService } from './pedido.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { CheckoutCarritoDto, CheckoutPedidoDto } from './dto/checkout-pedido.dto';

@Controller('pedido')
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  @Post()
  create(@Body() createPedidoDto: CreatePedidoDto) {
    return this.pedidoService.create(createPedidoDto);
  }

  @Post('checkout')
  checkout(@Body() checkoutPedidoDto: CheckoutPedidoDto) {
    return this.pedidoService.checkout(checkoutPedidoDto);
  }

  @Post('checkout/carrito')
  checkoutCarrito(@Body() checkoutCarritoDto: CheckoutCarritoDto) {
    return this.pedidoService.checkoutCarrito(checkoutCarritoDto);
  }

  @Get()
  findAll() {
    return this.pedidoService.findAll();
  }

  @Get('cliente/:idCliente')
  findByCliente(@Param('idCliente') idCliente: string) {
    return this.pedidoService.findByCliente(+idCliente);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pedidoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePedidoDto: UpdatePedidoDto) {
    return this.pedidoService.update(+id, updatePedidoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pedidoService.remove(+id);
  }
}
