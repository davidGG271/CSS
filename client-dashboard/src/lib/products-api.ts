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
  imagen?: any;
}

export const bufferToBase64 = (bufferObj?: any) => {
  if (!bufferObj) return "";
  if (typeof bufferObj === "string") return bufferObj;
  if (bufferObj.type === "Buffer" && Array.isArray(bufferObj.data)) {
    const bytes = new Uint8Array(bufferObj.data);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    // Si lo que se guardó fue una URL pura en formato binario
    if (binary.startsWith("http") || binary.startsWith("data:")) {
      return binary;
    }

    const base64 = window.btoa(binary);
    return `data:image/jpeg;base64,${base64}`;
  }
  return "";
};


function getProductEmoji(product: ProductoBackend) {
  const type = product.tipo?.toLowerCase();
  const category = product.categoria?.toLowerCase();

  if (type?.includes("grafica") || type?.includes("gpu")) return "\u{1F3AE}";
  if (type?.includes("procesador") || type?.includes("cpu")) return "\u{1F525}";
  if (type?.includes("placa") || type?.includes("motherboard")) return "\u{1F9E0}";
  if (type?.includes("ram")) return "\u26A1";
  if (type?.includes("almacenamiento") || type?.includes("storage")) return "\u{1F4BE}";
  if (type?.includes("fuente") || type?.includes("psu")) return "\u{1F50C}";
  if (type?.includes("case")) return "\u{1F4E6}";
  if (type?.includes("refrigeracion") || type?.includes("cooling")) return "\u2744\uFE0F";
  if (category?.includes("monitor")) return "\u{1F5BC}\uFE0F";
  if (category?.includes("computadora") || category?.includes("desktop") || type?.includes("pc")) return "\u{1F5A5}\uFE0F";
  if (category?.includes("periferico") || category?.includes("periféricos")) return "\u2328\uFE0F";
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
    image: bufferToBase64(p.imagen),
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
