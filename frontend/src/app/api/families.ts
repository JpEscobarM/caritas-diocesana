import { api } from "./api";
import { Family } from "../types/types";
import { CreateFamilyRequest } from "../types/nucleoFamiliarTypes";

export async function getFamiliesFromParish(
  parishName: string,
): Promise<Family[]> {
  const response = await api.get<{ data: Family[] }>("/families", {
    params: {
      search: parishName,
      all: false,
    },
  });

  return response.data.data ?? [];
}

export async function createFamily(payload: CreateFamilyRequest) {
  const apiResponse = await api.post("/families", payload);

  return apiResponse.data;
}