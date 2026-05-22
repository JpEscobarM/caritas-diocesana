import { api } from "./api";

import type {
  ApiResponse,
  CreateParishInput,
  Parish,
  UpdateParishInput,
} from "../types/types";


// ---- Lista todas as paroquias ----
// Chama o endpoint GET /parishes
// Rertorna um array de paroquias
export async function listParishes(): Promise<Parish[]> {
  const response = await api.get<ApiResponse<Parish[]>>("/parishes");

  return response.data.data;
}
//------------------------------------


// ---- Cadastra uma nova paroquia ----
// Chama o endpoint POST /parishes
// Recebe os dados da paroquia no formato CreateParishInput
// Retorna a paroquia criada
export async function createParish(input: CreateParishInput): Promise<Parish> {
  const response = await api.post<ApiResponse<Parish>>("/parishes", input);

  return response.data.data;
}
//---------------------------------


// ---- Atualiza uma paroquia existente ----
// Chama o endpoint PATCH /parishes/{id}
// Recebe o ID da paroquia e os dados que serão alterados no formato UpdateParishInput
// Retorna a paroquia atualizada
export async function updateParish(parishId: number, input: UpdateParishInput): Promise<Parish> {
  const response = await api.patch<ApiResponse<Parish>>(`/parishes/${parishId}`, input);

  return response.data.data;
}
//---------------------------------


// ---- Inativa uma paroquia ----
// Chama o endpoint PATCH /parishes/{id} enviando active: false
// Apenas INATIVA a paroquia, não a deleta do banco de dados
// Retorna a paroquia inativada
export async function inactivateParish(parishId: number): Promise<Parish> {
  return updateParish(parishId, {
    active: false,
  });
}
//---------------------------------
