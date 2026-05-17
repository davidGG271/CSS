import axios from "axios";
import { type Product, type ProductCategory, type Order, type OrderItem, type OrderStatus } from "./store";

// Configuración global de Axios
export const api = axios.create({
  baseURL: "http://localhost:3000", // La URL de tu backend en NestJS
  headers: {
    "Content-Type": "application/json",
  },
});

// Interfaz de cómo viene el producto desde NestJS
export interface BackendProducto {
  idProducto?: number;
  nombre: string;
  marca: string;
  precio: string | number; // A veces TypeORM devuelve los decimales como string
  stock: number;
  categoria: string;
  tipo: string;
  descripcion: string;
  imagen?: string; // Asumimos que viene como texto Base64 modificado en tu backend
  createdAt?: string;
  updatedAt?: string;
}

// Convertir Base64 a Objeto Buffer para NestJS/TypeORM
const base64ToBuffer = (base64Image: string) => {
  if (!base64Image || !base64Image.includes("base64,")) return undefined;
  
  const base64Data = base64Image.split("base64,")[1];
  const binaryString = window.atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // Node.js/TypeORM entiende este formato exacto como un Buffer binario
  return {
    type: "Buffer",
    data: Array.from(bytes),
  };
};

// Convertir Objeto Buffer de NestJS a Base64 para React
const bufferToBase64 = (bufferObj?: any) => {
  if (!bufferObj) return "";
  
  // Si ya es un string (caso raro o error de configuración), lo devolvemos
  if (typeof bufferObj === "string") return bufferObj;

  // Si viene como el formato { type: 'Buffer', data: [...] }
  if (bufferObj.type === "Buffer" && Array.isArray(bufferObj.data)) {
    const bytes = new Uint8Array(bufferObj.data);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = window.btoa(binary);
    // Asumimos jpeg por defecto, aunque puede ser png. Los navegadores suelen renderizarlo igual.
    return `data:image/jpeg;base64,${base64}`;
  }

  return "";
};

// ==========================================
// ADAPTERS (Traductores Backend <-> Frontend)
// ==========================================

// Traduce de Backend (Español/Base de datos) a Frontend (Inglés/Dashboard)
export const mapProductoToProduct = (item: BackendProducto): Product => {
  return {
    id: String(item.idProducto),
    name: item.nombre,
    brand: item.marca,
    price: Number(item.precio),
    stock: item.stock,
    category: item.categoria as ProductCategory,
    type: item.tipo,
    description: item.descripcion,
    image: bufferToBase64(item.imagen),
    // Autorellenado visual:
    status: "Activo",
    discount: 0, 
  };
};

// Traduce de Frontend (Dashboard) a Backend (Español/Base de datos) para crear/editar
export const mapProductToProducto = (item: Omit<Product, "id"> | Partial<Product>): Partial<BackendProducto> => {
  const backendItem: Partial<BackendProducto> = {};
  
  if (item.name !== undefined) backendItem.nombre = item.name;
  if (item.brand !== undefined) backendItem.marca = item.brand;
  if (item.price !== undefined) backendItem.precio = item.price;
  if (item.stock !== undefined) backendItem.stock = item.stock;
  if (item.category !== undefined) backendItem.categoria = item.category;
  if (item.type !== undefined) backendItem.tipo = item.type;
  if (item.description !== undefined) backendItem.descripcion = item.description;
  if (item.image !== undefined) {
    // Convertimos la imagen de React a un objeto binario que NestJS/TypeORM entienda
    const buffer = base64ToBuffer(item.image);
    if (buffer) backendItem.imagen = buffer as any;
  }

  return backendItem;
};

// ==========================================
// SERVICIOS CRUD
// ==========================================

export const getProducts = async (): Promise<Product[]> => {
  // Ajusta la ruta '/producto' si tu controlador en NestJS tiene otra
  const { data } = await api.get<BackendProducto[]>("/producto");
  return data.map(mapProductoToProduct);
};

