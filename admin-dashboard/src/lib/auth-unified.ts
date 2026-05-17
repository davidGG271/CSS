import { api } from "./api";
import { auth } from "./auth-store";

// Estructura del Admin según el backend
export interface AdminBackend {
  id: number;
  nombre: string;
  correo: string;
  contrasena?: string; // puede venir del backend si no está oculto
}

export async function findAdminByCorreo(correo: string, contrasena: string): Promise<AdminBackend | null> {
  try {
    const { data } = await api.post<AdminBackend>("/admin/login", { correo, contrasena });
    return data;
  } catch {
    return null; // Si da 401 Unauthorized u otro error, devolvemos null
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
  // 1. Verificar si es Admin (con validación de contraseña si el backend la devuelve)
  const admin = await findAdminByCorreo(correo, contrasena);
  if (admin) {
    // Guardar sesión como ADMIN en el store
    auth.login(admin.correo, admin.nombre);
    (auth as any)._setRol?.("ADMIN"); // extensión del store si existe
    localStorage.setItem("cyc-rol", "ADMIN");
    localStorage.setItem("cyc-user", JSON.stringify({
      id: admin.id,
      name: admin.nombre,
      email: admin.correo,
      rol: "ADMIN",
    }));
    return { rol: "ADMIN", nombre: admin.nombre, correo: admin.correo, id: admin.id };
  }

  // 2. Verificar si es Cliente
  try {
    const { data: clienteResult } = await api.post<{
      idCliente: number;
      nombre: string;
      correo: string;
      dni: string;
      message: string;
    }>("/cliente/login", { correo, contrasena });

    // Guardar sesión como CLIENTE
    localStorage.setItem("cyc-rol", "CLIENTE");
    localStorage.setItem("cyc-user", JSON.stringify({
      name: clienteResult.nombre,
      email: clienteResult.correo,
      idCliente: clienteResult.idCliente,
      dni: clienteResult.dni,
      rol: "CLIENTE",
    }));
    auth.login(clienteResult.correo, clienteResult.nombre);
    auth.update({ idCliente: clienteResult.idCliente, dni: clienteResult.dni });

    return { rol: "CLIENTE", nombre: clienteResult.nombre, correo: clienteResult.correo, id: clienteResult.idCliente };
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error("Correo o contraseña incorrectos.");
    }
    throw new Error(error.response?.data?.message || "Error al conectar con el servidor.");
  }
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
