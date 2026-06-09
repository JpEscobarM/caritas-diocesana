import { api } from "./api";
import type { Family, Parish } from "../types/types";
import type { HomeVisit } from "../components/VisitaDomiciliar/types";

type CollectionResponse<T> =
  | T[]
  | {
      data?: T[] | { data?: T[] };
    };

function extractCollection<T>(responseData: CollectionResponse<T>): T[] {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (Array.isArray(responseData.data)) {
    return responseData.data;
  }

  if (
    responseData.data &&
    !Array.isArray(responseData.data) &&
    Array.isArray(responseData.data.data)
  ) {
    return responseData.data.data;
  }

  return [];
}

export async function listDioceseParishes(): Promise<Parish[]> {
  const response = await api.get<CollectionResponse<Parish>>("/parishes");
  return extractCollection<Parish>(response.data);
}

export async function listDioceseFamilies(): Promise<Family[]> {
  const response = await api.get<CollectionResponse<Family>>("/families", {
    params: {
      all: true,
    },
  });

  return extractCollection<Family>(response.data);
}

export async function listDioceseInactiveFamilies(): Promise<Family[]> {
  const response = await api.get<CollectionResponse<Family>>(
    "/inactive-families",
    {
      params: {
        all: true,
      },
    },
  );

  return extractCollection<Family>(response.data);
}

export async function listDioceseRecentHomeVisits(): Promise<HomeVisit[]> {
  const response = await api.get<CollectionResponse<HomeVisit>>("/home-visits", {
    params: {
      all: true,
    },
  });

  return extractCollection<HomeVisit>(response.data);
}

export async function listDioceseHomeVisitsHistory(): Promise<HomeVisit[]> {
  const response = await api.get<CollectionResponse<HomeVisit>>(
    "/home-visits/history",
    {
      params: {
        all: true,
      },
    },
  );

  return extractCollection<HomeVisit>(response.data);
}