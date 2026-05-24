import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ProductCategory =
  | "pc-componente"
  | "pc-desktop"
  | "monitores-accesorios"
  | "perifericos";

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "pc-componente",
  "pc-desktop",
  "monitores-accesorios",
  "perifericos",
];

export const PRODUCT_TYPES = [
  "Tarjetas Graficas",
  "Placas Madres",
  "Procesadores",
  "Almacenamiento",
  "Case",
  "Fuente",
  "Memorias Ram",
  "Sistema de Refrigeracion",
  "Pc de Escritorio",
  "Pc Gamer",
  "Monitores Curvo",
  "Monitores Gamer",
  "Monitores 4k UHD",
  "Monitores Profesional",
  "Monitores Smart",
  "Monitores Standard",
  "Teclados",
  "Mouse"
];

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  type: string;
  price: number;
  stock: number;
  description: string;
  image: string;
  status: "Activo" | "Inactivo";
  discount: number;
  // Optional spec for compatibility
  socket?: string; // CPU/Motherboard
  wattage?: number; // PSU output / component consumption
  consumption?: number; // estimated W consumption
}

export type OrderStatus =
  | "Pendiente"
  | "Pagado"
  | "En preparación"
  | "Entregado"
  | "Cancelado";

export const ORDER_STATUSES: OrderStatus[] = [
  "Pendiente",
  "Pagado",
  "En preparación",
  "Entregado",
  "Cancelado",
];

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  total: number;
  paymentMethod: "Tarjeta" | "Yape" | "Plin" | "Transferencia" | "Efectivo";
  status: OrderStatus;
  address: string;
  transactionCode: string;
  items: OrderItem[];
  history: { status: OrderStatus; date: string }[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  dni: string;
  phone: string;
  address: string;
  purchases: number;
  status: "Activo" | "Bloqueado";
  joinedAt: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: "Entrada" | "Salida";
  quantity: number;
  date: string;
  reason: string;
}

export interface PCBuild {
  id: string;
  name: string;
  componentIds: string[];
  totalPrice: number;
  estimatedConsumption: number;
  createdAt: string;
}

export interface NotificationCampaign {
  id: string;
  title: string;
  message: string;
  type: "Promoción" | "Nuevo producto" | "Newsletter";
  audience: string;
  sentAt: string;
  reach: number;
}

export interface Settings {
  storeName: string;
  logoText: string;
  taxRate: number;
  currency: string;
  shippingFlat: number;
  paymentMethods: string[];
}

