import { api } from "./api";
import type { Product } from "./products";

export interface ProductoBackend {
  idProducto: number;
  nombre: string;
  marca: string;
  precio: number;
  stock: number;
  categoria: string;
  tipo: string;
  descripcion: string;
}

function getProductEmoji(product: ProductoBackend) {
  const type = product.tipo?.toLowerCase();
  const category = product.categoria?.toLowerCase();

  if (type === "gpu") return "\u{1F3AE}";
  if (type === "cpu") return "\u{1F525}";
  if (type === "motherboard") return "\u{1F9E0}";
  if (type === "ram") return "\u26A1";
  if (type === "storage") return "\u{1F4BE}";
  if (type === "psu") return "\u{1F50C}";
  if (type === "case") return "\u{1F4E6}";
  if (type === "cooling") return "\u2744\uFE0F";
  if (category?.includes("monitor")) return "\u{1F5BC}\uFE0F";
  if (category?.includes("computadora") || category?.includes("desktop")) return "\u{1F5A5}\uFE0F";
  if (category?.includes("periferico")) return "\u2328\uFE0F";
  return "\u{1F9E9}";
}

export function mapProducto(p: ProductoBackend): Product {
  return {
    id: String(p.idProducto),
    name: p.nombre,
    brand: p.marca,
    price: Number(p.precio),
    stock: p.stock,
    category: p.categoria as Product["category"],
    componentType: p.tipo as Product["componentType"],
    description: p.descripcion,
    rating: 5,
    specs: [],
    emoji: getProductEmoji(p),
  };
}

export async function getProductos() {
  const { data } = await api.get<ProductoBackend[]>("/producto");
  return data.map(mapProducto);
}

export async function getProductoById(id: string | number) {
  const { data } = await api.get<ProductoBackend>(`/producto/${id}`);
  return mapProducto(data);
}
