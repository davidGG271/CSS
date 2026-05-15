import { api } from "./api";
import type { PcArmadaBackend } from "./cart-api";
import type { ProductoBackend } from "./products-api";

export interface PedidoDetalleBackend {
  idDetallePedido: number;
  cantidad: number;
  precio: number;
  producto?: ProductoBackend;
  pcArmada?: PcArmadaBackend;
}

export interface PagoBackend {
  idPago: number;
  monto: number;
  metodoPago: string;
  estado: string;
  fechaPago: string;
  codigoTransaccion: string;
}

export interface PedidoBackend {
  idPedido: number;
  idCliente: number;
  estado: string;
  fecha: string;
  detalles: PedidoDetalleBackend[];
  pagos: PagoBackend[];
}

export async function checkoutCart(input: {
  idCliente: number;
  idCarrito: number;
  metodoPago: string;
}) {
  const { data } = await api.post<PedidoBackend>("/pedido/checkout/carrito", {
    idCliente: input.idCliente,
    idCarrito: input.idCarrito,
    pago: {
      metodoPago: input.metodoPago,
    },
  });
  return data;
}

export async function getPedidosByCliente(idCliente: number) {
  const { data } = await api.get<PedidoBackend[]>(`/pedido/cliente/${idCliente}`);
  return data;
}
