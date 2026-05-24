export type Category =
  | "pc-componente"
  | "pc-desktop"
  | "monitores-accesorios"
  | "componentes"
  | "perifericos"
  | "computadoras"
  | "notebooks"
  | "monitores"
  | "gaming";

export type ComponentType =
  | "cpu"
  | "gpu"
  | "motherboard"
  | "ram"
  | "storage"
  | "psu"
  | "case"
  | "cooling";

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  componentType?: ComponentType;
  price: number;
  oldPrice?: number;
  rating: number;
  stock: number;
  badge?: string;
  description: string;
  specs: { label: string; value: string }[];
  emoji: string;
  image?: string;
}

export const categories: { slug: Category; name: string; emoji: string; description: string }[] = [
  { slug: "componentes", name: "Componentes", emoji: "🧩", description: "CPUs, GPUs, RAM, motherboards" },
  { slug: "perifericos", name: "Periféricos", emoji: "⌨️", description: "Teclados, mouse, headsets" },
  { slug: "computadoras", name: "PCs Armadas", emoji: "🖥️", description: "Equipos listos para usar" },
  { slug: "notebooks", name: "Notebooks", emoji: "💻", description: "Portátiles para todo uso" },
  { slug: "monitores", name: "Monitores", emoji: "🖼️", description: "Pantallas gaming y pro" },
  { slug: "gaming", name: "Gaming", emoji: "🎮", description: "Sillas, joysticks y más" },
];

export type CatalogCategorySlug =
  | "pc-componente"
  | "pc-desktop"
  | "monitores-accesorios"
  | "perifericos";

export const catalogCategories: {
  slug: CatalogCategorySlug;
  name: string;
  emoji: string;
  description: string;
  aliases: string[];
  componentTypes?: ComponentType[];
  subcategories: string[];
}[] = [
  {
    slug: "pc-componente",
    name: "PC Componente",
    emoji: "\u{1F9E9}",
    description: "Tarjetas graficas, placas madre, procesadores, memoria y mas",
    aliases: ["pc componente", "componentes", "componente"],
    componentTypes: ["gpu", "motherboard", "cpu", "storage", "case", "psu", "ram", "cooling"],
    subcategories: [
      "Tarjetas Graficas",
      "Placas Madre",
      "Procesadores",
      "Almacenamiento",
      "Case",
      "Fuente",
      "Memorias Ram",
      "Sistema de Refrigeracion",
    ],
  },
  {
    slug: "pc-desktop",
    name: "PC Desktop",
    emoji: "\u{1F5A5}\uFE0F",
    description: "Computadoras de escritorio y equipos gamer",
    aliases: ["pc desktop", "computadoras", "pc armada", "desktop", "pc gamer", "pc de escritorio"],
    subcategories: ["Pc de Escritorio", "Pc Gamer"],
  },
  {
    slug: "monitores-accesorios",
    name: "Monitores & Accesorios",
    emoji: "\u{1F5BC}\uFE0F",
    description: "Monitores gamer, curvos, 4K, profesionales y smart",
    aliases: ["monitores accesorios", "monitores", "monitor"],
    subcategories: [
      "Monitores Gamer",
      "Monitores Curvo",
      "Monitores 4k UHD",
      "Monitores Profesional",
      "Monitores Smart",
      "Monitores Standard",
    ],
  },
  {
    slug: "perifericos",
    name: "Perifericos",
    emoji: "\u2328\uFE0F",
    description: "Teclados, mouse, mouse pad, audifonos y parlantes",
    aliases: ["perifericos", "periferico", "teclado", "mouse", "mouse pad", "audifonos", "parlantes"],
    subcategories: ["Teclados", "Mouse", "Mouse Pad", "Audifonos", "Parlantes"],
  },
];

const catalogSubcategoryMatchers: Record<
  string,
  { componentTypes?: ComponentType[]; aliases: string[] }
