import { api } from "./api";
import type { PcArmadaBackend } from "./cart-api";

export async function createPcArmada(input: {
  idCliente: number;
  nombre: string;
  precio: number;
  stock: number;
  tipo: string;
  descripcion: string;
}) {
  const { data } = await api.post<PcArmadaBackend>("/pc-armada", input);
  return data;
}

export async function addProductoToPcArmada(input: {
  idPcArmada: number;
  idProducto: number;
  cantidad: number;
}) {
  const { data } = await api.post("/pc-armada-producto", input);
  return data;
}
