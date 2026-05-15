import { api } from "./api";
import type { ProductoBackend } from "./products-api";

export interface PcArmadaBackend {
  idPcArmada: number;
  nombre: string;
  precio: number;
  stock: number;
  tipo: string;
  descripcion: string;
}

export interface DetalleCarritoBackend {
  idDetalleCarrito: number;
  idCarrito: number;
  idProducto?: number;
  idPcArmada?: number;
  cantidad: number;
  producto?: ProductoBackend;
  pcArmada?: PcArmadaBackend;
}

export interface CarritoBackend {
  idCarrito: number;
  idCliente: number;
  isVisible: boolean;
  detalles: DetalleCarritoBackend[];
}

export async function getActiveCart(idCliente: number) {
  const { data } = await api.get<CarritoBackend>(`/carrito-compras/cliente/${idCliente}/activo`);
  return data;
}

export async function addCartProduct(idCliente: number, idProducto: number, cantidad = 1) {
  const { data } = await api.post<CarritoBackend>("/carrito-compras/items", {
    idCliente,
    idProducto,
    cantidad,
  });
  return data;
}

export async function addCartPcArmada(idCliente: number, idPcArmada: number, cantidad = 1) {
  const { data } = await api.post<CarritoBackend>("/carrito-compras/items", {
    idCliente,
    idPcArmada,
    cantidad,
  });
  return data;
}

export async function updateCartItem(idDetalleCarrito: number, cantidad: number) {
  const { data } = await api.patch<CarritoBackend>(`/carrito-compras/items/${idDetalleCarrito}`, {
    cantidad,
  });
  return data;
}

export async function removeCartItem(idDetalleCarrito: number) {
  const { data } = await api.delete<CarritoBackend>(`/carrito-compras/items/${idDetalleCarrito}`);
  return data;
}

export async function clearCartItems(idCarrito: number) {
  const { data } = await api.delete<CarritoBackend>(`/carrito-compras/${idCarrito}/items`);
  return data;
}