> = {
  "tarjetas graficas": { componentTypes: ["gpu"], aliases: ["tarjeta grafica", "gpu", "geforce", "radeon", "rtx"] },
  "placas madre": { componentTypes: ["motherboard"], aliases: ["placa madre", "motherboard", "mainboard"] },
  procesadores: { componentTypes: ["cpu"], aliases: ["procesador", "cpu", "ryzen", "intel core"] },
  almacenamiento: { componentTypes: ["storage"], aliases: ["almacenamiento", "ssd", "hdd", "nvme", "disco"] },
  case: { componentTypes: ["case"], aliases: ["case", "gabinete"] },
  fuente: { componentTypes: ["psu"], aliases: ["fuente", "psu", "power supply"] },
  "memorias ram": { componentTypes: ["ram"], aliases: ["memoria ram", "ram", "ddr4", "ddr5"] },
  "sistema de refrigeracion": {
    componentTypes: ["cooling"],
    aliases: ["refrigeracion", "cooling", "cooler", "aio"],
  },
  "pc de escritorio": { aliases: ["pc de escritorio", "desktop", "pc armada", "computadora"] },
  "pc gamer": { aliases: ["pc gamer", "gamer", "gaming"] },
  "monitores gamer": { aliases: ["monitor gamer", "gaming", "ultragear"] },
  "monitores curvo": { aliases: ["monitor curvo", "curvo", "curved"] },
  "monitores 4k uhd": { aliases: ["4k", "uhd"] },
  "monitores profesional": { aliases: ["profesional", "pro", "studio"] },
  "monitores smart": { aliases: ["smart"] },
  "monitores standard": { aliases: ["standard", "estandar"] },
  teclados: { aliases: ["teclado", "keyboard"] },
  mouse: { aliases: ["mouse"] },
  "mouse pad": { aliases: ["mouse pad", "mousepad"] },
  audifonos: { aliases: ["audifonos", "auriculares", "headset"] },
  parlantes: { aliases: ["parlantes", "speaker", "speakers"] },
};

export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function productMatchesCatalogCategory(product: Product, slug: CatalogCategorySlug) {
  const category = catalogCategories.find((item) => item.slug === slug);
  if (!category) return false;

  if (category.componentTypes?.includes(product.componentType as ComponentType)) {
    return true;
  }

  const haystack = [
    product.category,
    product.componentType ?? "",
    product.name,
    product.brand,
    product.description,
  ]
    .map(normalizeText)
    .join(" ");

  return [...category.aliases, ...category.subcategories]
    .map(normalizeText)
    .some((alias) => haystack.includes(alias));
}

export function productMatchesCatalogSubcategory(product: Product, subcategory: string) {
  const matcher = catalogSubcategoryMatchers[normalizeText(subcategory)];
  if (!matcher) return true;

  if (matcher.componentTypes?.includes(product.componentType as ComponentType)) {
    return true;
  }

  const haystack = [
    product.category,
    product.componentType ?? "",
    product.name,
    product.brand,
    product.description,
  ]
    .map(normalizeText)
    .join(" ");

  return matcher.aliases.map(normalizeText).some((alias) => haystack.includes(alias));
}