export const createProduct = async (product: Omit<Product, "id">): Promise<Product> => {
  const payload = mapProductToProducto(product);
  const { data } = await api.post<BackendProducto>("/producto", payload);
  return mapProductoToProduct(data);
};

export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
  const payload = mapProductToProducto(product);
  const { data } = await api.patch<BackendProducto>(`/producto/${id}`, payload);
  return mapProductoToProduct(data);
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/producto/${id}`);
};

// ==========================================
// INTERFACES + SERVICIOS: CLIENTES
// ==========================================

export interface BackendClienteCompleto {
  idCliente: number;
  nombre: string;
  dni: string;
  correo: string;
}

export interface ClienteFrontend {
  id: string;
  name: string;
  email: string;
  dni: string;
  phone: string;
  address: string;
  status: "Activo" | "Bloqueado";
  purchases: number;
  joinedAt: string;
}

export const mapClienteToFrontend = (c: BackendClienteCompleto): ClienteFrontend => ({
  id: String(c.idCliente),
  name: c.nombre,
  email: c.correo,
  dni: c.dni,
  phone: "",
  address: "",
  status: "Activo",
  purchases: 0,
  joinedAt: new Date().toISOString().slice(0, 10),
});

export const getClientes = async (): Promise<ClienteFrontend[]> => {
  const { data } = await api.get<BackendClienteCompleto[]>("/cliente");
  return data.map(mapClienteToFrontend);
};

export const deleteCliente = async (id: string): Promise<void> => {
  await api.delete(`/cliente/${id}`);
};

export interface BackendPcArmada {
  idPcArmada?: number;
  idCliente?: number;
  idAdmin?: number;
  nombre: string;
  precio: number;
  stock: number;
  tipo: string;
  descripcion: string;
  imagen?: any;
  createdAt?: string;
  updatedAt?: string;
  productos?: BackendPcArmadaProducto[];
}

export interface BackendPcArmadaProducto {
  idPcArmada: number;
  idProducto: number;
  cantidad: number;
  producto?: BackendProducto;
}

export const getPcArmadas = async (): Promise<BackendPcArmada[]> => {
  const { data } = await api.get<BackendPcArmada[]>("/pc-armada");
  return data.map(pc => ({
    ...pc,
    imagen: bufferToBase64(pc.imagen)
  }));
};

export const createPcArmada = async (pc: Partial<BackendPcArmada>): Promise<BackendPcArmada> => {
  const payload = { ...pc };
  if (payload.imagen && typeof payload.imagen === "string") {
    payload.imagen = base64ToBuffer(payload.imagen) as any;
  }
  const { data } = await api.post<BackendPcArmada>("/pc-armada", payload);
  return data;
};

export const updatePcArmada = async (id: number, pc: Partial<BackendPcArmada>): Promise<BackendPcArmada> => {
  const payload = { ...pc };
  if (payload.imagen && typeof payload.imagen === "string") {
    payload.imagen = base64ToBuffer(payload.imagen) as any;
  }
  const { data } = await api.patch<BackendPcArmada>(`/pc-armada/${id}`, payload);
  return data;
};

export const updatePcArmadaStock = async (id: number, stock: number): Promise<BackendPcArmada> => {
  const { data } = await api.patch<BackendPcArmada>(`/pc-armada/${id}`, { stock });
  return data;
};

export const deletePcArmada = async (id: number): Promise<void> => {
  await api.delete(`/pc-armada/${id}`);
};

export const createPcArmadaProducto = async (payload: BackendPcArmadaProducto): Promise<void> => {
  await api.post("/pc-armada-producto", payload);
};

export interface SendCampaignPayload {
  titulo: string;
  mensaje: string;
  tipo: string;
  clientes: { nombre: string; correo: string }[];
  productos: { id: string; nombre: string; precio: number; imagen: string; stock: number }[];
}

export const sendCampaign = async (payload: SendCampaignPayload): Promise<void> => {
  await api.post("/notificacion/enviar-campana", payload);
};

// ==========================================
// INTERFACES BACKEND: PEDIDOS
// ==========================================

export interface BackendCliente {
  idCliente: number;
  nombre: string;
  dni: string;
  correo: string;
}

export interface BackendDetallePedido {
  idDetallePedido: number;
  cantidad: number;
  precio: string | number;
  producto?: BackendProducto;
}

export interface BackendPago {
  idPago: number;
  monto: string | number;
  metodoPago: string;
  estado: string;
  codigoTransaccion: string;
}

export interface BackendPedido {
  idPedido: number;
  TipoCompra: string;
  estado: string; // lowercase - así lo devuelve el backend
  fecha: string;
  cliente?: BackendCliente;
  detalles?: BackendDetallePedido[];
  pagos?: BackendPago[];
}

// ==========================================
// ADAPTERS: PEDIDOS
// ==========================================

export const mapPedidoToOrder = (item: BackendPedido): Order => {
  // El backend puede devolver estado o Estado según la versión
  const estadoActual = (item.estado || (item as any).Estado || "Pagado") as OrderStatus;
  const fecha = item.fecha ? String(item.fecha).slice(0, 10) : new Date().toISOString().slice(0, 10);
  
  const history: { status: OrderStatus; date: string }[] = [];
  
  // Lógica de historial dinámico asumiendo el flujo: Pagado -> En preparación -> Entregado
  if (estadoActual === "Pagado" || estadoActual === "En preparación" || estadoActual === "Entregado") {
    history.push({ status: "Pagado", date: fecha });
  }
  if (estadoActual === "En preparación" || estadoActual === "Entregado") {
    history.push({ status: "En preparación", date: fecha });
  }
  if (estadoActual === "Entregado") {
    history.push({ status: "Entregado", date: fecha });
  }
  if (estadoActual === "Cancelado") {
    history.push({ status: "Pagado", date: fecha }); // Asumiendo pago antes de cancelar
    history.push({ status: "Cancelado", date: fecha });
  }
  
  // Si no hay historial (ej. un estado raro como "Pendiente"), poner el actual
  if (history.length === 0) {
    history.push({ status: estadoActual || "Pagado", date: fecha });
  }

  // Obtener el pago principal (si existe en el array)
  const pago = item.pagos && item.pagos.length > 0 ? item.pagos[0] : null;

  return {
    id: String(item.idPedido), // Directo como string, sin prefijo "ORD-"
    customerId: item.cliente ? String(item.cliente.idCliente) : "",
    customerName: item.cliente ? item.cliente.nombre : "Cliente Desconocido",
    date: fecha,
    total: pago ? Number(pago.monto) : 0,
    paymentMethod: (pago ? pago.metodoPago : "Tarjeta") as any,
    status: estadoActual || "Pagado",
    address: "", // Se elimina visualmente, pero se manda vacío por la interfaz TS
    transactionCode: pago ? pago.codigoTransaccion : "N/A",
    items: item.detalles ? item.detalles.map(d => ({
      productId: d.producto ? String(d.producto.idProducto) : "",
      name: d.producto ? d.producto.nombre : "Producto Genérico",
      quantity: d.cantidad,
      price: Number(d.precio)
    })) : [],
    history
  };
};

// ==========================================
// SERVICIOS CRUD: PEDIDOS
// ==========================================

export const getOrders = async (): Promise<Order[]> => {
  const { data } = await api.get<BackendPedido[]>("/pedido");
  return data.map(mapPedidoToOrder);
};

export const updateOrderStatus = async (id: string, status: string): Promise<Order> => {
  const { data } = await api.patch<BackendPedido>(`/pedido/${id}`, { estado: status });
  return mapPedidoToOrder(data);
};

