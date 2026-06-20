import { api } from "./api";
import type {
  CreateUserPayload,
  PainelUsuario,
  RolesData,
  RolesResponse,
  UpdateUserPayload,
  UserResponse,
  UsersListResponse,
} from "../types/PainelUsuarioTypes";

// Lista os usuários disponíveis no escopo do token autenticado.
export async function listUsers(): Promise<PainelUsuario[]> {
  const response = await api.get<UsersListResponse>("/users");

  return response.data.data;
}

// Lista usuÃ¡rios inativos no escopo do token autenticado.
export async function listInactiveUsers(): Promise<PainelUsuario[]> {
  const response = await api.get<UsersListResponse>("/inactive-users");

  return response.data.data;
}

// Carrega os papéis de sistema e de paróquia disponibilizados pela API.
export async function listRoles(): Promise<RolesData> {
  const response = await api.get<RolesResponse>("/roles");

  return response.data.data;
}

// Cria um usuário paroquial ou um administrador da diocese.
// Para usuários paroquiais, parish_ids define as paróquias vinculadas.
export async function createUser(
  payload: CreateUserPayload,
): Promise<PainelUsuario> {
  const response = await api.post<UserResponse>("/users", payload);

  return response.data.data;
}

// Atualiza os dados básicos de um usuário.
export async function updateUser(
  userId: number,
  payload: UpdateUserPayload,
): Promise<PainelUsuario> {
  const response = await api.patch<UserResponse>(
    `/users/${userId}`,
    payload,
  );

  return response.data.data;
}

export async function inactivateUser(userId: number): Promise<void> {
  await api.patch(`/users/${userId}/inactivate`);
}

export async function activateUser(userId: number): Promise<PainelUsuario> {
  const response = await api.patch<UserResponse>(`/users/${userId}/activate`);

  return response.data.data;
}