export function productMatchesSearch(product: Product, query: string) {
  const terms = normalizeText(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;

  const haystack = [
    product.name,
    product.brand,
    product.category,
    product.componentType ?? "",
    product.description,
    ...product.specs.flatMap((spec) => [spec.label, spec.value]),
  ]
    .map(normalizeText)
    .join(" ");

  return terms.every((term) => haystack.includes(term));
}

export const builderSlots: { type: ComponentType; name: string; emoji: string; required: boolean }[] = [
  { type: "cpu", name: "Procesador (CPU)", emoji: "🔥", required: true },
  { type: "motherboard", name: "Motherboard", emoji: "🧠", required: true },
  { type: "gpu", name: "Placa de video (GPU)", emoji: "🎮", required: true },
  { type: "ram", name: "Memoria RAM", emoji: "⚡", required: true },
  { type: "storage", name: "Almacenamiento", emoji: "💾", required: true },
  { type: "psu", name: "Fuente (PSU)", emoji: "🔌", required: true },
  { type: "case", name: "Gabinete", emoji: "📦", required: true },
  { type: "cooling", name: "Refrigeración", emoji: "❄️", required: true },
];

export const products: Product[] = [
  {
    id: "rtx-4080",
    name: "GeForce RTX 4080 Super 16GB",
    brand: "NVIDIA",
    category: "componentes",
    componentType: "gpu",
    price: 1299990,
    oldPrice: 1499990,
    rating: 4.9,
    stock: 8,
    badge: "Top Ventas",
    description: "Placa de video de última generación con ray tracing y DLSS 3.5 para máximo rendimiento en 4K.",
    specs: [
      { label: "Memoria", value: "16GB GDDR6X" },
      { label: "CUDA Cores", value: "10240" },
      { label: "Boost Clock", value: "2.55 GHz" },
    ],
    emoji: "🎮",
  },
  {
    id: "rtx-4070",
    name: "GeForce RTX 4070 12GB",
    brand: "NVIDIA",
    category: "componentes",
    componentType: "gpu",
    price: 749990,
    rating: 4.7,
    stock: 12,
    description: "Excelente rendimiento 1440p con DLSS 3 y eficiencia energética.",
    specs: [
      { label: "Memoria", value: "12GB GDDR6X" },
      { label: "CUDA Cores", value: "5888" },
    ],
    emoji: "🎮",
  },
  {
    id: "rx-7800",
    name: "AMD Radeon RX 7800 XT 16GB",
    brand: "AMD",
    category: "componentes",
    componentType: "gpu",
    price: 689990,
    rating: 4.6,
    stock: 10,
    description: "GPU AMD ideal para QHD con gran cantidad de VRAM.",
    specs: [
      { label: "Memoria", value: "16GB GDDR6" },
      { label: "Stream Procs", value: "3840" },
    ],
    emoji: "🎮",
  },
  {
    id: "ryzen-9",
    name: "AMD Ryzen 9 7950X",
    brand: "AMD",
    category: "componentes",
    componentType: "cpu",
    price: 749990,
    rating: 4.8,
    stock: 14,
    description: "Procesador de 16 núcleos y 32 hilos para creadores y gamers exigentes.",
    specs: [
      { label: "Núcleos", value: "16 / 32 hilos" },
      { label: "Boost", value: "5.7 GHz" },
      { label: "Socket", value: "AM5" },
    ],
    emoji: "🔥",
  },
  {
    id: "ryzen-7",
    name: "AMD Ryzen 7 7700X",
    brand: "AMD",
    category: "componentes",
    componentType: "cpu",
    price: 379990,
    rating: 4.7,
    stock: 20,
    description: "8 núcleos y 16 hilos perfectos para gaming y multitarea.",
    specs: [
      { label: "Núcleos", value: "8 / 16 hilos" },
      { label: "Boost", value: "5.4 GHz" },
      { label: "Socket", value: "AM5" },
    ],
    emoji: "🔥",
  },
  {
    id: "intel-i7",
    name: "Intel Core i7-14700K",
    brand: "Intel",
    category: "componentes",
    componentType: "cpu",
    price: 459990,
    rating: 4.8,
    stock: 11,
    description: "20 núcleos híbridos para máximo rendimiento gaming y productividad.",
    specs: [
      { label: "Núcleos", value: "20 (8P + 12E)" },
      { label: "Boost", value: "5.6 GHz" },
      { label: "Socket", value: "LGA1700" },
    ],
    emoji: "🔥",
  },
  {
    id: "intel-i5",
    name: "Intel Core i5-14600K",
    brand: "Intel",
    category: "componentes",
    componentType: "cpu",
    price: 319990,
    rating: 4.7,
    stock: 18,
    description: "Excelente CPU mid-range para gaming.",
    specs: [
      { label: "Núcleos", value: "14 (6P + 8E)" },
      { label: "Boost", value: "5.3 GHz" },
      { label: "Socket", value: "LGA1700" },
    ],
    emoji: "🔥",
  },
  {
    id: "mb-x670",
    name: "ASUS ROG Strix X670E-F",
    brand: "ASUS",
    category: "componentes",
    componentType: "motherboard",
    price: 389990,
    rating: 4.7,
    stock: 9,
    description: "Motherboard premium AM5 con WiFi 6E y PCIe 5.0.",
    specs: [
      { label: "Socket", value: "AM5" },
      { label: "Chipset", value: "X670E" },
      { label: "Formato", value: "ATX" },
    ],
    emoji: "🧠",
  },
  {
    id: "mb-b650",
    name: "MSI MAG B650 Tomahawk",
    brand: "MSI",
    category: "componentes",
    componentType: "motherboard",
    price: 229990,
    rating: 4.6,
    stock: 15,
    description: "Motherboard AM5 robusta con gran VRM para Ryzen 7000.",
    specs: [
      { label: "Socket", value: "AM5" },
      { label: "Chipset", value: "B650" },
      { label: "Formato", value: "ATX" },
    ],
    emoji: "🧠",
  },
  {
    id: "mb-z790",
    name: "Gigabyte Z790 Aorus Elite",
    brand: "Gigabyte",
    category: "componentes",
    componentType: "motherboard",
    price: 299990,
    rating: 4.7,
    stock: 12,
    description: "Motherboard LGA1700 para Intel 13/14 gen con DDR5 y PCIe 5.0.",
    specs: [
      { label: "Socket", value: "LGA1700" },
      { label: "Chipset", value: "Z790" },
      { label: "Formato", value: "ATX" },
    ],
    emoji: "🧠",
  },
  {
    id: "ddr5-32",
    name: "Corsair Vengeance DDR5 32GB",
    brand: "Corsair",
    category: "componentes",
    componentType: "ram",
    price: 159990,
    oldPrice: 189990,
    rating: 4.7,
    stock: 22,
    description: "Kit de memoria 2x16GB DDR5 6000MHz con disipador premium.",
    specs: [
      { label: "Capacidad", value: "32GB (2x16)" },
      { label: "Velocidad", value: "6000 MHz" },
      { label: "Latencia", value: "CL30" },
    ],
    emoji: "⚡",
  },
  {
    id: "ddr5-64",
    name: "G.Skill Trident Z5 64GB",
    brand: "G.Skill",
    category: "componentes",
    componentType: "ram",
    price: 299990,
    rating: 4.8,
    stock: 8,
    description: "Kit 2x32GB DDR5 6400MHz para workstations y creadores.",
    specs: [
      { label: "Capacidad", value: "64GB (2x32)" },
      { label: "Velocidad", value: "6400 MHz" },
      { label: "Latencia", value: "CL32" },
    ],
    emoji: "⚡",
  },
  {
    id: "ddr5-16",
    name: "Kingston Fury Beast 16GB",
    brand: "Kingston",
    category: "componentes",
    componentType: "ram",
    price: 89990,
    rating: 4.6,
    stock: 30,
    description: "Kit 2x8GB DDR5 5200MHz, gran relación precio/rendimiento.",
    specs: [
      { label: "Capacidad", value: "16GB (2x8)" },
      { label: "Velocidad", value: "5200 MHz" },
    ],
    emoji: "⚡",
  },
  {
    id: "ssd-1tb",
    name: "Samsung 990 Pro 1TB NVMe",
    brand: "Samsung",
    category: "componentes",
    componentType: "storage",
    price: 139990,
    rating: 4.9,
    stock: 25,
    description: "SSD NVMe Gen4 con velocidades de hasta 7450 MB/s.",
    specs: [
      { label: "Capacidad", value: "1TB" },
      { label: "Lectura", value: "7450 MB/s" },
      { label: "Interfaz", value: "PCIe 4.0" },
    ],
    emoji: "💾",
  },
  {
    id: "ssd-2tb",
    name: "WD Black SN850X 2TB",
    brand: "Western Digital",
    category: "componentes",
    componentType: "storage",
    price: 249990,
    rating: 4.8,
    stock: 14,
    description: "SSD NVMe Gen4 de alto rendimiento para gamers.",
    specs: [
      { label: "Capacidad", value: "2TB" },
      { label: "Lectura", value: "7300 MB/s" },
    ],
    emoji: "💾",
  },
  {
    id: "ssd-500",
    name: "Crucial P3 Plus 500GB",
    brand: "Crucial",
    category: "componentes",
    componentType: "storage",
    price: 69990,
    rating: 4.5,
    stock: 40,
    description: "SSD NVMe económico ideal para sistema operativo.",
    specs: [
      { label: "Capacidad", value: "500GB" },
      { label: "Lectura", value: "5000 MB/s" },
    ],
    emoji: "💾",
  },
  {
    id: "psu-850",
    name: "Corsair RM850x 850W 80+ Gold",
    brand: "Corsair",
    category: "componentes",
    componentType: "psu",
    price: 189990,
    rating: 4.9,
    stock: 16,
    description: "Fuente full-modular silenciosa con certificación 80+ Gold.",
    specs: [
      { label: "Potencia", value: "850W" },
      { label: "Certificación", value: "80+ Gold" },
      { label: "Modular", value: "Full" },
    ],
    emoji: "🔌",
  },
  {
    id: "psu-650",
    name: "EVGA SuperNova 650 G6",
    brand: "EVGA",
    category: "componentes",
    componentType: "psu",
    price: 129990,
    rating: 4.7,
    stock: 20,
    description: "Fuente compacta 80+ Gold ideal para builds mid-range.",
    specs: [
      { label: "Potencia", value: "650W" },
      { label: "Certificación", value: "80+ Gold" },
    ],
    emoji: "🔌",
  },
  {
    id: "psu-1000",
    name: "Seasonic Prime TX-1000 1000W",
    brand: "Seasonic",
    category: "componentes",
    componentType: "psu",
    price: 329990,
    rating: 4.9,
    stock: 6,
    description: "Fuente premium 80+ Titanium para builds de alto consumo.",
    specs: [
      { label: "Potencia", value: "1000W" },
      { label: "Certificación", value: "80+ Titanium" },
    ],
    emoji: "🔌",
  },
  {
    id: "case-nzxt",
    name: "NZXT H7 Flow",
    brand: "NZXT",
    category: "componentes",
    componentType: "case",
    price: 159990,
    rating: 4.8,
    stock: 13,
    description: "Gabinete mid-tower con excelente flujo de aire y panel de cristal.",
    specs: [
      { label: "Formato", value: "Mid-Tower ATX" },
      { label: "Panel", value: "Vidrio templado" },
    ],
    emoji: "📦",
  },
  {
    id: "case-lian",
    name: "Lian Li O11 Dynamic EVO",
    brand: "Lian Li",
    category: "componentes",
    componentType: "case",
    price: 219990,
    rating: 4.9,
    stock: 9,
    description: "Gabinete premium con doble cámara, ideal para custom water loops.",
    specs: [
      { label: "Formato", value: "Mid-Tower" },
      { label: "Panel", value: "Doble vidrio" },
    ],
    emoji: "📦",
  },
  {
    id: "case-fractal",
    name: "Fractal Design Pop Air",
    brand: "Fractal",
    category: "componentes",
    componentType: "case",
    price: 99990,
    rating: 4.6,
    stock: 18,
    description: "Gabinete económico con buen flujo de aire y diseño minimalista.",
    specs: [{ label: "Formato", value: "Mid-Tower ATX" }],
    emoji: "📦",
  },
  {
    id: "cool-aio",
    name: "NZXT Kraken X63 280mm AIO",
    brand: "NZXT",
    category: "componentes",
    componentType: "cooling",
    price: 219990,
    rating: 4.8,
    stock: 10,
    description: "Refrigeración líquida AIO 280mm con pantalla LCD personalizable.",
    specs: [
      { label: "Tipo", value: "Líquida AIO" },
      { label: "Radiador", value: "280mm" },
    ],
    emoji: "❄️",
  },
  {
    id: "cool-air",
    name: "Noctua NH-D15 chromax.black",
    brand: "Noctua",
    category: "componentes",
    componentType: "cooling",
    price: 159990,
    rating: 4.9,
    stock: 12,
    description: "El mejor cooler por aire del mercado, silencioso y eficiente.",
    specs: [
      { label: "Tipo", value: "Aire dual-tower" },
      { label: "Ventiladores", value: "2x 140mm" },
    ],
    emoji: "❄️",
  },
  {
    id: "kb-mech",
    name: "Teclado Mecánico K100 RGB",
    brand: "Corsair",
    category: "perifericos",
    price: 219990,
    rating: 4.8,
    stock: 12,
    badge: "Nuevo",
    description: "Switches ópticos OPX, doshot PBT y rueda multimedia de aluminio.",
    specs: [
      { label: "Switch", value: "Cherry MX OPX" },
      { label: "Iluminación", value: "RGB per-key" },
      { label: "Conexión", value: "USB-C" },
    ],
    emoji: "⌨️",
  },
  {
    id: "mouse-pro",
    name: "Logitech G Pro X Superlight 2",
    brand: "Logitech",
    category: "perifericos",
    price: 139990,
    rating: 4.9,
    stock: 30,
    description: "Mouse inalámbrico ultra liviano (60g) con sensor HERO 2 de 32K DPI.",
    specs: [
      { label: "Peso", value: "60 g" },
      { label: "Sensor", value: "HERO 2" },
      { label: "Batería", value: "95 hs" },
    ],
    emoji: "🖱️",
  },
  {
    id: "headset-arctis",
    name: "SteelSeries Arctis Nova Pro",
    brand: "SteelSeries",
    category: "perifericos",
    price: 249990,
    rating: 4.7,
    stock: 9,
    description: "Auriculares con audio Hi-Res, cancelación activa de ruido y batería intercambiable.",
    specs: [
      { label: "Driver", value: "40mm Neo" },
      { label: "Audio", value: "Hi-Res 96kHz" },
      { label: "ANC", value: "Activa" },
    ],
    emoji: "🎧",
  },
  {
    id: "pc-titan",
    name: "PC Titan RTX — i7 + RTX 4070",
    brand: "CyC",
    category: "computadoras",
    price: 1899990,
    oldPrice: 2099990,
    rating: 4.9,
    stock: 5,
    badge: "Armado por CyC",
    description: "Equipo gamer premium armado a mano por nuestros técnicos. 1 año de garantía.",
    specs: [
      { label: "CPU", value: "Intel Core i7-14700K" },
      { label: "GPU", value: "RTX 4070 12GB" },
      { label: "RAM", value: "32GB DDR5" },
      { label: "SSD", value: "1TB NVMe Gen4" },
    ],
    emoji: "🖥️",
  },
  {
    id: "pc-creator",
    name: "PC Creator Studio Pro",
    brand: "CyC",
    category: "computadoras",
    price: 2499990,
    rating: 4.9,
    stock: 3,
    description: "Workstation para diseño 3D, edición 8K y desarrollo profesional.",
    specs: [
      { label: "CPU", value: "Ryzen 9 7950X" },
      { label: "GPU", value: "RTX 4080 Super" },
      { label: "RAM", value: "64GB DDR5" },
      { label: "SSD", value: "2TB NVMe" },
    ],
    emoji: "🎬",
  },
  {
    id: "nb-rog",
    name: "ASUS ROG Zephyrus G16",
    brand: "ASUS",
    category: "notebooks",
    price: 2299990,
    rating: 4.8,
    stock: 6,
    description: "Notebook gamer ultradelgada con pantalla OLED 240Hz.",
    specs: [
      { label: "CPU", value: "Intel Core Ultra 9" },
      { label: "GPU", value: "RTX 4070" },
      { label: "Pantalla", value: '16" OLED 240Hz' },
    ],
    emoji: "💻",
  },
  {
    id: "nb-mac",
    name: "MacBook Pro 14 M3 Pro",
    brand: "Apple",
    category: "notebooks",
    price: 2799990,
    rating: 4.9,
    stock: 4,
    badge: "Pro",
    description: "Chip M3 Pro, pantalla Liquid Retina XDR y batería para 18 horas.",
    specs: [
      { label: "Chip", value: "M3 Pro 12-core" },
      { label: "RAM", value: "18GB unificada" },
      { label: "SSD", value: "512GB" },
    ],
    emoji: "🍎",
  },
  {
    id: "mon-oled",
    name: "Monitor LG UltraGear OLED 27",
    brand: "LG",
    category: "monitores",
    price: 899990,
    rating: 4.8,
    stock: 7,
    description: 'Monitor OLED 27" QHD 240Hz, 0.03ms para gaming competitivo.',
    specs: [
      { label: "Tamaño", value: '27" OLED' },
      { label: "Resolución", value: "QHD 240Hz" },
      { label: "Respuesta", value: "0.03 ms" },
    ],
    emoji: "🖼️",
  },
  {
    id: "chair-gaming",
    name: "Silla Gamer Secretlab Titan Evo",
    brand: "Secretlab",
    category: "gaming",
    price: 599990,
    rating: 4.9,
    stock: 11,
    description: "Silla ergonómica premium con soporte lumbar magnético.",
    specs: [
      { label: "Material", value: "Neo Hybrid Leatherette" },
      { label: "Carga máx.", value: "130 kg" },
      { label: "Reclinación", value: "165°" },
    ],
    emoji: "🪑",
  },
];

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", maximumFractionDigits: 0 }).format(n);

export const SHIPPING_FEE_PEN = 15;
export const FREE_SHIPPING_THRESHOLD_PEN = 500;
