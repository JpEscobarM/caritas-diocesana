import { api } from "./api";
import { Family } from "../types/types";
import { CreateFamilyRequest } from "../types/nucleoFamiliarTypes";


type FamiliesResponse = {
  data: Family[];
};

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

export async function getInactiveFamilies(all = false): Promise<Family[]> {
  const apiResponse = await api.get<FamiliesResponse>("/inactive-families", {
    params: {
      all,
    },
  });

  return apiResponse.data.data ?? [];
}

export async function inactivateFamily(familyId: number) {
  const apiResponse = await api.patch(`/families/${familyId}/inactivate`);
  return apiResponse.data;
}

export async function activateFamily(familyId: number) {
  const apiResponse = await api.patch(`/families/${familyId}/activate`);
  return apiResponse.data;
}