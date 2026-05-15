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
    emoji: "🧩",
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
