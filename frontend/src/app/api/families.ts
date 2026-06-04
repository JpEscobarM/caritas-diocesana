// src/app/api/families.ts
import { api } from "./api";
import type { Family, AssistedFamilyMember } from "../types/types";
import type {
  CreateFamilyRequest,
  CreateFamilyResponsibleRequest,
} from "../types/nucleoFamiliarTypes";

type FamiliesResponse = {
  data: Family[];
};

type AssistedFamilyMemberResponse =
  | AssistedFamilyMember
  | {
      data: AssistedFamilyMember;
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

export async function createAssistedFamilyMember(
  familyId: number,
  payload: CreateFamilyResponsibleRequest,
): Promise<AssistedFamilyMember> {
  const apiResponse = await api.post<AssistedFamilyMemberResponse>(
    `/families/${familyId}/assisted-family-members`,
    payload,
  );

  const responseData = apiResponse.data;

  if ("data" in responseData) {
    return responseData.data;
  }

  return responseData;
}
