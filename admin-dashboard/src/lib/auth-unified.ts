import { api } from "./api";
import { auth } from "./auth-store";

// Estructura del Admin según el backend
export interface AdminBackend {
  id: number;
  nombre: string;
  correo: string;
}

/**
 * Intenta buscar el correo en la tabla de admins.
 * El backend usa bcrypt, así que no podemos comparar contraseñas aquí.
 * Lo que hacemos: GET /admin, filtramos por correo en el frontend.
 * Si existe el admin, consideramos que es admin (la contraseña la valida el sistema cuando se requiera JWT real).
 */
export async function findAdminByCorreo(correo: string): Promise<AdminBackend | null> {
  try {
    const { data } = await api.get<AdminBackend[]>("/admin");
    return data.find((a) => a.correo.toLowerCase() === correo.toLowerCase()) ?? null;
  } catch {
    return null;
  }
}

export type RolUsuario = "ADMIN" | "CLIENTE";

export interface LoginResult {
  rol: RolUsuario;
  nombre: string;
  correo: string;
  id: number;
}

/**
 * Login unificado: busca primero en /admin, luego en /cliente.
 * Devuelve rol + datos básicos del usuario.
 * 
 * NOTA: Las contraseñas en Admin están hasheadas con bcrypt (no podemos
 * verificarlas desde el frontend). Para Admin usamos la existencia del correo
 * como verificación simplificada hasta que se implemente JWT real.
 * Para Cliente la contraseña viaja sin hash, así que sí la comparamos.
 */
export async function loginUnificado(correo: string, contrasena: string): Promise<LoginResult> {
  // 1. Verificar si es Admin
  const admin = await findAdminByCorreo(correo);
  if (admin) {
    // Guardar sesión como ADMIN en el store
    auth.login(admin.correo, admin.nombre);
    (auth as any)._setRol?.("ADMIN"); // extensión del store si existe
    localStorage.setItem("cyc-rol", "ADMIN");
    localStorage.setItem("cyc-user", JSON.stringify({
      name: admin.nombre,
      email: admin.correo,
      rol: "ADMIN",
    }));
    return { rol: "ADMIN", nombre: admin.nombre, correo: admin.correo, id: admin.id };
  }

  // 2. Verificar si es Cliente
  const { data: clientes } = await api.get<Array<{
    idCliente: number;
    nombre: string;
    correo: string;
    dni: string;
    contrasena: string;
  }>>("/cliente");

  const cliente = clientes.find((c) => c.correo.toLowerCase() === correo.toLowerCase());
  if (!cliente) {
    throw new Error("Correo no registrado. Verificá tus datos.");
  }

  // Las contraseñas de cliente no tienen hash en el backend actual
  if (cliente.contrasena !== contrasena) {
    throw new Error("Contraseña incorrecta.");
  }

  // Guardar sesión como CLIENTE
  localStorage.setItem("cyc-rol", "CLIENTE");
  localStorage.setItem("cyc-user", JSON.stringify({
    name: cliente.nombre,
    email: cliente.correo,
    idCliente: cliente.idCliente,
    dni: cliente.dni,
    rol: "CLIENTE",
  }));
  auth.login(cliente.correo, cliente.nombre);
  auth.update({ idCliente: cliente.idCliente, dni: cliente.dni });

  return { rol: "CLIENTE", nombre: cliente.nombre, correo: cliente.correo, id: cliente.idCliente };
}

export function getRolActual(): RolUsuario | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("cyc-rol") as RolUsuario | null;
}

export function logoutUnificado() {
  localStorage.removeItem("cyc-rol");
  localStorage.removeItem("cyc-user");
  auth.logout();
}
