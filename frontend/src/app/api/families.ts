import { api } from "./api";
import { AssistedFamilyMember, Family } from "../types/types";

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
