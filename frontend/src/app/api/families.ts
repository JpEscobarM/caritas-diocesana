// src/app/api/families.ts

import { api } from "./api";
import type { Family, AssistedFamilyMember } from "../types/types";
import type {
  CreateFamilyRequest,
  CreateFamilyResponsibleRequest,
  UpdateAssistedFamilyMemberRequest,
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
  const response = await api.post("/families", payload);
  return response.data;
}

export async function getInactiveFamilies(all = false): Promise<Family[]> {
  const response = await api.get<FamiliesResponse>("/inactive-families", {
    params: {
      all,
    },
  });

  return response.data.data ?? [];
}

export async function inactivateFamily(familyId: number) {
  const response = await api.patch(`/families/${familyId}/inactivate`);
  return response.data;
}

export async function activateFamily(familyId: number) {
  const response = await api.patch(`/families/${familyId}/activate`);
  return response.data;
}

export async function createAssistedFamilyMember(
  familyId: number,
  payload: CreateFamilyResponsibleRequest,
): Promise<AssistedFamilyMember> {
  const response = await api.post<AssistedFamilyMemberResponse>(
    `/families/${familyId}/assisted-family-members`,
    payload,
  );

  const responseData = response.data;

  if ("data" in responseData) {
    return responseData.data;
  }

  return responseData;
}

export async function updateAssistedFamilyMember(
  assistedFamilyMemberId: number,
  payload: UpdateAssistedFamilyMemberRequest,
): Promise<AssistedFamilyMember> {
  const response = await api.patch<AssistedFamilyMemberResponse>(
    `/assisted-family-members/${assistedFamilyMemberId}`,
    payload,
  );

  const responseData = response.data;

  if ("data" in responseData) {
    return responseData.data;
  }

  return responseData;
}

export async function searchByCpf(
  cpfRequest: string,
): Promise<AssistedFamilyMember> {
  const response = await api.get(
    "/assisted-family-members/search-by-cpf",
    {
      params: {
        cpf: cpfRequest,
      },
    },
  );

  return response.data.data;
}