interface AdminState {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  movements: InventoryMovement[];
  builds: PCBuild[];
  campaigns: NotificationCampaign[];
  settings: Settings;
  // products
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  // orders
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  cancelOrder: (id: string) => void;
  // customers
  updateCustomer: (id: string, c: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  toggleBlockCustomer: (id: string) => void;
  // inventory
  addMovement: (m: Omit<InventoryMovement, "id" | "date">) => void;
  // builds
  addBuild: (b: Omit<PCBuild, "id" | "createdAt">) => void;
  updateBuild: (id: string, b: Partial<PCBuild>) => void;
  deleteBuild: (id: string) => void;
  // campaigns
  addCampaign: (c: Omit<NotificationCampaign, "id" | "sentAt" | "reach">) => void;
  deleteCampaign: (id: string) => void;
  // settings
  updateSettings: (s: Partial<Settings>) => void;
  resetData: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

const seedProducts: Product[] = [
  { id: "p1", name: "Ryzen 7 7800X3D", brand: "AMD", category: "pc-componente", type: "Procesadores", price: 1599, stock: 12, description: "8 núcleos / 16 hilos, ideal para gaming.", image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400", status: "Activo", discount: 5, socket: "AM5", consumption: 120 },
  { id: "p2", name: "Core i7-14700K", brand: "Intel", category: "pc-componente", type: "Procesadores", price: 1799, stock: 9, description: "Alto rendimiento gaming y productividad.", image: "https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400", status: "Activo", discount: 0, socket: "LGA1700", consumption: 125 },
  { id: "p3", name: "RTX 4070 Super", brand: "NVIDIA", category: "pc-componente", type: "Tarjetas Graficas", price: 2899, stock: 6, description: "DLSS 3, ray tracing 1440p.", image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400", status: "Activo", discount: 10, consumption: 220 },
  { id: "p4", name: "RX 7800 XT", brand: "AMD", category: "pc-componente", type: "Tarjetas Graficas", price: 2399, stock: 4, description: "16GB GDDR6, 1440p ultra.", image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400", status: "Activo", discount: 0, consumption: 263 },
  { id: "p5", name: "Trident Z5 32GB DDR5 6400", brand: "G.Skill", category: "pc-componente", type: "Memorias Ram", price: 599, stock: 22, description: "Kit 2x16GB DDR5 RGB.", image: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=400", status: "Activo", discount: 0, consumption: 10 },
  { id: "p6", name: "Vengeance 16GB DDR4 3200", brand: "Corsair", category: "pc-componente", type: "Memorias Ram", price: 199, stock: 35, description: "Kit 2x8GB DDR4.", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400", status: "Activo", discount: 0, consumption: 8 },
  { id: "p7", name: "Samsung 980 Pro 1TB", brand: "Samsung", category: "pc-componente", type: "Almacenamiento", price: 419, stock: 18, description: "PCIe 4.0, 7000MB/s lectura.", image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400", status: "Activo", discount: 5, consumption: 7 },
  { id: "p8", name: "Crucial P3 500GB", brand: "Crucial", category: "pc-componente", type: "Almacenamiento", price: 169, stock: 2, description: "Económico y veloz.", image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400", status: "Activo", discount: 0, consumption: 5 },
  { id: "p9", name: "ROG Strix X670E-E", brand: "ASUS", category: "pc-componente", type: "Placas Madres", price: 1599, stock: 7, description: "AM5 PCIe 5.0 WiFi 6E.", image: "https://images.unsplash.com/photo-1600348759986-9e8a2e5d92e2?w=400", status: "Activo", discount: 0, socket: "AM5", consumption: 25 },
  { id: "p10", name: "MSI Z790 Tomahawk", brand: "MSI", category: "pc-componente", type: "Placas Madres", price: 1299, stock: 5, description: "Z790 DDR5.", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400", status: "Activo", discount: 0, socket: "LGA1700", consumption: 25 },
  { id: "p11", name: "RM850x 80+ Gold", brand: "Corsair", category: "pc-componente", type: "Fuente", price: 599, stock: 14, description: "Modular 850W certificada Gold.", image: "https://images.unsplash.com/photo-1587202372583-49330a15584d?w=400", status: "Activo", discount: 0, wattage: 850 },
  { id: "p12", name: "Thermaltake Smart 500W", brand: "Thermaltake", category: "pc-componente", type: "Fuente", price: 199, stock: 0, description: "Fuente de entrada 500W.", image: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=400", status: "Activo", discount: 0, wattage: 500 },
  { id: "p13", name: "Lian Li O11 Dynamic", brand: "Lian Li", category: "pc-componente", type: "Case", price: 549, stock: 8, description: "Case panorámico vidrio templado.", image: "https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=400", status: "Activo", discount: 0 },
  { id: "p14", name: "NZXT H5 Flow", brand: "NZXT", category: "pc-componente", type: "Case", price: 399, stock: 11, description: "Flujo de aire optimizado.", image: "https://images.unsplash.com/photo-1591489378430-ef2f4c626b35?w=400", status: "Activo", discount: 0 },
  { id: "p15", name: "Kraken X63 RGB", brand: "NZXT", category: "pc-componente", type: "Sistema de Refrigeracion", price: 699, stock: 6, description: "Refrigeración líquida AIO RGB.", image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400", status: "Activo", discount: 5, consumption: 15 },
  { id: "p16", name: "HyperX Cloud III", brand: "HyperX", category: "perifericos", type: "Auriculares", price: 349, stock: 25, description: "Headset gaming inalámbrico.", image: "https://images.unsplash.com/photo-1518443895914-0f56cd0b8762?w=400", status: "Activo", discount: 0 },
];

const seedCustomers: Customer[] = [
  { id: "c1", name: "Diego Ramírez", email: "diego@gamer.pe", dni: "47238921", phone: "+51 987654321", address: "Av. Javier Prado 1234, Lima", purchases: 7, status: "Activo", joinedAt: "2024-08-12" },
  { id: "c2", name: "Lucía Fernández", email: "lucia@mail.com", dni: "70123456", phone: "+51 912345678", address: "Calle Las Begonias 456, Surco", purchases: 3, status: "Activo", joinedAt: "2024-11-04" },
  { id: "c3", name: "Mateo Quispe", email: "mateo.q@hotmail.com", dni: "44889912", phone: "+51 998877665", address: "Jr. Cusco 789, Cercado", purchases: 12, status: "Activo", joinedAt: "2024-02-22" },
  { id: "c4", name: "Andrea Solís", email: "andrea.s@gmail.com", dni: "73218890", phone: "+51 956784321", address: "Av. Brasil 2100, Magdalena", purchases: 1, status: "Bloqueado", joinedAt: "2025-01-18" },
  { id: "c5", name: "Renato Vargas", email: "renato@vargas.pe", dni: "41557788", phone: "+51 933221100", address: "Av. Salaverry 901, Jesús María", purchases: 5, status: "Activo", joinedAt: "2024-06-09" },
];

const orderHistory = (s: OrderStatus): { status: OrderStatus; date: string }[] => [
  { status: "Pendiente", date: "2025-05-01" },
  { status: s, date: "2025-05-03" },
];

const seedOrders: Order[] = [
  { id: "ORD-1042", customerId: "c1", customerName: "Diego Ramírez", date: "2025-05-08", total: 4297, paymentMethod: "Tarjeta", status: "Enviado", address: "Av. Javier Prado 1234, Lima", transactionCode: "TX-998211", items: [{ productId: "p3", name: "RTX 4070 Super", quantity: 1, price: 2899 }, { productId: "p1", name: "Ryzen 7 7800X3D", quantity: 1, price: 1599 }, { productId: "p7", name: "Samsung 980 Pro 1TB", quantity: 1, price: 419 }], history: orderHistory("Enviado") },
  { id: "ORD-1041", customerId: "c2", customerName: "Lucía Fernández", date: "2025-05-08", total: 798, paymentMethod: "Yape", status: "Pagado", address: "Calle Las Begonias 456, Surco", transactionCode: "TX-998210", items: [{ productId: "p5", name: "Trident Z5 32GB DDR5 6400", quantity: 1, price: 599 }, { productId: "p7", name: "Samsung 980 Pro 1TB", quantity: 1, price: 419 }], history: orderHistory("Pagado") },
  { id: "ORD-1040", customerId: "c3", customerName: "Mateo Quispe", date: "2025-05-07", total: 2399, paymentMethod: "Transferencia", status: "Entregado", address: "Jr. Cusco 789, Cercado", transactionCode: "TX-998200", items: [{ productId: "p4", name: "RX 7800 XT", quantity: 1, price: 2399 }], history: orderHistory("Entregado") },
  { id: "ORD-1039", customerId: "c5", customerName: "Renato Vargas", date: "2025-05-06", total: 549, paymentMethod: "Plin", status: "Pendiente", address: "Av. Salaverry 901, Jesús María", transactionCode: "TX-998180", items: [{ productId: "p13", name: "Lian Li O11 Dynamic", quantity: 1, price: 549 }], history: orderHistory("Pendiente") },
  { id: "ORD-1038", customerId: "c1", customerName: "Diego Ramírez", date: "2025-05-05", total: 1798, paymentMethod: "Tarjeta", status: "En preparación", address: "Av. Javier Prado 1234, Lima", transactionCode: "TX-998170", items: [{ productId: "p9", name: "ROG Strix X670E-E", quantity: 1, price: 1599 }, { productId: "p6", name: "Vengeance 16GB DDR4 3200", quantity: 1, price: 199 }], history: orderHistory("En preparación") },
];

const seedMovements: InventoryMovement[] = [];

const seedCampaigns: NotificationCampaign[] = [
  { id: "n1", title: "Black Friday Gamer", message: "Hasta 30% en GPUs seleccionadas.", type: "Promoción", audience: "Todos los clientes", sentAt: "2025-05-01T10:00:00Z", reach: 1240 },
  { id: "n2", title: "Nueva RTX 4070 Super", message: "Ya disponible en stock.", type: "Nuevo producto", audience: "Suscriptores", sentAt: "2025-04-22T18:30:00Z", reach: 860 },
];

const initialSettings: Settings = {
  storeName: "CyC Computer",
  logoText: "CC",
  taxRate: 18,
  currency: "PEN",
  shippingFlat: 25,
  paymentMethods: ["Tarjeta", "Yape", "Plin", "Transferencia"],
};

export const useAdmin = create<AdminState>()(
  persist(
    (set) => ({
      products: seedProducts,
      orders: seedOrders,
      customers: seedCustomers,
      movements: seedMovements,
      builds: [],
      campaigns: seedCampaigns,
      settings: initialSettings,

      addProduct: (p) => set((s) => ({ products: [{ ...p, id: uid() }, ...s.products] })),
      updateProduct: (id, p) => set((s) => ({ products: s.products.map((x) => (x.id === id ? { ...x, ...p } : x)) })),
      deleteProduct: (id) => set((s) => ({ products: s.products.filter((x) => x.id !== id) })),

      updateOrderStatus: (id, status) => set((s) => ({
        orders: s.orders.map((o) =>
          o.id === id ? { ...o, status, history: [...o.history, { status, date: now().slice(0, 10) }] } : o,
        ),
      })),
      cancelOrder: (id) => set((s) => ({
        orders: s.orders.map((o) =>
          o.id === id ? { ...o, status: "Cancelado", history: [...o.history, { status: "Cancelado", date: now().slice(0, 10) }] } : o,
        ),
      })),

      updateCustomer: (id, c) => set((s) => ({ customers: s.customers.map((x) => (x.id === id ? { ...x, ...c } : x)) })),
      deleteCustomer: (id) => set((s) => ({ customers: s.customers.filter((x) => x.id !== id) })),
      toggleBlockCustomer: (id) => set((s) => ({
        customers: s.customers.map((x) => (x.id === id ? { ...x, status: x.status === "Activo" ? "Bloqueado" : "Activo" } : x)),
      })),

      addMovement: (m) => set((s) => {
        const movement: InventoryMovement = { ...m, id: uid(), date: now().slice(0, 10) };
        const products = s.products.map((p) =>
          p.id === m.productId
            ? { ...p, stock: p.stock + (m.type === "Entrada" ? m.quantity : -m.quantity) }
            : p,
        );
        return { movements: [movement, ...s.movements], products };
      }),

      addBuild: (b) => set((s) => ({ builds: [{ ...b, id: uid(), createdAt: now() }, ...s.builds] })),
      updateBuild: (id, b) => set((s) => ({ builds: s.builds.map((x) => (x.id === id ? { ...x, ...b } : x)) })),
      deleteBuild: (id) => set((s) => ({ builds: s.builds.filter((x) => x.id !== id) })),

      addCampaign: (c) => set((s) => ({
        campaigns: [{ ...c, id: uid(), sentAt: now(), reach: Math.floor(500 + Math.random() * 2000) }, ...s.campaigns],
      })),
      deleteCampaign: (id) => set((s) => ({ campaigns: s.campaigns.filter((x) => x.id !== id) })),

      updateSettings: (s2) => set((s) => ({ settings: { ...s.settings, ...s2 } })),

      resetData: () => set({
        products: seedProducts,
        orders: seedOrders,
        customers: seedCustomers,
        movements: seedMovements,
        builds: [],
        campaigns: seedCampaigns,
        settings: initialSettings,
      }),
    }),
    { name: "cyc-admin-v2" },
  ),
);

export const formatCurrency = (n: number, currency = "PEN") =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
