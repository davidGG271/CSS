import { api } from "./api";

export interface ClienteBackend {
  idCliente: number;
  nombre: string;
  dni: string;
  correo: string;
}

export interface CreateClienteInput {
  nombre: string;
  dni: string;
  correo: string;
  contrasena: string;
}

export interface LoginClienteInput {
  correo: string;
  contrasena: string;
}

export interface UpdateClienteInput {
  nombre?: string;
  dni?: string;
  correo?: string;
  contrasena?: string;
}

export interface LoginClienteResponse extends ClienteBackend {
  message: string;
}

export async function createCliente(input: CreateClienteInput) {
  const { data } = await api.post<ClienteBackend>("/cliente", input);
  return data;
}

export async function loginCliente(input: LoginClienteInput) {
  const { data } = await api.post<LoginClienteResponse>("/cliente/login", input);
  return data;
}

export async function updateCliente(idCliente: number, input: UpdateClienteInput) {
  const { data } = await api.patch<ClienteBackend>(`/cliente/${idCliente}`, input);
  return data;
}

export async function getClientes() {
  const { data } = await api.get<ClienteBackend[]>("/cliente");
  return data;
}

export async function findClienteByCorreo(correo: string) {
  const clientes = await getClientes();
  return clientes.find((cliente) => cliente.correo.toLowerCase() === correo.toLowerCase()) ?? null;
}
